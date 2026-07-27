import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type WorkspaceMemoryDocument = HydratedDocument<WorkspaceMemory>;

export const MEMORY_CATEGORIES = [
  "architectural_decision",
  "coding_standard",
  "convention",
  "ai_decision",
  "lesson_learned",
  "completed_goal",
  "known_bug",
  "tech_stack",
] as const;
export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

@Schema({ timestamps: true })
export class WorkspaceMemory {
  @Prop({ type: Types.ObjectId, ref: "Workspace", required: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, enum: MEMORY_CATEGORIES, required: true })
  category: MemoryCategory;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const WorkspaceMemorySchema = SchemaFactory.createForClass(WorkspaceMemory);
WorkspaceMemorySchema.index({ workspaceId: 1, category: 1 });
WorkspaceMemorySchema.index({ workspaceId: 1, key: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
