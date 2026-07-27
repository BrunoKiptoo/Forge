import { Controller, Post, Get, Param, Body, Query, Res, UseGuards } from "@nestjs/common";
import type { Response as ExpressResponse } from "express";
import { TerminalService } from "./terminal.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("terminal")
@UseGuards(JwtAuthGuard)
export class TerminalController {
  constructor(private readonly terminalService: TerminalService) {}

  @Post("exec")
  async exec(
    @Body("command") command: string,
    @Body("organizationId") organizationId: string,
    @Body("cwd") cwd?: string,
    @Body("workspaceId") workspaceId?: string,
    @CurrentUser() _user?: { id: string },
  ) {
    const session = await this.terminalService.exec(organizationId, command, cwd, workspaceId);
    return { data: session, message: "Command started", timestamp: new Date().toISOString() };
  }

  @Get("sessions")
  async getSessions(
    @Query("organizationId") organizationId: string,
    @Query("limit") limit?: string,
  ) {
    const sessions = await this.terminalService.findByOrg(organizationId, limit ? parseInt(limit) : 20);
    return { data: sessions, message: "Sessions retrieved", timestamp: new Date().toISOString() };
  }

  @Get(":id")
  async getSession(@Param("id") id: string) {
    const session = await this.terminalService.findById(id);
    return { data: session, message: "Session retrieved", timestamp: new Date().toISOString() };
  }

  // SSE endpoint — public (session ID is unguessable), streams log lines as they are appended
  @Get(":id/stream")
  @UseGuards() // override class-level guard
  async stream(
    @Param("id") id: string,
    @Res() res: ExpressResponse,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let lastIndex = 0;
    let done = false;

    const interval = setInterval(async () => {
      const session = await this.terminalService.findById(id);
      if (!session) { clearInterval(interval); res.end(); return; }

      const newLines = session.logs.slice(lastIndex);
      for (const line of newLines) {
        res.write(`data: ${JSON.stringify({ line })}\n\n`);
      }
      lastIndex = session.logs.length;

      if (session.status !== "running" && !done) {
        done = true;
        res.write(`data: ${JSON.stringify({ done: true, exitCode: session.exitCode, status: session.status })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 300);

    res.on("close", () => clearInterval(interval));
  }
}
