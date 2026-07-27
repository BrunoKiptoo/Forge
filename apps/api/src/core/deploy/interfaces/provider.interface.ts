export interface DeploymentConfig {
  token: string;
  projectId?: string;
  teamId?: string;
  environmentId?: string;
}

export interface DeploymentFile {
  path: string;
  content: string;
}

export interface DeploymentResult {
  id: string;
  url: string | null;
  status: "queued" | "building" | "ready" | "error" | "cancelled";
  provider: string;
  raw?: Record<string, unknown>;
}

export interface DeploymentProvider {
  readonly name: string;
  deploy(config: DeploymentConfig, files: DeploymentFile[], meta: { name: string; branch: string }): Promise<DeploymentResult>;
  getStatus(config: DeploymentConfig, deploymentId: string): Promise<DeploymentResult>;
  cancel(config: DeploymentConfig, deploymentId: string): Promise<void>;
}
