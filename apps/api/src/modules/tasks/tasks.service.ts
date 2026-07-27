import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { TaskRepository } from "../../core/database/repositories";
import { TaskExecutionRepository } from "../../core/database/repositories";
import { ActivityRepository } from "../../core/database/repositories";
import { ApprovalsService } from "../approvals/approvals.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly executionRepository: TaskExecutionRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly approvalsService: ApprovalsService,
  ) {}

  async create(dto: CreateTaskDto & { organizationId: string; createdBy: string }) {
    const task = await this.taskRepository.create({
      organizationId: dto.organizationId,
      projectId: dto.projectId,
      title: dto.title,
      description: dto.description ?? "",
      priority: dto.priority ?? "medium",
      status: dto.status ?? "planning",
      createdBy: dto.createdBy,
      assignedAgent: dto.assignedAgent ?? null,
      metadata: {},
    });

    await this.activityRepository.create({
      organizationId: dto.organizationId,
      projectId: dto.projectId,
      userId: dto.createdBy,
      action: "task.created",
      entityType: "task",
      entityId: String(task._id),
      metadata: { title: dto.title, priority: dto.priority ?? "medium" },
    });

    return task;
  }

  async findByOrganization(organizationId: string, options?: { status?: string; projectId?: string }) {
    return this.taskRepository.findByOrganization(organizationId, options);
  }

  async findByProject(projectId: string, status?: string) {
    return this.taskRepository.findByProject(projectId, status);
  }

  async findById(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundException("Task not found");
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundException("Task not found");

    const updated = await this.taskRepository.update(id, dto as Record<string, unknown>);

    await this.activityRepository.create({
      organizationId: String(task.organizationId),
      projectId: String(task.projectId),
      userId,
      action: "task.updated",
      entityType: "task",
      entityId: id,
      metadata: { changes: dto },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundException("Task not found");

    await this.activityRepository.create({
      organizationId: String(task.organizationId),
      projectId: String(task.projectId),
      userId,
      action: "task.deleted",
      entityType: "task",
      entityId: id,
    });

    return this.taskRepository.softDelete(id);
  }

  async assign(taskId: string, agentId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundException("Task not found");

    const updated = await this.taskRepository.update(taskId, {
      assignedAgent: agentId,
      status: "queued",
    } as Record<string, unknown>);

    await this.activityRepository.create({
      organizationId: String(task.organizationId),
      projectId: String(task.projectId),
      userId,
      action: "task.assigned",
      entityType: "task",
      entityId: taskId,
      metadata: { agentId },
    });

    return updated;
  }

  async execute(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) throw new NotFoundException("Task not found");

    if (task.status !== "queued" && task.status !== "planning") {
      throw new BadRequestException("Task must be in queued or planning status to execute");
    }

    const hasPending = await this.approvalsService.hasPending(taskId);
    if (hasPending) {
      throw new BadRequestException("Task has a pending approval — approve or reject it before executing");
    }

    await this.taskRepository.update(taskId, {
      status: "running",
    } as Record<string, unknown>);

    const execution = await this.executionRepository.create({
      taskId,
      organizationId: String(task.organizationId),
      status: "running",
      startedAt: new Date(),
      logs: [`[${new Date().toISOString()}] Execution started for task: ${task.title}`],
      result: {},
    });

    await this.activityRepository.create({
      organizationId: String(task.organizationId),
      projectId: String(task.projectId),
      userId,
      action: "execution.started",
      entityType: "execution",
      entityId: String(execution._id),
    });

    this.mockRunExecution(String(execution._id), taskId, String(task.organizationId));

    return execution;
  }

  async getExecutions(taskId: string) {
    return this.executionRepository.findByTask(taskId);
  }

  async getStats(organizationId: string) {
    const [running, completed, failed, completedToday] = await Promise.all([
      this.taskRepository.countByStatus(organizationId, ["running"]),
      this.taskRepository.countByStatus(organizationId, ["completed"]),
      this.taskRepository.countByStatus(organizationId, ["failed"]),
      this.taskRepository.countCompletedToday(organizationId),
    ]);

    return { running, completed, failed, completedToday, total: running + completed + failed };
  }

  private async mockRunExecution(executionId: string, taskId: string, organizationId: string) {
    const delay = 2000 + Math.random() * 3000;

    setTimeout(async () => {
      try {
        const logs: string[] = [
          `[${new Date().toISOString()}] Analyzing task requirements...`,
          `[${new Date(Date.now() + 1000).toISOString()}] Generating implementation plan...`,
          `[${new Date(Date.now() + 2000).toISOString()}] Writing code...`,
          `[${new Date(Date.now() + 3000).toISOString()}] Running tests...`,
        ];

        const success = Math.random() > 0.3;
        const finishedAt = new Date();
        const duration = finishedAt.getTime() - new Date(Date.now() - delay).getTime();

        if (success) {
          logs.push(`[${finishedAt.toISOString()}] Execution completed successfully`);
          await this.executionRepository.update(executionId, {
            status: "completed",
            finishedAt,
            duration,
            logs: [...logs],
            result: { message: "Task completed successfully", filesChanged: Math.floor(Math.random() * 10) + 1 },
          } as Record<string, unknown>);
          await this.taskRepository.update(taskId, { status: "completed" } as Record<string, unknown>);
        } else {
          logs.push(`[${finishedAt.toISOString()}] Execution failed: test assertion error`);
          await this.executionRepository.update(executionId, {
            status: "failed",
            finishedAt,
            duration,
            logs: [...logs],
            result: { error: "Test assertion failed in module auth.service.spec.ts" },
          } as Record<string, unknown>);
          await this.taskRepository.update(taskId, { status: "failed" } as Record<string, unknown>);
        }

        await this.activityRepository.create({
          organizationId,
          action: success ? "execution.completed" : "execution.failed",
          entityType: "execution",
          entityId: executionId,
          metadata: { taskId, success, duration },
        });
      } catch {
        // Mock execution failure is acceptable
      }
    }, delay);
  }
}
