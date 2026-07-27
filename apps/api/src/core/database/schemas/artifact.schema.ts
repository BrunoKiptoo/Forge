import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument} from "mongoose";
import { Types } from "mongoose";

export type ArtifactDocument = HydratedDocument<Artifact>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Artifact {
  @Prop({ type: Types.ObjectId, ref: "Task", required: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Agent", required: true })
  agentId: Types.ObjectId;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ArtifactSchema = SchemaFactory.createForClass(Artifact);

