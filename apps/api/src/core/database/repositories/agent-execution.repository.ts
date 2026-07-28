import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AgentExecutionDocument } from "../schemas/agent-execution.schema";
import { AgentExecution } from "../schemas/agent-execution.schema";

@Injectable()
export class AgentExecutionRepository {
  constructor(@InjectModel(AgentExecution.name) private model: Model<AgentExecutionDocument>) {}

  async create(data: Record<string, unknown>): Promise<AgentExecutionDocument> {
    return this.model.create(data);
  }

  async findByTask(taskId: string): Promise<AgentExecutionDocument[]> {
    return this.model.find({ taskId, deletedAt: null }).sort({ startedAt: 1 }).exec();
  }

  async update(id: string, data: Record<string, unknown>): Promise<AgentExecutionDocument | null> {
    return this.model.findOneAndUpdate({ _id: id, deletedAt: null }, data, { returnDocument: 'after' }).exec();
  }

  async findByOrg(organizationId: string, limit = 20): Promise<AgentExecutionDocument[]> {
    return this.model.find({ organizationId, deletedAt: null }).sort({ startedAt: -1 }).limit(limit).exec();
  }
}
