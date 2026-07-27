import { Injectable } from "@nestjs/common";
import { AIService } from "../../core/ai/ai.service";
import { PromptBuilder } from "../../core/ai/prompt-builder";
import { CostTracker } from "../../core/ai/cost-tracker";
import { ExecutionPlanRepository } from "../../core/database/repositories";

@Injectable()
export class PlannerService {
  constructor(
    private readonly planRepository: ExecutionPlanRepository,
    private readonly aiService: AIService,
    private readonly promptBuilder: PromptBuilder,
  ) {}

  async createPlan(taskId: string, taskTitle: string, taskDescription: string) {
    const messages = this.promptBuilder.build(
      "planner",
      `${taskTitle}\n${taskDescription}`,
    );

    const response = await this.aiService.generate(messages, {
      temperature: 0.2,
      maxTokens: 2048,
    });

    let steps: { order: number; agentType: string; description: string; status: string; result: Record<string, unknown> }[];

    try {
      const parsed = JSON.parse(response.content);
      if (Array.isArray(parsed)) {
        steps = parsed.map((s: { order: number; agentType: string; description: string }, i: number) => ({
          order: s.order ?? i,
          agentType: s.agentType ?? "backend",
          description: s.description ?? "Execute step",
          status: "pending",
          result: {},
        }));
      } else {
        steps = this.fallbackSteps(taskTitle, taskDescription);
      }
    } catch {
      steps = this.fallbackSteps(taskTitle, taskDescription);
    }

    const plan = await this.planRepository.create({
      taskId,
      steps,
      status: "pending",
    });

    const costMeta = CostTracker.createMetadata(
      this.aiService.getProvider().name,
      this.aiService.getProvider().defaultModel,
      response,
    );

    return { plan, costMeta };
  }

  private fallbackSteps(title: string, description: string) {
    const text = `${title} ${description}`.toLowerCase();
    const steps: { order: number; agentType: string; description: string; status: string; result: Record<string, unknown> }[] = [];

    if (text.includes("backend") || text.includes("api") || text.includes("auth") || text.includes("database")) {
      steps.push({ order: 0, agentType: "backend", description: "Implement backend logic and API endpoints", status: "pending", result: {} });
    }
    if (text.includes("frontend") || text.includes("ui") || text.includes("page") || text.includes("component")) {
      steps.push({ order: steps.length, agentType: "frontend", description: "Build frontend UI components and pages", status: "pending", result: {} });
    }
    if (steps.length === 0) {
      steps.push({ order: 0, agentType: "backend", description: `Implement: ${title}`, status: "pending", result: {} });
    }

    steps.push({ order: steps.length, agentType: "testing", description: "Write and run tests for all components", status: "pending", result: {} });
    steps.push({ order: steps.length, agentType: "reviewer", description: "Review code quality, security, and performance", status: "pending", result: {} });

    return steps;
  }
}
