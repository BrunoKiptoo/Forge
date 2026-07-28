import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type EnvironmentDocument = HydratedDocument<Environment>;

export const ENVIRONMENT_NAMES = ["dev", "test", "staging", "production"] as const;
export type EnvironmentName = (typeof ENVIRONMENT_NAMES)[number];

// Order determines promotion direction: dev(0) → test(1) → staging(2) → production(3)
export const ENVIRONMENT_ORDER: Record<EnvironmentName, number> = {
  dev: 0, test: 1, staging: 2, production: 3,
};

export const ENVIRONMENT_STATUS = ["idle", "deploying", "ready", "failed"] as const;
export type EnvironmentStatus = (typeof ENVIRONMENT_STATUS)[number];

@Schema({ timestamps: true })
export class Environment {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: String, enum: ENVIRONMENT_NAMES, required: true })
  name: EnvironmentName;

  @Prop({ required: true })
  order: number;

  @Prop({ default: "main" })
  branch: string;

  // Provider: vercel | railway
  @Prop({ default: "" })
  deployTarget: string;

  // Credentials and project config for this specific environment
  @Prop({ type: Object, default: {} })
  deployConfig: Record<string, unknown>;

  @Prop({ type: String, enum: ENVIRONMENT_STATUS, default: "idle" })
  status: EnvironmentStatus;

  @Prop({ type: Types.ObjectId, ref: "Deployment", default: null })
  currentDeploymentId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  currentUrl: string | null;

  // The deployment to roll back to
  @Prop({ type: Types.ObjectId, ref: "Deployment", default: null })
  previousDeploymentId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  lastPromotedAt: Date | null;

  // staging and production require approval before promotion
  @Prop({ default: false })
  requiresApproval: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const EnvironmentSchema = SchemaFactory.createForClass(Environment);
EnvironmentSchema.index({ workspaceId: 1, order: 1 });
EnvironmentSchema.index({ organizationId: 1 });
