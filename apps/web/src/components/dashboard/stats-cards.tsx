"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrg } from "@/lib/org-context";
import { apiFetch } from "@/lib/api";

interface TaskStats {
  running: number; completed: number; failed: number; completedToday: number; total: number;
}

export function StatsCards() {
  const { activeOrg } = useOrg();
  const [stats, setStats] = useState<TaskStats | null>(null);

  const fetchStats = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await apiFetch<{ data: TaskStats }>(`/tasks/stats?organizationId=${activeOrg._id}`);
      setStats(res.data);
    } catch { setStats(null); }
  }, [activeOrg]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (!activeOrg) return null;

  const cards = [
    { label: "Running", value: stats?.running ?? "—", accent: "#F6410F" },
    { label: "Completed Today", value: stats?.completedToday ?? "—", accent: "#ffffff" },
    { label: "Failed", value: stats?.failed ?? "—", accent: "#ef4444" },
    { label: "Total Tasks", value: stats?.total ?? "—", accent: "#a0a0a0" },
  ];

  return (
    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 border border-[#1a1a1a]">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`p-5 bg-black ${i < 3 ? "border-r border-[#1a1a1a]" : ""} ${i < 2 ? "sm:border-b lg:border-b-0 border-[#1a1a1a]" : ""}`}
        >
          <div className="text-2xl font-bold tracking-tight" style={{ color: card.accent }}>
            {stats === null ? <span className="text-[#2a2a2a]">—</span> : card.value}
          </div>
          <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#888888] mt-1.5">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
