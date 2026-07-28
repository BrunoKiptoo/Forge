import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BrowserSession, BrowserSessionDocument } from "../schemas/browser-session.schema";

@Injectable()
export class BrowserSessionRepository {
  constructor(@InjectModel(BrowserSession.name) private readonly model: Model<BrowserSessionDocument>) {}

  create(data: Partial<BrowserSession>) {
    return this.model.create(data);
  }

  update(id: string, data: Partial<BrowserSession>) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { returnDocument: 'after' }).lean().exec();
  }

  appendAction(id: string, action: Record<string, unknown>) {
    return this.model.updateOne({ _id: id }, { $push: { actions: action } }).exec();
  }

  findByOrg(organizationId: string, limit = 20) {
    return this.model.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }

  findByTask(taskId: string) {
    return this.model.find({ taskId }).sort({ createdAt: -1 }).lean().exec();
  }
}
