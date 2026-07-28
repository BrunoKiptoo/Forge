import { Injectable } from "@nestjs/common";
import { ActivityRepository } from "../../core/database/repositories";

@Injectable()
export class ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async findByOrg(organizationId: string, limit = 20) {
    return this.activityRepository.findByOrg(organizationId, limit);
  }

  async findByProject(projectId: string, limit = 20) {
    return this.activityRepository.findByProject(projectId, limit);
  }
}
