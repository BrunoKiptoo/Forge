import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type AgentMessageDocument = HydratedDocument<AgentMessage>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AgentMessage {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Task", required: true })
  taskId: Types.ObjectId;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  receiver: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  createdAt: Date;
}

export const AgentMessageSchema = SchemaFactory.createForClass(AgentMessage);
AgentMessageSchema.index({ taskId: 1, createdAt: 1 });
