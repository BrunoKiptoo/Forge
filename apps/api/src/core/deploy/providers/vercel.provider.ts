import { Injectable } from "@nestjs/common";
import type { DeploymentProvider, DeploymentConfig, DeploymentFile, DeploymentResult } from "../interfaces/provider.interface";

const VERCEL_API = "https://api.vercel.com";

@Injectable()
export class VercelProvider implements DeploymentProvider {
  readonly name = "vercel";

  async deploy(config: DeploymentConfig, files: DeploymentFile[], meta: { name: string; branch: string }): Promise<DeploymentResult> {
    const qs = config.teamId ? `?teamId=${config.teamId}` : "";

    const body: Record<string, unknown> = {
      name: meta.name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      target: "preview",
      gitSource: undefined,
      files: files.map((f) => ({
        file: f.path,
        data: f.content,
        encoding: "utf-8",
      })),
      projectSettings: {
        framework: null,
      },
      meta: { branch: meta.branch, source: "forge" },
    };

    if (config.projectId) body["project"] = config.projectId;

    const res = await fetch(`${VERCEL_API}/v13/deployments${qs}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(`Vercel deploy failed: ${(err.error as Record<string, unknown>)?.message ?? res.statusText}`);
    }

    const data = await res.json() as Record<string, unknown>;
    return this.mapResult(data);
  }

  async getStatus(config: DeploymentConfig, deploymentId: string): Promise<DeploymentResult> {
    const qs = config.teamId ? `?teamId=${config.teamId}` : "";
    const res = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}${qs}`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });

    if (!res.ok) throw new Error(`Vercel status check failed: ${res.statusText}`);
    const data = await res.json() as Record<string, unknown>;
    return this.mapResult(data);
  }

  async cancel(config: DeploymentConfig, deploymentId: string): Promise<void> {
    const qs = config.teamId ? `?teamId=${config.teamId}` : "";
    await fetch(`${VERCEL_API}/v12/deployments/${deploymentId}/cancel${qs}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${config.token}` },
    });
  }

  private mapResult(data: Record<string, unknown>): DeploymentResult {
    const state = String(data.readyState ?? data.state ?? "QUEUED").toUpperCase();
    const statusMap: Record<string, DeploymentResult["status"]> = {
      QUEUED: "queued", INITIALIZING: "queued", BUILDING: "building",
      READY: "ready", ERROR: "error", CANCELED: "cancelled",
    };
    return {
      id: String(data.id ?? data.uid ?? ""),
      url: data.url ? `https://${data.url}` : null,
      status: statusMap[state] ?? "queued",
      provider: "vercel",
      raw: data,
    };
  }
}
