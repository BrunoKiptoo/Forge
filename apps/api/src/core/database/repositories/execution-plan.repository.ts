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

  async findByTaskId(taskId: string): Promise<ExecutionPlanDocument | null> {
    return this.model.findOne({ taskId, deletedAt: null }).exec();
  }

  async update(id: string, data: Record<string, unknown>): Promise<ExecutionPlanDocument | null> {
    return this.model.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true }).exec();
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
      { new: true },
    ).exec();
  }
}
