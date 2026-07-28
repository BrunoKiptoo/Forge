import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { EnvironmentsService } from "./environments.service";

@UseGuards(JwtAuthGuard)
@Controller("environments")
export class EnvironmentsController {
  constructor(private readonly service: EnvironmentsService) {}

  @Post("provision")
  async provision(
    @Body() body: { workspaceId: string; organizationId: string },
  ) {
    const data = await this.service.provision(body.workspaceId, body.organizationId);
    return { data };
  }

  @Get()
  async findByWorkspace(@Query("workspaceId") workspaceId: string) {
    const data = await this.service.findByWorkspace(workspaceId);
    return { data };
  }

  @Post(":id/deploy")
  async deploy(
    @Param("id") id: string,
    @Body() body: { organizationId: string; taskId?: string },
  ) {
    const data = await this.service.deploy(id, body.organizationId, body.taskId);
    return { data };
  }

  @Post(":id/promote")
  async promote(
    @Param("id") id: string,
    @Body() body: { organizationId: string },
    @CurrentUser() user: { id: string },
  ) {
    const data = await this.service.promote(id, body.organizationId, user.id);
    return { data };
  }

  @Post(":id/approve-promotion")
  async approvePromotion(
    @Param("id") id: string,
    @Body() body: { organizationId: string },
  ) {
    const data = await this.service.approvePromotion(id, body.organizationId);
    return { data };
  }

  @Post(":id/rollback")
  async rollback(
    @Param("id") id: string,
    @Body() body: { organizationId: string },
  ) {
    const data = await this.service.rollback(id, body.organizationId);
    return { data };
  }
}
