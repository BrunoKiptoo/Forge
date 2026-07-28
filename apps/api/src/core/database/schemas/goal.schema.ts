import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type GoalDocument = HydratedDocument<Goal>;

export const GOAL_STATUS = ["draft", "active", "in_progress", "completed", "failed", "cancelled"] as const;
export type GoalStatus = (typeof GOAL_STATUS)[number];

export const GOAL_PRIORITY = ["low", "medium", "high", "critical"] as const;
export type GoalPriority = (typeof GOAL_PRIORITY)[number];

@Schema({ timestamps: true })
export class Goal {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: "" })
  objective: string;

  @Prop({ type: [String], default: [] })
  successCriteria: string[];

  @Prop({ type: String, enum: GOAL_PRIORITY, default: "medium" })
  priority: GoalPriority;

  @Prop({ type: String, enum: GOAL_STATUS, default: "draft" })
  status: GoalStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: "Task" }], default: [] })
  taskIds: Types.ObjectId[];

  @Prop({ type: Date, default: null })
  deadline: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
GoalSchema.index({ workspaceId: 1, status: 1 });
