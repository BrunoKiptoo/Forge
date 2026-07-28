import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AgentMessage, AgentMessageDocument } from "../schemas";

@Injectable()
export class AgentMessageRepository {
  constructor(@InjectModel(AgentMessage.name) private readonly model: Model<AgentMessageDocument>) {}

  create(data: Record<string, unknown>) {
    return this.model.create(data);
  }

  findByTask(taskId: string) {
    return this.model.find({ taskId }).sort({ createdAt: 1 }).exec();
  }

  findByOrg(organizationId: string, limit = 50) {
    return this.model.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}
