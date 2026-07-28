import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Project", default: null })
  projectId: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  userId: Types.ObjectId | null;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entityType: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

ActivitySchema.index({ organizationId: 1, createdAt: -1 });
ActivitySchema.index({ projectId: 1, createdAt: -1 });
