"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrg } from "@/lib/org-context";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Agent {
  _id: string;
  name: string;
  type: string;
  provider: string;
  model: string;
  status: string;
}

const TYPE_COLORS: Record<string, string> = {
  planner: "text-purple-400",
  backend: "text-blue-400",
  frontend: "text-cyan-400",
  testing: "text-emerald-400",
  reviewer: "text-amber-400",
  deployment: "text-pink-400",
};

const STATUS_DOT: Record<string, string> = {
  idle: "bg-emerald-500",
  busy: "bg-amber-500",
  offline: "bg-[#444]",
  error: "bg-red-500",
};

export function ChatPanel() {
  const { activeOrg } = useOrg();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await apiFetch<{ data: Agent[] }>(`/agents?organizationId=${activeOrg._id}`);
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

  const runningCount = agents.filter((a) => a.status === "busy").length;

  return (
    <div className="border border-[#1a1a1a] bg-black">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <span className="h-px w-4 bg-[#F6410F]" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#F6410F]">Agents</span>
        </div>
        <span className="text-[10px] text-[#888888] tracking-[0.1em] uppercase">{runningCount} running</span>
      </div>

      <div className="p-4 space-y-0 divide-y divide-[#0f0f0f]">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse mb-2" />
          ))
        ) : agents.length === 0 ? (
          <p className="text-xs text-[#888888] text-center py-6 tracking-wide">No agents found</p>
        ) : (
          agents.map((agent) => (
            <div key={agent._id} className="flex items-center gap-3 py-2.5">
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[agent.status] ?? "bg-[#444]")} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">
                  <span className={cn("font-medium", TYPE_COLORS[agent.type] ?? "text-[#a0a0a0]")}>
                    {agent.name}
                  </span>
                  <span className="text-[#888888]"> · {agent.type}</span>
                </p>
              </div>
              <span className="text-[10px] text-[#888888] shrink-0 tracking-wide">{agent.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
