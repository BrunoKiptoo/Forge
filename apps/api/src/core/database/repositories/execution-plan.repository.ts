import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExecutionPlanDocument } from "../schemas/execution-plan.schema";
import { ExecutionPlan } from "../schemas/execution-plan.schema";

@Injectable()
export class ExecutionPlanRepository {
  constructor(@InjectModel(ExecutionPlan.name) private model: Model<ExecutionPlanDocument>) {}

  async create(data: Record<string, unknown>): Promise<ExecutionPlanDocument> {
    return this.model.create(data);
  }

  async upsertByTaskId(taskId: string, data: Record<string, unknown>): Promise<ExecutionPlanDocument> {
    return this.model.findOneAndUpdate(
      { taskId },
      { $set: data },
      { upsert: true, returnDocument: 'after' },
    ).exec() as Promise<ExecutionPlanDocument>;
  }

  async findByTaskId(taskId: string): Promise<ExecutionPlanDocument | null> {
    return this.model.findOne({ taskId, deletedAt: null }).exec();
  }

  async update(id: string, data: Record<string, unknown>): Promise<ExecutionPlanDocument | null> {
    return this.model.findOneAndUpdate({ _id: id, deletedAt: null }, data, { returnDocument: 'after' }).exec();
  }

  async updateStepStatus(
    planId: string,
    stepOrder: number,
    status: string,
    result: Record<string, unknown>,
  ): Promise<ExecutionPlanDocument | null> {
    return this.model.findOneAndUpdate(
      { _id: planId, "steps.order": stepOrder, deletedAt: null },
      { $set: { "steps.$.status": status, "steps.$.result": result } },
      { returnDocument: 'after' },
    ).exec();
  }
}
