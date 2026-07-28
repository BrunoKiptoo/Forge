import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type TaskExecutionDocument = HydratedDocument<TaskExecution>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TaskExecution {
  @Prop({ type: Types.ObjectId, ref: "Task", required: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, enum: ["running", "completed", "failed", "cancelled"], default: "running" })
  status: string;

  @Prop({ type: Date, default: Date.now })
  startedAt: Date;

  @Prop({ type: Date, default: null })
  finishedAt: Date | null;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ type: [String], default: [] })
  logs: string[];

  @Prop({ type: Object, default: {} })
  result: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const TaskExecutionSchema = SchemaFactory.createForClass(TaskExecution);

