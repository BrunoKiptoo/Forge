import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type MembershipDocument = HydratedDocument<Membership>;

export const MEMBERSHIP_ROLES = ["owner", "admin", "developer", "viewer"] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

@Schema({ timestamps: true })
export class Membership {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: MEMBERSHIP_ROLES, required: true })
  role: MembershipRole;

  @Prop({ type: Types.ObjectId, ref: "User" })
  invitedBy?: Types.ObjectId;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

MembershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
