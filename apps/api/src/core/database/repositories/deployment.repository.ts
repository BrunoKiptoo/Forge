import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Deployment, DeploymentDocument } from "../schemas";

@Injectable()
export class DeploymentRepository {
  constructor(@InjectModel(Deployment.name) private readonly model: Model<DeploymentDocument>) {}

  create(data: Record<string, unknown>) {
    return this.model.create(data);
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }

  findByWorkspace(workspaceId: string, limit = 20) {
    return this.model.find({ workspaceId, deletedAt: null }).sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  findByEnvironment(environmentId: string, limit = 20) {
    return this.model.find({ environmentId }).sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  findLastReady(environmentId: string) {
    return this.model.findOne({ environmentId, status: "ready" }).sort({ createdAt: -1 }).lean().exec();
  }

  findByOrg(organizationId: string, limit = 20) {
    return this.model.find({ organizationId, deletedAt: null }).sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  update(id: string, data: Record<string, unknown>) {
    return this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean().exec();
  }

  appendLog(id: string, line: string) {
    return this.model.updateOne({ _id: id }, { $push: { logs: line } }).exec();
  }
}
