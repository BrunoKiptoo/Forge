import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { Workspace, WorkspaceDocument } from "../schemas";

@Injectable()
export class WorkspaceRepository extends BaseRepository<WorkspaceDocument> {
  constructor(@InjectModel(Workspace.name) model: Model<WorkspaceDocument>) {
    super(model);
  }

  findByOrg(organizationId: string) {
    return this.model.find({ organizationId, deletedAt: null }).sort({ createdAt: -1 }).exec();
  }
}
