import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("activities")
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async findAll(
    @Query("organizationId") organizationId: string,
    @Query("projectId") projectId?: string,
    @Query("limit") limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 20;
    if (projectId) {
      const data = await this.activityService.findByProject(projectId, lim);
      return { data, message: "Activities retrieved", timestamp: new Date().toISOString() };
    }
    if (organizationId) {
      const data = await this.activityService.findByOrg(organizationId, lim);
      return { data, message: "Activities retrieved", timestamp: new Date().toISOString() };
    }
    return { data: [], message: "No filter", timestamp: new Date().toISOString() };
  }
}
