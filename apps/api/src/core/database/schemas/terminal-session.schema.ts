import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type TerminalSessionDocument = HydratedDocument<TerminalSession>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class TerminalSession {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Workspace", default: null })
  workspaceId: Types.ObjectId | null;

  @Prop({ required: true })
  command: string;

  @Prop({ default: "" })
  cwd: string;

  @Prop({ type: String, enum: ["running", "completed", "failed", "timeout"], default: "running" })
  status: string;

  @Prop({ type: [String], default: [] })
  logs: string[];

  @Prop({ type: Number, default: null })
  exitCode: number | null;

  @Prop({ type: Number, default: null })
  durationMs: number | null;

  @Prop({ type: Date, default: null })
  finishedAt: Date | null;

  createdAt: Date;
}

export const TerminalSessionSchema = SchemaFactory.createForClass(TerminalSession);
TerminalSessionSchema.index({ organizationId: 1, createdAt: -1 });
