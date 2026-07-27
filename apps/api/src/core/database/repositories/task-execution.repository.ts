import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { TaskExecutionDocument } from "../schemas/task-execution.schema";
import { TaskExecution } from "../schemas/task-execution.schema";

@Injectable()
export class TaskExecutionRepository extends BaseRepository<TaskExecutionDocument> {
  constructor(@InjectModel(TaskExecution.name) model: Model<TaskExecutionDocument>) {
    super(model);
  }

  async findByTask(taskId: string): Promise<TaskExecutionDocument[]> {
    return this.findAll({ taskId });
  }

  async getLatest(taskId: string): Promise<TaskExecutionDocument | null> {
    return this.model
      .findOne({ taskId, deletedAt: null })
      .sort({ startedAt: -1 })
      .exec();
  }
}
