import { Injectable } from "@nestjs/common";
import type { DeploymentProvider, DeploymentConfig, DeploymentFile, DeploymentResult } from "../interfaces/provider.interface";

const RAILWAY_API = "https://backboard.railway.app/graphql/v2";

@Injectable()
export class RailwayProvider implements DeploymentProvider {
  readonly name = "railway";

  private async gql<T>(token: string, query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(RAILWAY_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) throw new Error(`Railway API error: ${res.statusText}`);
    const json = await res.json() as { data?: T; errors?: { message: string }[] };
    if (json.errors?.length) throw new Error(`Railway GQL error: ${json.errors[0]!.message}`);
    return json.data as T;
  }

  async deploy(config: DeploymentConfig, _files: DeploymentFile[], _meta: { name: string; branch: string }): Promise<DeploymentResult> {
    if (!config.projectId || !config.environmentId) {
      throw new Error("Railway requires projectId and environmentId in workspace aiConfiguration");
    }

    // Railway deploys from connected GitHub — trigger a redeploy of the service
    const data = await this.gql<{ serviceInstanceRedeploy: { id: string } }>(
      config.token,
      `mutation Redeploy($serviceId: String!, $environmentId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId) {
          id
        }
      }`,
      { serviceId: config.projectId, environmentId: config.environmentId },
    );

    return {
      id: data.serviceInstanceRedeploy.id,
      url: null, // Railway URL comes from getStatus
      status: "queued",
      provider: "railway",
    };
  }

  async getStatus(config: DeploymentConfig, deploymentId: string): Promise<DeploymentResult> {
    const data = await this.gql<{ deployment: { id: string; status: string; staticUrl?: string; url?: string } }>(
      config.token,
      `query DeploymentStatus($id: String!) {
        deployment(id: $id) { id status staticUrl url }
      }`,
      { id: deploymentId },
    );

    const d = data.deployment;
    const statusMap: Record<string, DeploymentResult["status"]> = {
      QUEUED: "queued", BUILDING: "building", DEPLOYING: "building",
      SUCCESS: "ready", FAILED: "error", CRASHED: "error", REMOVED: "cancelled",
    };

    return {
      id: d.id,
      url: d.staticUrl ?? d.url ?? null,
      status: statusMap[d.status] ?? "queued",
      provider: "railway",
    };
  }

  async cancel(config: DeploymentConfig, deploymentId: string): Promise<void> {
    await this.gql(config.token,
      `mutation Cancel($id: String!) { deploymentCancel(id: $id) }`,
      { id: deploymentId },
    );
  }
}
