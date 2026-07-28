import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CodeChunkDocument = HydratedDocument<CodeChunk>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class CodeChunk {
  @Prop({ type: Types.ObjectId, ref: "Organization", required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true })
  repoFullName: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  symbolName: string;

  @Prop()
  symbolType: string;

  @Prop({ type: Number })
  startLine: number;

  @Prop({ type: Number })
  endLine: number;

  @Prop({ type: [Number], default: [] })
  embedding: number[];

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const CodeChunkSchema = SchemaFactory.createForClass(CodeChunk);

CodeChunkSchema.index({ repoFullName: 1, filePath: 1 });
CodeChunkSchema.index({ organizationId: 1 });
