import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ActivityDocument } from "../schemas/activity.schema";
import { Activity } from "../schemas/activity.schema";

@Injectable()
export class ActivityRepository {
  constructor(@InjectModel(Activity.name) private model: Model<ActivityDocument>) {}

  async create(data: {
    organizationId: string;
    projectId?: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  }): Promise<ActivityDocument> {
    const doc = await this.model.create(data);
    return doc;
  }

  async findByOrg(
    organizationId: string,
    limit = 20,
  ): Promise<ActivityDocument[]> {
    return this.model
      .find({ organizationId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name avatar")
      .exec();
  }

  async findByProject(
    projectId: string,
    limit = 20,
  ): Promise<ActivityDocument[]> {
    return this.model
      .find({ projectId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name avatar")
      .exec();
  }
}
