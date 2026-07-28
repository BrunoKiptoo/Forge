import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type BrowserSessionDocument = HydratedDocument<BrowserSession>;

@Schema({ timestamps: true })
export class BrowserSession {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Workspace", default: null })
  workspaceId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "Task", default: null })
  taskId: Types.ObjectId | null;

  @Prop({ required: true })
  url: string;

  @Prop({ type: String, enum: ["running", "completed", "failed"], default: "running" })
  status: string;

  @Prop({ type: [Object], default: [] })
  actions: Record<string, unknown>[];

  // base64 PNG of the final screenshot
  @Prop({ type: String, default: null })
  screenshot: string | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}

export const BrowserSessionSchema = SchemaFactory.createForClass(BrowserSession);
BrowserSessionSchema.index({ organizationId: 1, createdAt: -1 });
BrowserSessionSchema.index({ taskId: 1 });
