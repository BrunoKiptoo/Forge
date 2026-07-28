import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type GitCredentialDocument = HydratedDocument<GitCredential>;

@Schema({ timestamps: true })
export class GitCredential {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, select: false })
  token: string;

  @Prop({ default: "github" })
  provider: string;

  @Prop()
  username: string;
}

export const GitCredentialSchema = SchemaFactory.createForClass(GitCredential);
