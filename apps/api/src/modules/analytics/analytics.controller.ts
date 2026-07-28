import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  async getSummary(@Query("organizationId") organizationId: string) {
    const data = await this.analyticsService.getSummary(organizationId);
    return { data, message: "Summary retrieved", timestamp: new Date().toISOString() };
  }

  @Get("tokens")
  async getTokenUsage(@Query("organizationId") organizationId: string) {
    const data = await this.analyticsService.getTokenUsage(organizationId);
    return { data, message: "Token usage retrieved", timestamp: new Date().toISOString() };
  }

  @Get("cost")
  async getCostOverTime(
    @Query("organizationId") organizationId: string,
    @Query("days") days?: string,
  ) {
    const data = await this.analyticsService.getCostOverTime(organizationId, days ? parseInt(days) : 14);
    return { data, message: "Cost over time retrieved", timestamp: new Date().toISOString() };
  }

  @Get("agents")
  async getAgentPerformance(@Query("organizationId") organizationId: string) {
    const data = await this.analyticsService.getAgentPerformance(organizationId);
    return { data, message: "Agent performance retrieved", timestamp: new Date().toISOString() };
  }

  @Get("failures")
  async getFailures(
    @Query("organizationId") organizationId: string,
    @Query("limit") limit?: string,
  ) {
    const data = await this.analyticsService.getFailureDiagnostics(organizationId, limit ? parseInt(limit) : 10);
    return { data, message: "Failures retrieved", timestamp: new Date().toISOString() };
  }
}
