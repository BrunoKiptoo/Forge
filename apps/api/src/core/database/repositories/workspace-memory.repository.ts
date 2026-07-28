import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { WorkspaceMemory, WorkspaceMemoryDocument } from "../schemas";
import type { MemoryCategory } from "../schemas";

@Injectable()
export class WorkspaceMemoryRepository extends BaseRepository<WorkspaceMemoryDocument> {
  constructor(@InjectModel(WorkspaceMemory.name) model: Model<WorkspaceMemoryDocument>) {
    super(model);
  }

  findByWorkspace(workspaceId: string, category?: MemoryCategory) {
    const filter: Record<string, unknown> = { workspaceId, deletedAt: null };
    if (category) filter["category"] = category;
    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  async upsert(workspaceId: string, organizationId: string, category: MemoryCategory, key: string, value: string, metadata?: Record<string, unknown>) {
    return this.model.findOneAndUpdate(
      { workspaceId, key, deletedAt: null },
      { workspaceId, organizationId, category, key, value, metadata: metadata ?? {} },
      { upsert: true, returnDocument: 'after' },
    ).exec();
  }
}
