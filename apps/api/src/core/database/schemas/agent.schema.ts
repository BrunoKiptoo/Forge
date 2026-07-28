import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type AgentDocument = HydratedDocument<Agent>;

export const AGENT_TYPES = ["planner", "backend", "frontend", "testing", "reviewer", "deployment", "browser"] as const;
export type AgentType = (typeof AGENT_TYPES)[number];

export const AGENT_STATUS = ["idle", "busy", "offline", "error"] as const;
export type AgentStatus = (typeof AGENT_STATUS)[number];

@Schema({ timestamps: true })
export class Agent {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: AGENT_TYPES, required: true })
  type: AgentType;

  @Prop({ default: "openai" })
  provider: string;

  @Prop({ default: "gpt-4o" })
  model: string;

  @Prop({ type: [String], default: [] })
  capabilities: string[];

  @Prop({ type: String, enum: AGENT_STATUS, default: "idle" })
  status: AgentStatus;

  @Prop({ type: Types.ObjectId, ref: "Task", default: null })
  currentTaskId: Types.ObjectId | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
