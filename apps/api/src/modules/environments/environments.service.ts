import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { EnvironmentRepository } from "../../core/database/repositories";
import { DeploymentRepository } from "../../core/database/repositories";
import { WorkspaceRepository } from "../../core/database/repositories";
import { ApprovalRepository } from "../../core/database/repositories";
import { DeploymentService } from "../deployments/deployment.service";
import { ForgeGateway } from "../../core/gateway/forge.gateway";
import { ENVIRONMENT_NAMES, ENVIRONMENT_ORDER } from "../../core/database/schemas";

@Injectable()
export class EnvironmentsService {
  constructor(
    private readonly environmentRepository: EnvironmentRepository,
    private readonly deploymentRepository: DeploymentRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly approvalRepository: ApprovalRepository,
    private readonly deploymentService: DeploymentService,
    private readonly gateway: ForgeGateway,
  ) {}

  async provision(workspaceId: string, organizationId: string) {
    const existing = await this.environmentRepository.findByWorkspace(workspaceId);
    if (existing.length > 0) return existing;

    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) throw new NotFoundException("Workspace not found");

    const envs = await Promise.all(
      ENVIRONMENT_NAMES.map((name) =>
        this.environmentRepository.create({
          organizationId: organizationId as never,
          workspaceId: workspaceId as never,
          name,
          order: ENVIRONMENT_ORDER[name],
          branch: name === "production" ? "main" : name === "staging" ? "staging" : name === "test" ? "test" : "dev",
          deployTarget: workspace.deploymentTarget || "",
          deployConfig: workspace.aiConfiguration as Record<string, unknown>,
          requiresApproval: name === "staging" || name === "production",
        }),
      ),
    );

    return envs;
  }

  async findByWorkspace(workspaceId: string) {
    const envs = await this.environmentRepository.findByWorkspace(workspaceId);
    // Attach latest deployment info to each env
    return Promise.all(
      envs.map(async (env) => {
        const deployments = await this.deploymentRepository.findByEnvironment(String(env._id), 1);
        return { ...env, latestDeployment: deployments[0] ?? null };
      }),
    );
  }

  async deploy(environmentId: string, organizationId: string, taskId?: string) {
    const env = await this.environmentRepository.findById(environmentId);
    if (!env) throw new NotFoundException("Environment not found");

    if (!env.deployTarget) throw new BadRequestException("Environment has no deployTarget configured");

    // Build a temporary workspace-like config from env.deployConfig
    const deployment = await this.deploymentService.deployToEnvironment(
      organizationId,
      String(env.workspaceId),
      environmentId,
      env.branch,
      env.deployTarget,
      env.deployConfig,
      taskId,
    );

    // Save previous before updating current
    await this.environmentRepository.update(environmentId, {
      status: "deploying",
      previousDeploymentId: env.currentDeploymentId,
      currentDeploymentId: deployment._id as never,
    });

    this.gateway.emit(`workspace:${env.workspaceId}`, "environment.updated", { environmentId, status: "deploying" });

    return deployment;
  }

  async promote(fromEnvId: string, organizationId: string, requestedBy: string) {
    const fromEnv = await this.environmentRepository.findById(fromEnvId);
    if (!fromEnv) throw new NotFoundException("Source environment not found");

    // Find the next environment in the pipeline
    const allEnvs = await this.environmentRepository.findByWorkspace(String(fromEnv.workspaceId));
    const toEnv = allEnvs.find((e) => e.order === fromEnv.order + 1);
    if (!toEnv) throw new BadRequestException("No higher environment to promote to");

    // Gate 1: source must be ready
    if (fromEnv.status !== "ready") {
      throw new BadRequestException(`Cannot promote from ${fromEnv.name} — status is ${fromEnv.status}, must be ready`);
    }

    // Gate 2: test environment requires a ready deployment (tests passed)
    if (toEnv.name === "test") {
      const lastReady = await this.deploymentRepository.findLastReady(fromEnvId);
      if (!lastReady) throw new BadRequestException("No successful deployment in dev to promote");
    }

    // Gate 3: staging and production require a pending approval to be resolved
    if (toEnv.requiresApproval) {
      const pending = await this.approvalRepository.findPendingByTask(
        `env-promotion:${String(toEnv._id)}`,
      );
      if (pending) throw new BadRequestException(`Promotion to ${toEnv.name} is awaiting approval`);

      // Create a promotion approval request
      await this.approvalRepository.create({
        organizationId: organizationId as never,
        taskId: `env-promotion:${String(toEnv._id)}` as never,
        requestedBy: requestedBy as never,
        planSnapshot: {
          fromEnv: fromEnv.name,
          toEnv: toEnv.name,
          fromDeploymentId: String(fromEnv.currentDeploymentId),
        },
      });

      this.gateway.emit(`org:${organizationId}`, "approval.updated", {
        taskId: `env-promotion:${String(toEnv._id)}`,
        status: "pending",
        fromEnv: fromEnv.name,
        toEnv: toEnv.name,
      });

      return { status: "awaiting_approval", toEnv: toEnv.name };
    }

    // No approval needed — deploy directly to target env
    return this.deploy(String(toEnv._id), organizationId);
  }

  async approvePromotion(toEnvId: string, organizationId: string) {
    const toEnv = await this.environmentRepository.findById(toEnvId);
    if (!toEnv) throw new NotFoundException("Environment not found");

    const allEnvs = await this.environmentRepository.findByWorkspace(String(toEnv.workspaceId));
    const fromEnv = allEnvs.find((e) => e.order === toEnv.order - 1);
    if (!fromEnv) throw new BadRequestException("No source environment found");

    return this.deploy(toEnvId, organizationId);
  }

  async rollback(environmentId: string, organizationId: string) {
    const env = await this.environmentRepository.findById(environmentId);
    if (!env) throw new NotFoundException("Environment not found");
    if (!env.previousDeploymentId) throw new BadRequestException("No previous deployment to roll back to");

    const prev = await this.deploymentRepository.findById(String(env.previousDeploymentId));
    if (!prev) throw new BadRequestException("Previous deployment record not found");

    await this.environmentRepository.update(environmentId, {
      currentDeploymentId: env.previousDeploymentId,
      previousDeploymentId: env.currentDeploymentId as never,
      currentUrl: prev.url ?? null,
      status: "ready",
      lastPromotedAt: new Date(),
    });

    this.gateway.emit(`workspace:${env.workspaceId}`, "environment.updated", {
      environmentId,
      status: "ready",
      rolledBack: true,
    });
    this.gateway.emit(`org:${organizationId}`, "environment.updated", { environmentId, status: "ready" });

    return this.environmentRepository.findById(environmentId);
  }

  async markReady(environmentId: string, url: string | null) {
    const env = await this.environmentRepository.update(environmentId, {
      status: "ready",
      currentUrl: url,
      lastPromotedAt: new Date(),
    });
    if (env) {
      this.gateway.emit(`workspace:${env.workspaceId}`, "environment.updated", { environmentId, status: "ready", url });
    }
  }

  async markFailed(environmentId: string) {
    const env = await this.environmentRepository.update(environmentId, { status: "failed" });
    if (env) {
      this.gateway.emit(`workspace:${env.workspaceId}`, "environment.updated", { environmentId, status: "failed" });
    }
  }

  findById(id: string) {
    return this.environmentRepository.findById(id);
  }
}
