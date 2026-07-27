import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  repositoryId: string;

  @Prop({ default: "main" })
  defaultBranch: string;

  @Prop({ default: "" })
  codingStandards: string;

  @Prop({ type: Object, default: {} })
  aiConfiguration: Record<string, unknown>;

  @Prop({ default: "" })
  deploymentTarget: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
WorkspaceSchema.index({ organizationId: 1 });
