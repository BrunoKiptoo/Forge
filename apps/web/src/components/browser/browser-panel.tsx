"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Play, Loader2, CheckCircle, XCircle, Image } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useForgeSocket } from "@/lib/use-forge-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ActionLog {
  action: { type: string; selector?: string; value?: string; url?: string };
  success: boolean;
  error?: string;
  hasScreenshot?: boolean;
  screenshot?: string;
  extractedText?: string;
  timestamp: string;
}

interface Session {
  _id: string;
  url: string;
  status: string;
  actions: ActionLog[];
  screenshot: string | null;
  createdAt: string;
}

export function BrowserPanel({
  organizationId,
  workspaceId,
}: {
  organizationId: string;
  workspaceId?: string;
}) {
  const [url, setUrl] = useState("https://");
  const [running, setRunning] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch<{ data: Session[] }>(`/browser/sessions?organizationId=${organizationId}`)
      .then((r) => setSessions(r.data))
      .catch(() => {});
  }, [organizationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const rooms = activeId ? [`browser:${activeId}`] : [];

  useForgeSocket(rooms, {
    "browser.action": (data) => {
      const d = data as ActionLog;
      setLogs((l) => [...l, d]);
      if (d.screenshot) setScreenshot(d.screenshot);
    },
    "browser.done": (data) => {
      const d = data as { status: string };
      setRunning(false);
      setActiveId(null);
      // Refresh session list
      apiFetch<{ data: Session[] }>(`/browser/sessions?organizationId=${organizationId}`)
        .then((r) => setSessions(r.data))
        .catch(() => {});
      setLogs((l) => [...l, {
        action: { type: "system" },
        success: d.status === "completed",
        timestamp: new Date().toISOString(),
      }]);
    },
  });

  async function handleRun() {
    if (!url.trim() || running) return;
    setRunning(true);
    setLogs([]);
    setScreenshot(null);

    try {
      const res = await apiFetch<{ data: Session }>("/browser/run", {
        method: "POST",
        body: JSON.stringify({ organizationId, workspaceId, url }),
      });
      setActiveId(res.data._id);
    } catch (err) {
      setLogs([{ action: { type: "system" }, success: false, error: String(err), timestamp: new Date().toISOString() }]);
      setRunning(false);
    }
  }

  function loadSession(s: Session) {
    setLogs(s.actions as ActionLog[]);
    setScreenshot(s.screenshot);
    setActiveId(null);
  }

  return (
    <Card className="bg-card/40 border-border/50">
      <CardHeader className="flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" /> Browser Agent
        </CardTitle>
        {sessions.length > 0 && (
          <div className="flex gap-1">
            {sessions.slice(0, 3).map((s) => (
              <button
                key={s._id}
                onClick={() => loadSession(s)}
                title={s.url}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] border border-border/50 hover:bg-muted/30 transition"
              >
                {s.status === "completed"
                  ? <CheckCircle className="size-2.5 text-emerald-400" />
                  : <XCircle className="size-2.5 text-red-400" />}
                <span className="max-w-[60px] truncate text-muted-foreground">{new URL(s.url).hostname}</span>
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* URL bar */}
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void handleRun(); }}
            placeholder="https://example.com"
            className="h-8 text-xs font-mono"
            disabled={running}
          />
          <Button size="sm" className="h-8 shrink-0" onClick={handleRun} disabled={running || !url.trim()}>
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Action log */}
          <div className="rounded-lg border border-border/50 bg-black/20">
            <p className="text-[10px] text-muted-foreground px-2 pt-1.5 pb-0.5 font-medium">Actions</p>
            <ScrollArea className="h-40 px-2">
              <div className="pb-2 space-y-1 font-mono text-[10px]">
                {logs.length === 0 && !running && (
                  <p className="text-muted-foreground/50 py-2 text-center">No actions yet</p>
                )}
                {logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    {log.success
                      ? <CheckCircle className="size-2.5 text-emerald-400 mt-0.5 shrink-0" />
                      : <XCircle className="size-2.5 text-red-400 mt-0.5 shrink-0" />}
                    <div className="min-w-0">
                      <span className="text-primary">{log.action.type}</span>
                      {log.action.selector && <span className="text-muted-foreground"> {log.action.selector}</span>}
                      {log.action.url && <span className="text-muted-foreground truncate block">{log.action.url}</span>}
                      {log.error && <span className="text-red-400 block truncate">{log.error}</span>}
                      {log.extractedText && (
                        <span className="text-amber-300/80 block truncate">{log.extractedText.slice(0, 80)}</span>
                      )}
                    </div>
                  </div>
                ))}
                {running && <p className="text-amber-400 animate-pulse">▋</p>}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Screenshot */}
          <div className="rounded-lg border border-border/50 bg-black/20 flex items-center justify-center h-[10.5rem] overflow-hidden">
            {screenshot ? (
              <img
                src={`data:image/png;base64,${screenshot}`}
                alt="Browser screenshot"
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-muted-foreground/40">
                <Image className="size-6" />
                <span className="text-[10px]">Screenshot</span>
              </div>
            )}
          </div>
        </div>

        {/* Status badges */}
        {logs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="text-[9px] px-1.5 py-0 bg-muted/40 text-muted-foreground">
              {logs.length} actions
            </Badge>
            <Badge className={`text-[9px] px-1.5 py-0 ${running ? "bg-amber-500/20 text-amber-400" : logs.at(-1)?.success ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {running ? "running" : logs.at(-1)?.success ? "done" : "failed"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
