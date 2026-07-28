import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { Goal, GoalDocument } from "../schemas";

@Injectable()
export class GoalRepository extends BaseRepository<GoalDocument> {
  constructor(@InjectModel(Goal.name) model: Model<GoalDocument>) {
    super(model);
  }

  findByWorkspace(workspaceId: string) {
    return this.model.find({ workspaceId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }

  findActive(workspaceId: string) {
    return this.model.find({ workspaceId, status: { $in: ["active", "in_progress"] }, deletedAt: null }).exec();
  }
}
