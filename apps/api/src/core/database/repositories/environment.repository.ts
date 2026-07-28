import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Environment, EnvironmentDocument } from "../schemas/environment.schema";

@Injectable()
export class EnvironmentRepository {
  constructor(@InjectModel(Environment.name) private readonly model: Model<EnvironmentDocument>) {}

  create(data: Partial<Environment>) {
    return this.model.create(data);
  }

  findByWorkspace(workspaceId: string) {
    return this.model.find({ workspaceId: workspaceId as never }).sort({ order: 1 }).lean().exec();
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }

  findByWorkspaceAndName(workspaceId: string, name: string) {
    return this.model.findOne({ workspaceId: workspaceId as never, name: name as never }).lean().exec();
  }

  update(id: string, data: Partial<Environment>) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' }).lean().exec();
  }

  deleteByWorkspace(workspaceId: string) {
    return this.model.deleteMany({ workspaceId }).exec();
  }
}
