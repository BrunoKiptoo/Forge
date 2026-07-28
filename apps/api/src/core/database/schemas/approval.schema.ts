import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ApprovalDocument = HydratedDocument<Approval>;

export const APPROVAL_STATUS = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUS)[number];

@Schema({ timestamps: true })
export class Approval {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Task", required: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  requestedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  reviewerId: Types.ObjectId | null;

  @Prop({ type: String, enum: APPROVAL_STATUS, default: "pending" })
  status: ApprovalStatus;

  @Prop({ type: String, default: null })
  note: string | null;

  // Snapshot of the execution plan at request time
  @Prop({ type: Object, default: {} })
  planSnapshot: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);
ApprovalSchema.index({ taskId: 1, status: 1 });
ApprovalSchema.index({ organizationId: 1, createdAt: -1 });
