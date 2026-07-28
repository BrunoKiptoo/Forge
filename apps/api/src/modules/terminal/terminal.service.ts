import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TerminalSession, TerminalSessionDocument } from "../../core/database/schemas";
import { SandboxService } from "../../core/sandbox/sandbox.service";

@Injectable()
export class TerminalService {
  constructor(
    @InjectModel(TerminalSession.name) private readonly model: Model<TerminalSessionDocument>,
    private readonly sandbox: SandboxService,
  ) {}

  async exec(organizationId: string, command: string, cwd?: string, workspaceId?: string): Promise<TerminalSessionDocument> {
    if (!this.sandbox.isAllowed(command)) {
      throw new ForbiddenException(`Command not allowed: ${command.split(" ")[0]}`);
    }

    const session = await this.model.create({
      organizationId,
      workspaceId: workspaceId ?? null,
      command,
      cwd: cwd ?? "",
      status: "running",
      logs: [],
      exitCode: null,
      durationMs: null,
      finishedAt: null,
    });

    // Run async — caller streams via SSE
    void this.run(String(session._id), command, cwd);

    return session;
  }

  private async run(sessionId: string, command: string, cwd?: string) {
    const logs: string[] = [];
    let exitCode = 0;
    let durationMs = 0;

    try {
      for await (const line of this.sandbox.stream(command, { cwd })) {
        logs.push(`[${line.stream}] ${line.text}`);
        // Append each line incrementally so SSE polling picks it up
        await this.model.updateOne({ _id: sessionId }, { $push: { logs: `[${line.stream}] ${line.text}` } });

        const exitMatch = line.text.match(/\[exit:(\d+)\] duration:(\d+)ms/);
        if (exitMatch) {
          exitCode = parseInt(exitMatch[1]!);
          durationMs = parseInt(exitMatch[2]!);
        }
      }
    } catch (err) {
      logs.push(`[system] Error: ${String(err)}`);
      exitCode = 1;
    }

    const status = exitCode === 0 ? "completed" : "failed";
    await this.model.updateOne({ _id: sessionId }, {
      status,
      exitCode,
      durationMs,
      finishedAt: new Date(),
    });
  }

  findByOrg(organizationId: string, limit = 20) {
    return this.model.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  findById(id: string) {
    return this.model.findById(id).lean().exec();
  }
}
