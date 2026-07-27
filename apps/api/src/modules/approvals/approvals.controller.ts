import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ApprovalsService } from "./approvals.service";

@UseGuards(JwtAuthGuard)
@Controller("approvals")
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  @Post()
  async request(
    @Body() body: { organizationId: string; taskId: string; planSnapshot?: Record<string, unknown> },
    @CurrentUser() user: { id: string },
  ) {
    const data = await this.service.request({ ...body, requestedBy: user.id });
    return { data };
  }

  @Patch(":id")
  async resolve(
    @Param("id") id: string,
    @Body() body: { status: "approved" | "rejected"; note?: string },
    @CurrentUser() user: { id: string },
  ) {
    const data = await this.service.resolve(id, user.id, body.status, body.note);
    return { data };
  }

  @Get()
  async findByOrg(@Query("organizationId") organizationId: string) {
    const data = await this.service.findByOrg(organizationId);
    return { data };
  }

  @Get("task/:taskId")
  async findByTask(@Param("taskId") taskId: string) {
    const data = await this.service.findByTask(taskId);
    return { data };
  }
}
