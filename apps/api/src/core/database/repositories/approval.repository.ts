import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Approval, ApprovalDocument } from "../schemas/approval.schema";

@Injectable()
export class ApprovalRepository {
  constructor(@InjectModel(Approval.name) private readonly model: Model<ApprovalDocument>) {}

  create(data: Partial<Approval>) {
    return this.model.create(data);
  }

  findByTask(taskId: string) {
    return this.model.find({ taskId }).sort({ createdAt: -1 }).lean().exec();
  }

  findPendingByTask(taskId: string) {
    return this.model.findOne({ taskId, status: "pending" }).lean().exec();
  }

  findByOrg(organizationId: string, limit = 20) {
    return this.model.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }

  update(id: string, data: Partial<Approval>) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true }).lean().exec();
  }
}
