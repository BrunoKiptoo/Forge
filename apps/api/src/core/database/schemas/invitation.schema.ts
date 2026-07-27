import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type InvitationDocument = HydratedDocument<Invitation>;

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ type: String, enum: ["admin", "developer", "viewer"], required: true })
  role: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  invitedBy: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: String, enum: ["pending", "accepted", "rejected"], default: "pending" })
  status: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

InvitationSchema.index({ organizationId: 1, email: 1, status: 1 });
