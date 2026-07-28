import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AgentDocument } from "../schemas/agent.schema";
import { Agent } from "../schemas/agent.schema";

@Injectable()
export class AgentRepository {
  constructor(@InjectModel(Agent.name) private model: Model<AgentDocument>) {}

  async findByOrg(organizationId: string): Promise<AgentDocument[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.model.find({ organizationId, deletedAt: null } as any).exec();
  }

  async findByType(organizationId: string, type: string): Promise<AgentDocument[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.model.find({ organizationId, type, deletedAt: null } as any).exec();
  }

  async findById(id: string): Promise<AgentDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null }).exec();
  }

  async create(data: Record<string, unknown>): Promise<AgentDocument> {
    return this.model.create(data);
  }

  async updateStatus(id: string, status: string, currentTaskId?: string | null): Promise<AgentDocument | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: any = { status };
    if (currentTaskId !== undefined) update.currentTaskId = currentTaskId;
    return this.model.findOneAndUpdate({ _id: id, deletedAt: null }, update, { returnDocument: 'after' }).exec();
  }

  async findAvailable(organizationId: string, agentType: string): Promise<AgentDocument | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.model.findOne({ organizationId, type: agentType, status: "idle", deletedAt: null } as any).exec();
  }
}
