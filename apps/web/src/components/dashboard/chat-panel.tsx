"use client";

import { useEffect, useState, useCallback } from "react";
import { Bot } from "lucide-react";
import { useOrg } from "@/lib/org-context";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Agent {
  _id: string;
  name: string;
  type: string;
  provider: string;
  model: string;
  status: string;
  currentTaskId?: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  planner: "bg-purple-500/20 text-purple-400",
  backend: "bg-blue-500/20 text-blue-400",
  frontend: "bg-cyan-500/20 text-cyan-400",
  testing: "bg-emerald-500/20 text-emerald-400",
  reviewer: "bg-amber-500/20 text-amber-400",
  deployment: "bg-pink-500/20 text-pink-400",
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-emerald-500",
  busy: "bg-amber-500",
  offline: "bg-muted-foreground",
  error: "bg-red-500",
};

export function ChatPanel() {
  const { activeOrg } = useOrg();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await apiFetch<{ data: Agent[] }>(
        `/agents?organizationId=${activeOrg._id}`,
      );
      setAgents(res.data);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [activeOrg]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  return (
    <Card className="bg-card/40 border-border/50 flex flex-col h-[400px]">
      <CardHeader className="flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-base font-semibold">Agents</CardTitle>
        <span className="text-xs text-muted-foreground font-mono">
          {agents.length} running
        </span>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-2 py-2">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-3 animate-pulse">
                    <div className="size-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-20 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                ))
              : agents.map((agent) => (
                  <div
                    key={agent._id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition hover:bg-muted/30"
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full",
                          TYPE_COLORS[agent.type] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        <Bot className="size-4" />
                      </div>
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card",
                          STATUS_COLORS[agent.status] ?? "bg-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.type} · {agent.model}
                      </p>
                    </div>
                    <Badge variant={agent.status === "busy" ? "default" : "outline"} className="text-[10px]">
                      {agent.status}
                    </Badge>
                  </div>
                ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
