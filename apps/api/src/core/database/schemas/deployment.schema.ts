import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type DeploymentDocument = HydratedDocument<Deployment>;

export const DEPLOYMENT_PROVIDERS = ["vercel", "railway", "docker"] as const;
export type DeploymentProviderName = (typeof DEPLOYMENT_PROVIDERS)[number];

export const DEPLOYMENT_STATUS = ["queued", "building", "ready", "error", "cancelled"] as const;
export type DeploymentStatus = (typeof DEPLOYMENT_STATUS)[number];

@Schema({ timestamps: true })
export class Deployment {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Task", default: null })
  taskId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "Environment", default: null })
  environmentId: Types.ObjectId | null;

  @Prop({ required: true })
  provider: string;

  @Prop({ default: "" })
  externalId: string;

  @Prop({ type: String, enum: DEPLOYMENT_STATUS, default: "queued" })
  status: DeploymentStatus;

  @Prop({ type: String, default: null })
  url: string | null;

  @Prop({ default: "" })
  branch: string;

  @Prop({ type: [String], default: [] })
  logs: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  finishedAt: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const DeploymentSchema = SchemaFactory.createForClass(Deployment);
DeploymentSchema.index({ organizationId: 1, createdAt: -1 });
DeploymentSchema.index({ workspaceId: 1, createdAt: -1 });
