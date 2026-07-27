import { Injectable, NotFoundException } from "@nestjs/common";
import { GoalRepository } from "../../core/database/repositories";
import { TaskRepository } from "../../core/database/repositories";
import { ActivityRepository } from "../../core/database/repositories";
import { AgentMessageRepository } from "../../core/database/repositories";
import { PlannerService } from "../planner/planner.service";
import { MemoryService } from "../workspace/memory.service";
import type { GoalPriority } from "../../core/database/schemas";

interface CreateGoalDto {
  workspaceId: string;
  organizationId: string;
  projectId: string;
  createdBy: string;
  title: string;
  description?: string;
  objective?: string;
  successCriteria?: string[];
  priority?: GoalPriority;
  deadline?: string;
}

@Injectable()
export class GoalService {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly taskRepository: TaskRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly agentMessageRepository: AgentMessageRepository,
    private readonly plannerService: PlannerService,
    private readonly memoryService: MemoryService,
  ) {}

  async create(dto: CreateGoalDto) {
    const goal = await this.goalRepository.create({
      workspaceId: dto.workspaceId,
      organizationId: dto.organizationId,
      title: dto.title,
      description: dto.description ?? "",
      objective: dto.objective ?? "",
      successCriteria: dto.successCriteria ?? [],
      priority: dto.priority ?? "medium",
      status: "active",
      taskIds: [],
      deadline: dto.deadline ? new Date(dto.deadline) : null,
    });

    await this.activityRepository.create({
      organizationId: dto.organizationId,
      action: "goal.created",
      entityType: "goal",
      entityId: String(goal._id),
      metadata: { title: dto.title, workspaceId: dto.workspaceId },
    });

    // Auto-decompose into tasks in the background
    void this.decompose(goal, dto);

    return goal;
  }

  private async decompose(goal: { _id: unknown }, dto: CreateGoalDto) {
    try {
      // Inject workspace memory into planning context
      const memoryContext = await this.memoryService.getContext(dto.workspaceId);
      const fullDescription = [
        dto.description ?? "",
        dto.objective ? `Objective: ${dto.objective}` : "",
        dto.successCriteria?.length ? `Success criteria:\n${dto.successCriteria.map((c) => `- ${c}`).join("\n")}` : "",
        memoryContext,
      ].filter(Boolean).join("\n\n");

      const { plan } = await this.plannerService.createPlan(
        String(goal._id),
        dto.title,
        fullDescription,
      );

      // Create a Task per plan step
      const taskIds: string[] = [];
      for (const step of plan.steps) {
        const task = await this.taskRepository.create({
          organizationId: dto.organizationId,
          projectId: dto.projectId,
          title: `[${step.agentType}] ${step.description}`,
          description: `Auto-generated from goal: ${dto.title}\n\nStep ${step.order + 1}: ${step.description}`,
          priority: dto.priority ?? "medium",
          status: "queued",
          createdBy: dto.createdBy,
          assignedAgent: null,
          metadata: { goalId: String(goal._id), stepOrder: step.order, agentType: step.agentType },
        });
        taskIds.push(String(task._id));

        // Log planner → agent message
        await this.agentMessageRepository.create({
          organizationId: dto.organizationId,
          taskId: task._id,
          sender: "planner",
          receiver: step.agentType,
          message: step.description,
          metadata: { goalId: String(goal._id), stepOrder: step.order },
        });
      }

      await this.goalRepository.update(String(goal._id), {
        taskIds,
        status: "in_progress",
      } as Record<string, unknown>);

      // Store decomposition as a memory entry
      await this.memoryService.upsert(
        dto.workspaceId,
        dto.organizationId,
        "ai_decision",
        `goal_decomposition_${String(goal._id)}`,
        `Goal "${dto.title}" decomposed into ${taskIds.length} tasks: ${plan.steps.map((s) => s.agentType).join(", ")}`,
        { goalId: String(goal._id), planId: String(plan._id) },
      );
    } catch {
      await this.goalRepository.update(String(goal._id), { status: "failed" } as Record<string, unknown>);
    }
  }

  findByWorkspace(workspaceId: string) {
    return this.goalRepository.findByWorkspace(workspaceId);
  }

  async findById(id: string) {
    const goal = await this.goalRepository.findById(id);
    if (!goal) throw new NotFoundException("Goal not found");
    return goal;
  }

  async update(id: string, data: Record<string, unknown>) {
    const goal = await this.goalRepository.update(id, data);
    if (!goal) throw new NotFoundException("Goal not found");
    return goal;
  }

  remove(id: string) {
    return this.goalRepository.softDelete(id);
  }
}
