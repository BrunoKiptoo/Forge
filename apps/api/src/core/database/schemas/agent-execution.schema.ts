import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type AgentExecutionDocument = HydratedDocument<AgentExecution>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AgentExecution {
  @Prop({ type: Types.ObjectId, ref: "Task", required: true, index: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Agent", required: true })
  agentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, enum: ["running", "completed", "failed"], default: "running" })
  status: string;

  @Prop({ type: [String], default: [] })
  logs: string[];

  @Prop({ type: Date, default: Date.now })
  startedAt: Date;

  @Prop({ type: Date, default: null })
  finishedAt: Date | null;

  @Prop({ type: Object, default: {} })
  result: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const AgentExecutionSchema = SchemaFactory.createForClass(AgentExecution);
