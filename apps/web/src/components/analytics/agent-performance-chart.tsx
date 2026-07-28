"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AgentStat {
  agentType: string;
  total: number;
  completed: number;
  failed: number;
  successRate: number;
}

export function AgentPerformanceChart({ data }: { data: AgentStat[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No agent executions yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="agentType" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" domain={[0, 100]} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`${value ?? 0}%`, "Success Rate"]}
        />
        <Bar dataKey="successRate" radius={[4, 4, 0, 0]} name="Success Rate">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.successRate >= 80 ? "#34d399" : entry.successRate >= 50 ? "#fbbf24" : "#f87171"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
