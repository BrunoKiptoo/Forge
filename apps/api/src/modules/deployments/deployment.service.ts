import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DeploymentRepository } from "../../core/database/repositories";
import { WorkspaceRepository } from "../../core/database/repositories";
import { ArtifactRepository } from "../../core/database/repositories";
import { EnvironmentRepository } from "../../core/database/repositories";
import { VercelProvider } from "../../core/deploy/providers/vercel.provider";
import { RailwayProvider } from "../../core/deploy/providers/railway.provider";
import type { DeploymentProvider, DeploymentConfig } from "../../core/deploy/interfaces/provider.interface";
import { ForgeGateway } from "../../core/gateway/forge.gateway";

@Injectable()
export class DeploymentService {
  constructor(
    private readonly deploymentRepository: DeploymentRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly artifactRepository: ArtifactRepository,
    private readonly vercel: VercelProvider,
    private readonly railway: RailwayProvider,
    private readonly gateway: ForgeGateway,
    private readonly environmentRepository: EnvironmentRepository,
  ) {}

  private getProvider(target: string): DeploymentProvider {
    if (target === "vercel") return this.vercel;
    if (target === "railway") return this.railway;
    throw new BadRequestException(`Unsupported deployment target: ${target}. Supported: vercel, railway`);
  }

  async deploy(organizationId: string, workspaceId: string, taskId?: string, branch = "main") {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) throw new NotFoundException("Workspace not found");

    const target = workspace.deploymentTarget;
    if (!target) throw new BadRequestException("Workspace has no deploymentTarget configured");

    const provider = this.getProvider(target);
    const aiConfig = workspace.aiConfiguration as Record<string, unknown>;

    const config: DeploymentConfig = {
      token: String(aiConfig[`${target}Token`] ?? ""),
      projectId: aiConfig[`${target}ProjectId`] ? String(aiConfig[`${target}ProjectId`]) : undefined,
      teamId: aiConfig[`${target}TeamId`] ? String(aiConfig[`${target}TeamId`]) : undefined,
      environmentId: aiConfig[`${target}EnvironmentId`] ? String(aiConfig[`${target}EnvironmentId`]) : undefined,
    };

    if (!config.token) {
      throw new BadRequestException(`Missing ${target}Token in workspace aiConfiguration`);
    }

    const files = taskId
      ? (await this.artifactRepository.findByTask(taskId)).map((a) => ({ path: a.filename, content: a.content }))
      : [];

    const record = await this.deploymentRepository.create({
      organizationId,
      workspaceId,
      taskId: taskId ?? null,
      provider: target,
      status: "queued",
      branch,
      logs: [`[${new Date().toISOString()}] Deploying to ${target}...`],
      metadata: { workspaceName: workspace.name },
    });

    const id = String(record._id);

    void this.run(id, organizationId, provider, config, files, { name: workspace.name, branch });

    return record;
  }

  async deployToEnvironment(
    organizationId: string,
    workspaceId: string,
    environmentId: string,
    branch: string,
    target: string,
    deployConfig: Record<string, unknown>,
    taskId?: string,
  ) {
    const provider = this.getProvider(target);

    const config: DeploymentConfig = {
      token: String(deployConfig[`${target}Token`] ?? deployConfig["token"] ?? ""),
      projectId: deployConfig[`${target}ProjectId`] ? String(deployConfig[`${target}ProjectId`]) : undefined,
      teamId: deployConfig[`${target}TeamId`] ? String(deployConfig[`${target}TeamId`]) : undefined,
      environmentId: deployConfig[`${target}EnvironmentId`] ? String(deployConfig[`${target}EnvironmentId`]) : undefined,
    };

    if (!config.token) throw new BadRequestException(`Missing token in environment deployConfig`);

    const files = taskId
      ? (await this.artifactRepository.findByTask(taskId)).map((a) => ({ path: a.filename, content: a.content }))
      : [];

    const record = await this.deploymentRepository.create({
      organizationId,
      workspaceId,
      environmentId,
      taskId: taskId ?? null,
      provider: target,
      status: "queued",
      branch,
      logs: [`[${new Date().toISOString()}] Deploying to ${target} (${branch})...`],
      metadata: { environmentId },
    });

    const id = String(record._id);
    void this.run(id, organizationId, provider, config, files, { name: branch, branch });

    return record;
  }

  private async run(
    id: string,
    organizationId: string,
    provider: DeploymentProvider,
    config: DeploymentConfig,
    files: { path: string; content: string }[],
    meta: { name: string; branch: string },
  ) {
    try {
      const result = await provider.deploy(config, files, meta);
      await this.deploymentRepository.update(id, {
        externalId: result.id,
        status: result.status,
        url: result.url,
      });
      await this.deploymentRepository.appendLog(id, `[${new Date().toISOString()}] Deploy triggered — id: ${result.id}`);
      this.gateway.emit(`deployment:${id}`, "deployment.updated", { id, status: result.status });
      this.gateway.emit(`org:${organizationId}`, "deployment.updated", { id, status: result.status });

      await this.poll(id, organizationId, provider, config, result.id);
    } catch (err) {
      await this.deploymentRepository.update(id, { status: "error", finishedAt: new Date() });
      await this.deploymentRepository.appendLog(id, `[${new Date().toISOString()}] Error: ${String(err)}`);
      this.gateway.emit(`deployment:${id}`, "deployment.updated", { id, status: "error" });
      this.gateway.emit(`org:${organizationId}`, "deployment.updated", { id, status: "error" });
    }
  }

  private async poll(
    id: string,
    organizationId: string,
    provider: DeploymentProvider,
    config: DeploymentConfig,
    externalId: string,
  ) {
    const terminal = new Set(["ready", "error", "cancelled"]);
    let attempts = 0;

    while (attempts < 60) {
      await new Promise((r) => setTimeout(r, 5000));
      attempts++;

      try {
        const result = await provider.getStatus(config, externalId);
        await this.deploymentRepository.update(id, { status: result.status, url: result.url });
        await this.deploymentRepository.appendLog(id, `[${new Date().toISOString()}] Status: ${result.status}${result.url ? ` — ${result.url}` : ""}`);
        this.gateway.emit(`deployment:${id}`, "deployment.updated", { id, status: result.status, url: result.url });
        this.gateway.emit(`org:${organizationId}`, "deployment.updated", { id, status: result.status, url: result.url });

        if (terminal.has(result.status)) {
          await this.deploymentRepository.update(id, { finishedAt: new Date() });
          await this.syncEnvironmentStatus(id, result.status, result.url ?? null);
          return;
        }
      } catch {
        // transient poll failure — keep trying
      }
    }

    await this.deploymentRepository.update(id, { status: "error", finishedAt: new Date() });
    await this.deploymentRepository.appendLog(id, `[${new Date().toISOString()}] Timed out waiting for deployment`);
    this.gateway.emit(`deployment:${id}`, "deployment.updated", { id, status: "error" });
    await this.syncEnvironmentStatus(id, "error", null);
  }

  private async syncEnvironmentStatus(deploymentId: string, status: string, url: string | null) {
    const deployment = await this.deploymentRepository.findById(deploymentId);
    if (!deployment?.environmentId) return;
    const envId = String(deployment.environmentId);
    const envStatus = status === "ready" ? "ready" : "failed";
    const env = await this.environmentRepository.update(envId, {
      status: envStatus as never,
      ...(url ? { currentUrl: url } : {}),
      lastPromotedAt: new Date(),
    });
    if (env) {
      this.gateway.emit(`workspace:${env.workspaceId}`, "environment.updated", { environmentId: envId, status: envStatus, url });
    }
  }

  findByWorkspace(workspaceId: string) {
    return this.deploymentRepository.findByWorkspace(workspaceId);
  }

  findByOrg(organizationId: string) {
    return this.deploymentRepository.findByOrg(organizationId);
  }

  async findById(id: string) {
    const d = await this.deploymentRepository.findById(id);
    if (!d) throw new NotFoundException("Deployment not found");
    return d;
  }
}
