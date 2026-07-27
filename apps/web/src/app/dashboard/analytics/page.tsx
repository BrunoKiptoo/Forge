"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, Zap, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useOrg } from "@/lib/org-context";
import { CostChart } from "@/components/analytics/cost-chart";
import { AgentPerformanceChart } from "@/components/analytics/agent-performance-chart";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";

interface Summary {
  tokenUsage: { totalTokens: number; totalCost: number; byProvider: { provider: string; tokens: number; cost: number; calls: number }[] };
  overallSuccessRate: number; totalExecutions: number; recentFailures: number;
}
interface CostPoint { date: string; cost: number; tokens: number; executions: number }
interface AgentStat { agentType: string; total: number; completed: number; failed: number; successRate: number }
interface Failure { id: string; taskId: string; error: unknown; startedAt: string }

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-[#1a1a1a] bg-black">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#1a1a1a]">
        <span className="h-px w-4 bg-[#F6410F]" />
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#F6410F]">{title}</span>
        <span className="text-[#3a3a3a] ml-auto">{icon}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { activeOrg } = useOrg();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [costData, setCostData] = useState<CostPoint[]>([]);
  const [agentData, setAgentData] = useState<AgentStat[]>([]);
  const [failures, setFailures] = useState<Failure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!activeOrg) return;
    const id = activeOrg._id;
    try {
      const [sumRes, costRes, agentRes, failRes] = await Promise.all([
        apiFetch<{ data: Summary }>(`/analytics/summary?organizationId=${id}`),
        apiFetch<{ data: CostPoint[] }>(`/analytics/cost?organizationId=${id}&days=14`),
        apiFetch<{ data: AgentStat[] }>(`/analytics/agents?organizationId=${id}`),
        apiFetch<{ data: Failure[] }>(`/analytics/failures?organizationId=${id}&limit=10`),
      ]);
      setSummary(sumRes.data); setCostData(costRes.data); setAgentData(agentRes.data); setFailures(failRes.data);
    } catch { /* empty state */ }
    finally { setLoading(false); }
  }, [activeOrg]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const summaryCards = summary ? [
    { label: "Total Tokens", value: summary.tokenUsage.totalTokens.toLocaleString(), icon: <Zap className="size-4" />, sub: "all time", accent: "#ffffff" },
    { label: "Total Cost", value: `$${summary.tokenUsage.totalCost.toFixed(4)}`, icon: <DollarSign className="size-4" />, sub: "estimated", accent: "#ffffff" },
    { label: "Success Rate", value: `${summary.overallSuccessRate}%`, icon: <CheckCircle className="size-4" />, sub: `${summary.totalExecutions} executions`, accent: "#F6410F" },
    { label: "Recent Failures", value: String(summary.recentFailures), icon: <AlertCircle className="size-4" />, sub: "last 10", accent: "#ef4444" },
  ] : [];

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <MobileSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-6 max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="border-b border-[#1a1a1a] pb-6 pt-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-5 bg-[#F6410F]" />
                <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#F6410F]">Observability</span>
              </div>
              <h1 className="text-2xl font-bold tracking-[-0.03em] text-white">Analytics</h1>
              <p className="text-sm text-[#4a4a4a] mt-1">Token usage, cost, agent performance, and failure diagnostics.</p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 border border-[#1a1a1a]">
              {loading
                ? [1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-[#0a0a0a] border-r border-[#1a1a1a] animate-pulse last:border-r-0" />)
                : summaryCards.map((card, i) => (
                  <div key={card.label} className={`p-5 bg-black ${i < 3 ? "border-r border-[#1a1a1a]" : ""}`}>
                    <div className="text-2xl font-bold tracking-tight" style={{ color: card.accent }}>{card.value}</div>
                    <div className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#4a4a4a] mt-1.5">{card.label}</div>
                    <div className="text-[10px] text-[#3a3a3a] mt-0.5">{card.sub}</div>
                  </div>
                ))
              }
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Cost & Tokens — 14 Days" icon={<TrendingUp className="size-3.5" />}>
                {loading ? <div className="h-[220px] bg-[#0a0a0a] animate-pulse" /> : <CostChart data={costData} />}
              </Panel>
              <Panel title="Agent Success Rate" icon={<CheckCircle className="size-3.5" />}>
                {loading ? <div className="h-[220px] bg-[#0a0a0a] animate-pulse" /> : <AgentPerformanceChart data={agentData} />}
              </Panel>
            </div>

            {/* Provider breakdown */}
            {summary && summary.tokenUsage.byProvider.length > 0 && (
              <Panel title="Provider Breakdown" icon={<Zap className="size-3.5" />}>
                <div className="divide-y divide-[#0f0f0f]">
                  {summary.tokenUsage.byProvider.map((p) => (
                    <div key={p.provider} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase border border-[#2a2a2a] px-2 py-0.5 text-[#6b6b6b]">{p.provider}</span>
                        <span className="text-xs text-[#4a4a4a]">{p.calls} calls</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <span className="text-[#6b6b6b]">{p.tokens.toLocaleString()} tokens</span>
                        <span className="font-semibold text-white">${p.cost.toFixed(4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* Failures */}
            <Panel title="Failure Diagnostics" icon={<AlertCircle className="size-3.5 text-red-400" />}>
              {loading ? (
                <div className="h-32 bg-[#0a0a0a] animate-pulse" />
              ) : failures.length === 0 ? (
                <p className="text-xs text-[#3a3a3a] text-center py-8 tracking-wide">No failures recorded.</p>
              ) : (
                <div className="divide-y divide-[#0f0f0f]">
                  {failures.map((f) => (
                    <div key={f.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono text-[#4a4a4a]">task: {f.taskId}</p>
                        <p className="text-xs text-red-400 mt-0.5 truncate">{String(f.error)}</p>
                      </div>
                      <p className="text-[10px] text-[#3a3a3a] shrink-0 tabular-nums">
                        {new Date(f.startedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
