import { Controller, Post, Get, Param, Body, Query, Res, UseGuards } from "@nestjs/common";
import { DeploymentService } from "./deployment.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { Response } from "express";

@Controller("deployments")
@UseGuards(JwtAuthGuard)
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post()
  async deploy(
    @Body("organizationId") organizationId: string,
    @Body("workspaceId") workspaceId: string,
    @Body("taskId") taskId?: string,
    @Body("branch") branch?: string,
  ) {
    const deployment = await this.deploymentService.deploy(organizationId, workspaceId, taskId, branch ?? "main");
    return { data: deployment, message: "Deployment started", timestamp: new Date().toISOString() };
  }

  @Get()
  async list(
    @Query("workspaceId") workspaceId?: string,
    @Query("organizationId") organizationId?: string,
  ) {
    const data = workspaceId
      ? await this.deploymentService.findByWorkspace(workspaceId)
      : await this.deploymentService.findByOrg(organizationId ?? "");
    return { data, message: "Deployments retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    const data = await this.deploymentService.findById(id);
    return { data, message: "Deployment retrieved", timestamp: new Date().toISOString() };
  }

  // SSE — streams log lines as deployment progresses
  @Get(":id/stream")
  @UseGuards()
  async stream(@Param("id") id: string, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let lastIndex = 0;
    let done = false;

    const interval = setInterval(async () => {
      try {
        const deployment = await this.deploymentService.findById(id);
        const newLines = deployment.logs.slice(lastIndex);
        for (const line of newLines) {
          res.write(`data: ${JSON.stringify({ line })}\n\n`);
        }
        lastIndex = deployment.logs.length;

        const terminal = new Set(["ready", "error", "cancelled"]);
        if (terminal.has(deployment.status) && !done) {
          done = true;
          res.write(`data: ${JSON.stringify({ done: true, status: deployment.status, url: deployment.url })}\n\n`);
          clearInterval(interval);
          res.end();
        }
      } catch {
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    res.on("close", () => clearInterval(interval));
  }
}
