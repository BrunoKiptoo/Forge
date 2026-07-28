import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import { chromium, Browser, BrowserContext, Page } from "playwright";

export interface BrowserAction {
  type: "navigate" | "click" | "type" | "scroll" | "screenshot" | "extract";
  selector?: string;
  value?: string;
  url?: string;
}

export interface BrowserActionResult {
  action: BrowserAction;
  success: boolean;
  data?: string; // screenshot base64 or extracted text
  error?: string;
  timestamp: Date;
}

@Injectable()
export class BrowserCoreService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserCoreService.name);
  private browser: Browser | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    }
    return this.browser;
  }

  async newContext(): Promise<BrowserContext> {
    const browser = await this.getBrowser();
    return browser.newContext({ viewport: { width: 1280, height: 800 } });
  }

  async runSession(
    url: string,
    actions: BrowserAction[],
    onResult: (result: BrowserActionResult) => void,
  ): Promise<BrowserActionResult[]> {
    const context = await this.newContext();
    const page = await context.newPage();
    const results: BrowserActionResult[] = [];

    try {
      // Always navigate first
      const navResult = await this.executeAction(page, { type: "navigate", url });
      results.push(navResult);
      onResult(navResult);

      for (const action of actions) {
        const result = await this.executeAction(page, action);
        results.push(result);
        onResult(result);
        if (!result.success) break;
      }

      // Always take a final screenshot
      const shot = await this.executeAction(page, { type: "screenshot" });
      results.push(shot);
      onResult(shot);
    } finally {
      await context.close();
    }

    return results;
  }

  private async executeAction(page: Page, action: BrowserAction): Promise<BrowserActionResult> {
    const timestamp = new Date();
    try {
      switch (action.type) {
        case "navigate":
          await page.goto(action.url!, { waitUntil: "domcontentloaded", timeout: 30_000 });
          return { action, success: true, timestamp };

        case "click":
          await page.click(action.selector!, { timeout: 10_000 });
          return { action, success: true, timestamp };

        case "type":
          await page.fill(action.selector!, action.value ?? "", { timeout: 10_000 });
          return { action, success: true, timestamp };

        case "scroll":
          await page.evaluate((sel) => {
            const el = sel ? document.querySelector(sel) : window;
            el?.scrollBy(0, 500);
          }, action.selector ?? null);
          return { action, success: true, timestamp };

        case "screenshot": {
          const buf = await page.screenshot({ type: "png", fullPage: false });
          return { action, success: true, data: buf.toString("base64"), timestamp };
        }

        case "extract": {
          const text = action.selector
            ? await page.textContent(action.selector, { timeout: 10_000 })
            : await page.evaluate(() => document.body.innerText);
          return { action, success: true, data: text ?? "", timestamp };
        }

        default:
          return { action, success: false, error: `Unknown action type: ${action.type}`, timestamp };
      }
    } catch (err) {
      this.logger.warn(`Browser action failed: ${action.type} — ${String(err)}`);
      return { action, success: false, error: String(err), timestamp };
    }
  }

  async onModuleDestroy() {
    await this.browser?.close();
  }
}
