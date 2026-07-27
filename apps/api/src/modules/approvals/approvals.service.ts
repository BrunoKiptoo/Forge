import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ApprovalRepository } from "../../core/database/repositories";
import { TaskRepository } from "../../core/database/repositories";
import { EnvironmentRepository } from "../../core/database/repositories";
import { ForgeGateway } from "../../core/gateway/forge.gateway";

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly approvalRepository: ApprovalRepository,
    private readonly taskRepository: TaskRepository,
    private readonly environmentRepository: EnvironmentRepository,
    private readonly gateway: ForgeGateway,
  ) {}

  async request(data: {
    organizationId: string;
    taskId: string;
    requestedBy: string;
    planSnapshot?: Record<string, unknown>;
  }) {
    const existing = await this.approvalRepository.findPendingByTask(data.taskId);
    if (existing) throw new BadRequestException("A pending approval already exists for this task");

    // Move task to review status
    await this.taskRepository.update(data.taskId, { status: "review" } as Record<string, unknown>);

    const approval = await this.approvalRepository.create({
      organizationId: data.organizationId as never,
      taskId: data.taskId as never,
      requestedBy: data.requestedBy as never,
      planSnapshot: data.planSnapshot ?? {},
    });

    this.gateway.emit(`org:${data.organizationId}`, "approval.updated", { taskId: data.taskId, status: "pending", approvalId: String(approval._id) });

    return approval;
  }

  async resolve(id: string, reviewerId: string, status: "approved" | "rejected", note?: string) {
    const approval = await this.approvalRepository.findById(id);
    if (!approval) throw new NotFoundException("Approval not found");
    if (approval.status !== "pending") throw new BadRequestException("Approval already resolved");

    const updated = await this.approvalRepository.update(id, {
      status,
      reviewerId: reviewerId as never,
      note: note ?? null,
      resolvedAt: new Date(),
    });

    const taskId = String(approval.taskId);
    const orgId = String(approval.organizationId);

    // Environment promotion approval — taskId is "env-promotion:<envId>"
    if (taskId.startsWith("env-promotion:")) {
      const toEnvId = taskId.replace("env-promotion:", "");
      if (status === "approved") {
        const env = await this.environmentRepository.findById(toEnvId);
        if (env) {
          this.gateway.emit(`org:${orgId}`, "approval.updated", { taskId, status, approvalId: id, toEnvId });
        }
      } else {
        this.gateway.emit(`org:${orgId}`, "approval.updated", { taskId, status: "rejected", approvalId: id });
      }
      return updated;
    }

    // Regular task approval — move task status
    await this.taskRepository.update(taskId, {
      status: status === "approved" ? "queued" : "planning",
    } as Record<string, unknown>);

    this.gateway.emit(`org:${orgId}`, "approval.updated", { taskId, status, approvalId: id });

    return updated;
  }

  async hasPending(taskId: string) {
    const pending = await this.approvalRepository.findPendingByTask(taskId);
    return !!pending;
  }

  findByTask(taskId: string) {
    return this.approvalRepository.findByTask(taskId);
  }

  findByOrg(organizationId: string) {
    return this.approvalRepository.findByOrg(organizationId);
  }
}
