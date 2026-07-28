import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: String, enum: ["task", "artifact"], required: true })
  entityType: string;

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  body: string;

  @Prop({ type: [Types.ObjectId], ref: "User", default: [] })
  mentions: Types.ObjectId[];

  @Prop({ default: false })
  resolved: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ entityId: 1, entityType: 1, createdAt: 1 });
CommentSchema.index({ organizationId: 1, createdAt: -1 });
