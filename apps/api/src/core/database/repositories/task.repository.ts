import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "./base.repository";
import { TaskDocument } from "../schemas/task.schema";
import { Task } from "../schemas/task.schema";

@Injectable()
export class TaskRepository extends BaseRepository<TaskDocument> {
  constructor(@InjectModel(Task.name) model: Model<TaskDocument>) {
    super(model);
  }

  async findByProject(projectId: string, status?: string): Promise<TaskDocument[]> {
    const filter: Record<string, unknown> = { projectId };
    if (status) filter.status = status;
    return this.findAll(filter);
  }

  async findByOrganization(
    organizationId: string,
    options?: { status?: string; projectId?: string },
  ): Promise<TaskDocument[]> {
    const filter: Record<string, unknown> = { organizationId };
    if (options?.status) filter.status = options.status;
    if (options?.projectId) filter.projectId = options.projectId;
    return this.findAll(filter);
  }

  async countByStatus(
    organizationId: string,
    statuses: string[],
  ): Promise<number> {
     
     
    return this.model
      .countDocuments({ organizationId, status: { $in: statuses }, deletedAt: null } as Record<string, unknown>)
      .exec();
  }

  async countCompletedToday(organizationId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.model
      .countDocuments({
        organizationId,
        status: "completed",
        updatedAt: { $gte: startOfDay },
        deletedAt: null,
      })
      .exec();
  }
}
