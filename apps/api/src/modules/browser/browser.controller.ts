import { Controller, Post, Get, Param, Body, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BrowserAgentService } from "./browser-agent.service";
import type { BrowserAction } from "../../core/browser/browser.service";

@UseGuards(JwtAuthGuard)
@Controller("browser")
export class BrowserController {
  constructor(private readonly service: BrowserAgentService) {}

  @Post("run")
  async run(@Body() body: { organizationId: string; url: string; actions?: BrowserAction[]; workspaceId?: string; taskId?: string }) {
    const session = await this.service.run(
      body.organizationId,
      body.url,
      body.actions ?? [],
      { workspaceId: body.workspaceId, taskId: body.taskId },
    );
    return { data: session };
  }

  @Get("sessions")
  async list(@Query("organizationId") organizationId: string) {
    const data = await this.service.findByOrg(organizationId);
    return { data };
  }

  @Get("sessions/:id")
  async findOne(@Param("id") id: string) {
    const data = await this.service.findById(id);
    return { data };
  }
}
