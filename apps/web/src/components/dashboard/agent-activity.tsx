"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrg } from "@/lib/org-context";
import { apiFetch } from "@/lib/api";
import { useForgeSocket } from "@/lib/use-forge-socket";

interface ActivityItem {
  _id: string; action: string; entityType: string; entityId: string;
  metadata: Record<string, unknown>; createdAt: string;
  userId?: { name: string; avatar?: string } | null;
}

export function AgentActivity() {
  const { activeOrg } = useOrg();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await apiFetch<{ data: ActivityItem[] }>(`/activities?organizationId=${activeOrg._id}&limit=10`);
      setActivities(res.data);
    } catch { setActivities([]); }
    finally { setLoading(false); }
  }, [activeOrg]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);
  useForgeSocket(activeOrg ? [`org:${activeOrg._id}`] : [], { "agent.message": () => { void fetchActivities(); } });

  return (
    <div className="border border-[#1a1a1a] bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <span className="h-px w-4 bg-[#F6410F]" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#F6410F]">Activity</span>
        </div>
        <span className="text-[10px] text-[#3a3a3a] tracking-[0.1em] uppercase">{activities.length} events</span>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-xs text-[#3a3a3a] text-center py-6 tracking-wide">No recent activity</p>
        ) : (
          <div className="space-y-0 divide-y divide-[#0f0f0f]">
            {activities.map((item, i) => (
              <div key={item._id} className="flex items-center gap-4 py-2.5">
                <span className="text-[10px] font-bold text-[#F6410F] w-5 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">
                    <span className="text-[#6b6b6b]">{item.userId?.name ?? "System"}</span>
                    {" — "}
                    {item.action.replace(/\./g, " ")}
                  </p>
                </div>
                <span className="text-[10px] text-[#3a3a3a] shrink-0 tabular-nums">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
