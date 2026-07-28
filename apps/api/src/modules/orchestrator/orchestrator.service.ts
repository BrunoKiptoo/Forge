import { Injectable } from "@nestjs/common";
import { AIService } from "../../core/ai/ai.service";
import { PromptBuilder } from "../../core/ai/prompt-builder";
import { CostTracker } from "../../core/ai/cost-tracker";
import { parseArtifacts } from "../../core/ai/artifact-parser";
import { AgentRepository } from "../../core/database/repositories";
import { ExecutionPlanRepository } from "../../core/database/repositories";
import { AgentExecutionRepository } from "../../core/database/repositories";
import { ActivityRepository } from "../../core/database/repositories";
import { ArtifactRepository } from "../../core/database/repositories";
import { AgentMessageRepository } from "../../core/database/repositories";
import { PlannerService } from "../planner/planner.service";
import { ContextService } from "../repository/context.service";
import { SandboxService } from "../../core/sandbox/sandbox.service";
import { ForgeGateway } from "../../core/gateway/forge.gateway";
import { BrowserAgentService } from "../browser/browser-agent.service";

type Step = { order: number; agentType: string; description: string; status: string; result: Record<string, unknown> };
type Plan = { _id: unknown; steps: Step[] };

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly agentRepository: AgentRepository,
    private readonly planRepository: ExecutionPlanRepository,
    private readonly executionRepository: AgentExecutionRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly artifactRepository: ArtifactRepository,
    private readonly agentMessageRepository: AgentMessageRepository,
    private readonly plannerService: PlannerService,
    private readonly aiService: AIService,
    private readonly promptBuilder: PromptBuilder,
    private readonly contextService: ContextService,
    private readonly sandbox: SandboxService,
    private readonly gateway: ForgeGateway,
    private readonly browserAgent: BrowserAgentService,
  ) {}

  async preview(taskId: string, taskTitle: string, taskDescription: string) {
    return this.plannerService.createPlan(taskId, taskTitle, taskDescription);
  }

  async orchestrate(
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    organizationId: string,
    repoFullName?: string,
  ) {
    const { plan, costMeta } = await this.plannerService.createPlan(taskId, taskTitle, taskDescription);

    await this.planRepository.update(String(plan._id), { status: "running" } as Record<string, unknown>);
    await this.activityRepository.create({
      organizationId, action: "orchestration.started", entityType: "execution_plan",
      entityId: String(plan._id), metadata: {
        taskId, steps: plan.steps.length, repoFullName,
        ...costMeta,
        provider: costMeta.provider || this.aiService.getProvider().name,
        model: costMeta.model || this.aiService.getProvider().defaultModel,
      },
    });

    void this.executeSteps(plan, organizationId, taskId, taskTitle, taskDescription, repoFullName);
    return plan;
  }

  private async executeSteps(
    plan: Plan,
    organizationId: string,
    taskId: string,
    taskTitle: string,
    taskDescription: string,
    repoFullName?: string,
  ) {
    let repoContext: string | undefined;
    let citedFiles: string[] = [];

    if (repoFullName) {
      try {
        const ctx = await this.contextService.buildContext(
          organizationId, repoFullName, `${taskTitle} ${taskDescription}`, 5,
        );
        repoContext = ctx.context;
        citedFiles = ctx.files;
      } catch {
        // Repository not indexed yet — proceed without context
      }
    }

    let previousAgentType: string | null = null;

    for (const step of plan.steps) {
      const agent = await this.agentRepository.findAvailable(organizationId, step.agentType);
      if (!agent) {
        await this.planRepository.updateStepStatus(String(plan._id), step.order, "failed", { error: `No ${step.agentType} agent available` });
        await this.planRepository.update(String(plan._id), { status: "failed" } as Record<string, unknown>);
        return;
      }

      // Log inter-agent handoff message
      if (previousAgentType) {
        const msg = await this.agentMessageRepository.create({
          organizationId,
          taskId,
          sender: previousAgentType,
          receiver: step.agentType,
          message: `Handing off to ${step.agentType}: ${step.description}`,
          metadata: { planId: String(plan._id), stepOrder: step.order },
        });
        this.gateway.emit(`org:${organizationId}`, "agent.message", msg);
      }

      await this.agentRepository.updateStatus(String(agent._id), "busy", taskId);
      const execution = await this.executionRepository.create({
        taskId, agentId: String(agent._id), organizationId, status: "running", logs: [], result: {},
      });

      const messages = this.promptBuilder.build(
        step.agentType,
        `${taskTitle}\n${taskDescription}`,
        { step: step.description },
        repoContext,
      );

      try {
        const response = await this.aiService.generate(messages, { temperature: 0.3, maxTokens: 4096 });

        const artifacts = parseArtifacts(response.content, step.agentType);
        for (const art of artifacts) {
          await this.artifactRepository.create({
            taskId, organizationId, agentId: String(agent._id),
            filename: art.filename, language: art.language, content: art.content,
            metadata: { stepOrder: step.order, citedFiles },
          });
        }

        await this.executionRepository.update(String(execution._id), {
          status: "completed", finishedAt: new Date(),
          logs: [response.content.slice(0, 500)],
          result: { ...response.usage, artifactsCount: artifacts.length, citedFiles },
        } as Record<string, unknown>);

          this.gateway.emit(`org:${organizationId}`, "task.updated", { taskId, stepOrder: step.order, agentType: step.agentType, status: "completed" });

        await this.planRepository.updateStepStatus(String(plan._id), step.order, "completed", {
          output: response.content.slice(0, 200), filesCount: artifacts.length,
          citedFiles,
          ...CostTracker.createMetadata(
            agent.provider || this.aiService.getProvider().name,
            agent.model || this.aiService.getProvider().defaultModel,
            response,
          ),
        });

        // After testing agent — run real tests in sandbox
        if (step.agentType === "testing") {
          try {
            const sandboxResult = await this.sandbox.exec("pnpm test --passWithNoTests 2>&1 || true");
            const sandboxLogs = sandboxResult.logs.slice(0, 50);
            await this.executionRepository.update(String(execution._id), {
              logs: [response.content.slice(0, 500), "--- sandbox ---", ...sandboxLogs],
            } as Record<string, unknown>);
          } catch {
            // Sandbox failure is non-fatal
          }
        }

        // Browser agent — parse AI actions and run headless session
        if (step.agentType === "browser") {
          try {
            const actions = JSON.parse(response.content) as import("../../core/browser/browser.service").BrowserAction[];
            const url = (actions.find((a) => a.type === "navigate")?.url) ?? "about:blank";
            await this.browserAgent.run(organizationId, url, actions.filter((a) => a.type !== "navigate"), { taskId });
          } catch {
            // Browser step failure is non-fatal
          }
        }

        previousAgentType = step.agentType;
      } catch (err) {
        await this.executionRepository.update(String(execution._id), {
          status: "failed", finishedAt: new Date(), result: { error: String(err) },
        } as Record<string, unknown>);
        await this.planRepository.updateStepStatus(String(plan._id), step.order, "failed", { error: String(err) });
        await this.planRepository.update(String(plan._id), { status: "failed" } as Record<string, unknown>);
        this.gateway.emit(`org:${organizationId}`, "task.updated", { taskId, stepOrder: step.order, agentType: step.agentType, status: "failed" });
        await this.agentRepository.updateStatus(String(agent._id), "idle", null);
        return;
      }

      await this.agentRepository.updateStatus(String(agent._id), "idle", null);
      await this.activityRepository.create({
        organizationId, action: `agent.${step.agentType}.completed`, entityType: "agent_execution",
        entityId: String(execution._id), metadata: { agentName: agent.name, step: step.description, citedFiles },
      });
    }

    const updatedPlan = await this.planRepository.findByTaskId(taskId);
    if (updatedPlan?.steps.every((s) => s.status === "completed")) {
      await this.planRepository.update(String(plan._id), { status: "completed" } as Record<string, unknown>);
    }
  }
}
