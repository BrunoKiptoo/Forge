import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type TaskDocument = HydratedDocument<Task>;

export const TASK_PRIORITY = ["low", "medium", "high", "critical"] as const;
export type TaskPriority = (typeof TASK_PRIORITY)[number];

export const TASK_STATUS = ["planning", "queued", "running", "waiting", "review", "completed", "failed", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Project", required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ type: String, enum: TASK_PRIORITY, default: "medium" })
  priority: TaskPriority;

  @Prop({ type: String, enum: TASK_STATUS, default: "planning" })
  status: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  assignedAgent: Types.ObjectId | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ organizationId: 1, status: 1 });
