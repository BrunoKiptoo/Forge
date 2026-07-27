"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DataPoint {
  date: string;
  cost: number;
  tokens: number;
  executions: number;
}

export function CostChart({ data }: { data: DataPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cost: Math.round(d.cost * 10000) / 10000,
    tokens: Math.round(d.tokens / 1000 * 10) / 10, // display in K
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis yAxisId="cost" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <YAxis yAxisId="tokens" orientation="right" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="K" />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line yAxisId="cost" type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Cost ($)" />
        <Line yAxisId="tokens" type="monotone" dataKey="tokens" stroke="#60a5fa" strokeWidth={2} dot={false} name="Tokens (K)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
