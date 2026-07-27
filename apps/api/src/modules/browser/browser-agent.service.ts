import { Injectable } from "@nestjs/common";
import { BrowserCoreService, BrowserAction, BrowserActionResult } from "../../core/browser/browser.service";
import { BrowserSessionRepository } from "../../core/database/repositories";
import { ForgeGateway } from "../../core/gateway/forge.gateway";

@Injectable()
export class BrowserAgentService {
  constructor(
    private readonly browser: BrowserCoreService,
    private readonly sessionRepository: BrowserSessionRepository,
    private readonly gateway: ForgeGateway,
  ) {}

  async run(
    organizationId: string,
    url: string,
    actions: BrowserAction[],
    opts: { workspaceId?: string; taskId?: string } = {},
  ) {
    const session = await this.sessionRepository.create({
      organizationId: organizationId as never,
      workspaceId: (opts.workspaceId ?? null) as never,
      taskId: (opts.taskId ?? null) as never,
      url,
      status: "running",
    });

    const id = String(session._id);

    void this.execute(id, organizationId, url, actions);

    return session;
  }

  private async execute(
    id: string,
    organizationId: string,
    url: string,
    actions: BrowserAction[],
  ) {
    let finalScreenshot: string | null = null;

    try {
      await this.browser.runSession(url, actions, (result: BrowserActionResult) => {
        const payload = {
          sessionId: id,
          action: result.action,
          success: result.success,
          error: result.error,
          hasScreenshot: !!result.data && result.action.type === "screenshot",
          screenshot: result.action.type === "screenshot" ? result.data : undefined,
          extractedText: result.action.type === "extract" ? result.data : undefined,
          timestamp: result.timestamp,
        };

        void this.sessionRepository.appendAction(id, payload);
        this.gateway.emit(`browser:${id}`, "browser.action", payload);
        this.gateway.emit(`org:${organizationId}`, "browser.action", { sessionId: id, action: payload.action, success: payload.success, hasScreenshot: payload.hasScreenshot, timestamp: payload.timestamp });

        if (result.action.type === "screenshot" && result.data) {
          finalScreenshot = result.data;
        }
      });

      await this.sessionRepository.update(id, { status: "completed", screenshot: finalScreenshot });
      this.gateway.emit(`browser:${id}`, "browser.done", { sessionId: id, status: "completed" });
    } catch (err) {
      await this.sessionRepository.update(id, { status: "failed", metadata: { error: String(err) } });
      this.gateway.emit(`browser:${id}`, "browser.done", { sessionId: id, status: "failed", error: String(err) });
    }
  }

  findByOrg(organizationId: string) {
    return this.sessionRepository.findByOrg(organizationId);
  }

  findById(id: string) {
    return this.sessionRepository.findById(id);
  }
}
