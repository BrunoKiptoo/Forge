import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CodeChunk, CodeChunkDocument } from "../schemas/code-chunk.schema";

@Injectable()
export class CodeChunkRepository {
  constructor(@InjectModel(CodeChunk.name) private model: Model<CodeChunkDocument>) {}

  async saveChunks(
    organizationId: string, repoFullName: string,
    chunks: { filePath: string; language: string; content: string; symbolName?: string; symbolType?: string; startLine?: number; endLine?: number }[],
  ): Promise<void> {
    await this.model.deleteMany({ repoFullName, organizationId }).exec();
    const docs = chunks.map((c) => ({
      organizationId, repoFullName, filePath: c.filePath, language: c.language,
      content: c.content, symbolName: c.symbolName ?? "", symbolType: c.symbolType ?? "",
      startLine: c.startLine ?? 0, endLine: c.endLine ?? 0,
    }));
    await this.model.insertMany(docs);
  }

  async findByRepo(organizationId: string, repoFullName: string): Promise<CodeChunkDocument[]> {
    return this.model.find({ organizationId, repoFullName, deletedAt: null }).exec();
  }

  async updateEmbedding(chunkId: string, embedding: number[]): Promise<void> {
    await this.model.updateOne({ _id: chunkId }, { embedding }).exec();
  }
}
