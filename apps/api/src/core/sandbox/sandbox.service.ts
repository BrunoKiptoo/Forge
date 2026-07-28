import { Injectable, Logger } from "@nestjs/common";
import { spawn } from "child_process";
import { join } from "path";

export interface SandboxResult {
  exitCode: number;
  logs: string[];
  durationMs: number;
}

export interface SandboxOptions {
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
}

// Commands that are safe to run in the sandbox
const ALLOWED_COMMANDS = new Set([
  "node", "npm", "npx", "pnpm", "yarn",
  "tsc", "eslint", "prettier",
  "git", "ls", "cat", "echo", "pwd", "mkdir", "cp", "mv", "rm",
  "curl", "wget",
  "sh", "bash",
]);

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);
  private readonly defaultCwd = process.cwd();
  private readonly defaultTimeoutMs = 60_000; // 1 minute

  isAllowed(command: string): boolean {
    const base = command.trim().split(/\s+/)[0] ?? "";
    // Allow compound commands via sh -c
    if (base === "sh" || base === "bash") return true;
    return ALLOWED_COMMANDS.has(base);
  }

  async exec(command: string, options: SandboxOptions = {}): Promise<SandboxResult> {
    const logs: string[] = [];
    for await (const line of this.stream(command, options)) {
      logs.push(line.text);
    }
    const last = logs[logs.length - 1] ?? "";
    const exitMatch = last.match(/\[exit:(\d+)\]/);
    const exitCode = exitMatch ? parseInt(exitMatch[1]!) : 0;
    const cleanLogs = logs.filter((l) => !l.startsWith("[exit:"));
    return { exitCode, logs: cleanLogs, durationMs: 0 };
  }

  async *stream(command: string, options: SandboxOptions = {}): AsyncGenerator<{ text: string; stream: "stdout" | "stderr" | "system" }> {
    const cwd = options.cwd
      ? join(this.defaultCwd, options.cwd)
      : this.defaultCwd;

    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;

    // Always run via sh -c for compound commands (&&, pipes, etc.)
    const child = spawn("sh", ["-c", command], {
      cwd,
      env: { ...process.env, ...options.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.logger.log(`Sandbox exec [pid:${child.pid}]: ${command}`);

    const startedAt = Date.now();
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    const queue: { text: string; stream: "stdout" | "stderr" | "system" }[] = [];
    let resolve: (() => void) | null = null;
    let done = false;

    function push(item: { text: string; stream: "stdout" | "stderr" | "system" }) {
      queue.push(item);
      resolve?.();
      resolve = null;
    }

    child.stdout.on("data", (chunk: Buffer) => {
      for (const line of chunk.toString().split("\n")) {
        if (line) push({ text: line, stream: "stdout" });
      }
    });

    child.stderr.on("data", (chunk: Buffer) => {
      for (const line of chunk.toString().split("\n")) {
        if (line) push({ text: line, stream: "stderr" });
      }
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startedAt;
      if (killed) push({ text: `[TIMEOUT after ${timeoutMs}ms]`, stream: "system" });
      push({ text: `[exit:${code ?? 1}] duration:${durationMs}ms`, stream: "system" });
      done = true;
      resolve?.();
      resolve = null;
    });

    while (!done || queue.length > 0) {
      if (queue.length === 0) {
        await new Promise<void>((r) => { resolve = r; });
      }
      while (queue.length > 0) {
        yield queue.shift()!;
      }
    }
  }
}
