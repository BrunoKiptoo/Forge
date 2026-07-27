"use client";

import { statsCards } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsCards.map(({ icon: Icon, label, value, change }) => (
        <Card key={label} className="bg-card/40 border-border/50 hover:border-primary/20 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Icon className="size-3.5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <span className={`text-xs font-medium ${change.startsWith("+") ? "text-emerald-400" : "text-cyan-400"}`}>
                {change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
