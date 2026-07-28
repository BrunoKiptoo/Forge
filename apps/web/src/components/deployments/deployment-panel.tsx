"use client";

import { useEffect, useState, useCallback } from "react";
import { Rocket, CheckCircle, AlertCircle, Clock, Loader2, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useForgeSocket } from "@/lib/use-forge-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Deployment {
  _id: string;
  provider: string;
  status: string;
  url: string | null;
  branch: string;
  logs: string[];
  createdAt: string;
  finishedAt: string | null;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  queued: <Clock className="size-3.5 text-muted-foreground" />,
  building: <Loader2 className="size-3.5 text-amber-400 animate-spin" />,
  ready: <CheckCircle className="size-3.5 text-emerald-400" />,
  error: <AlertCircle className="size-3.5 text-red-400" />,
  cancelled: <AlertCircle className="size-3.5 text-muted-foreground" />,
};

const STATUS_BADGE: Record<string, string> = {
  queued: "bg-muted/40 text-muted-foreground",
  building: "bg-amber-500/20 text-amber-400",
  ready: "bg-emerald-500/20 text-emerald-400",
  error: "bg-red-500/20 text-red-400",
  cancelled: "bg-muted/40 text-muted-foreground",
};

export function DeploymentPanel({
  workspaceId,
  organizationId,
  onDeploy,
}: {
  workspaceId: string;
  organizationId: string;
  onDeploy?: () => void;
}) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selected, setSelected] = useState<Deployment | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchDeployments = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: Deployment[] }>(`/deployments?workspaceId=${workspaceId}`);
      setDeployments(res.data);
      setSelected((prev) => prev ? (res.data.find((d) => d._id === prev._id) ?? prev) : prev);
    } catch { /* silent */ }
  }, [workspaceId]);

  useEffect(() => { fetchDeployments(); }, [fetchDeployments]);

  // Subscribe to org-level deployment updates + active deployment room
  const rooms = [`org:${organizationId}`, ...(activeId ? [`deployment:${activeId}`] : [])];
  useForgeSocket(rooms, {
    "deployment.updated": (data) => {
      const { status } = data as { id: string; status: string };
      const terminal = new Set(["ready", "error", "cancelled"]);
      void fetchDeployments();
      if (terminal.has(status)) {
        setDeploying(false);
        setActiveId(null);
      }
    },
  });

  async function handleDeploy() {
    setDeploying(true);
    try {
      const res = await apiFetch<{ data: Deployment }>("/deployments", {
        method: "POST",
        body: JSON.stringify({ organizationId, workspaceId }),
      });
      const dep = res.data;
      setSelected(dep);
      setActiveId(dep._id);
      setDeployments((d) => [dep, ...d]);
      onDeploy?.();
    } catch (err) {
      console.error("Deploy failed", err);
      setDeploying(false);
    }
  }

  const logs = selected?.logs ?? [];

  return (
    <Card className="bg-card/40 border-border/50">
      <CardHeader className="flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Rocket className="size-4 text-muted-foreground" /> Deployments
        </CardTitle>
        <Button size="sm" onClick={handleDeploy} disabled={deploying}>
          {deploying
            ? <><Loader2 className="size-3.5 animate-spin mr-1.5" />Deploying...</>
            : <><Rocket className="size-3.5 mr-1.5" />Deploy</>
          }
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {deployments.length === 0 && !deploying ? (
          <p className="text-xs text-muted-foreground text-center py-3">No deployments yet.</p>
        ) : (
          <div className="space-y-1.5">
            {deployments.slice(0, 5).map((d) => (
              <button
                key={d._id}
                onClick={() => setSelected(d)}
                className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${selected?._id === d._id ? "border-primary/40 bg-primary/5" : "border-border/50 hover:bg-muted/20"}`}
              >
                {STATUS_ICON[d.status] ?? <Clock className="size-3.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{d.provider}</span>
                    <Badge className={`text-[9px] px-1.5 py-0 ${STATUS_BADGE[d.status]}`}>{d.status}</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{d.branch}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(d.createdAt).toLocaleString()}</p>
                </div>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="size-3.5 text-primary" />
                  </a>
                )}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="rounded-lg border border-border/50 bg-black/20">
            <ScrollArea className="h-32 px-3">
              <div className="py-2 font-mono text-[10px] space-y-0.5">
                {logs.map((line, i) => (
                  <p key={i} className={line.includes("Error") ? "text-red-400" : line.includes("ready") ? "text-emerald-400" : "text-muted-foreground"}>
                    {line}
                  </p>
                ))}
                {deploying && selected._id === activeId && <p className="text-amber-400 animate-pulse">▋</p>}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
