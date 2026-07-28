import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ArtifactDocument } from "../schemas/artifact.schema";
import { Artifact } from "../schemas/artifact.schema";

@Injectable()
export class ArtifactRepository {
  constructor(@InjectModel(Artifact.name) private model: Model<ArtifactDocument>) {}

  async create(data: {
    taskId: string;
    organizationId: string;
    agentId: string;
    filename: string;
    language: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<ArtifactDocument> {
    return this.model.create(data);
  }

  async findByTask(taskId: string): Promise<ArtifactDocument[]> {
    return this.model.find({ taskId, deletedAt: null }).sort({ createdAt: 1 }).exec();
  }

  async findById(id: string): Promise<ArtifactDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null }).exec();
  }
}
