import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Session {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, select: false })
  refreshTokenHash: string;

  @Prop({ type: Date, required: true, expires: 0 })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

