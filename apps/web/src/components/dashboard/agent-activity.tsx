"use client";

import { agentActivities } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function AgentActivity() {
  return (
    <Card className="bg-card/40 border-border/50">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Live Agent Activity</CardTitle>
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {agentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div
                className={cn(
                  "mt-0.5 rounded-lg p-1.5 shrink-0",
                  activity.status === "running"
                    ? "bg-amber-400/10 text-amber-400 animate-pulse"
                    : "bg-primary/10 text-primary",
                )}
              >
                <activity.icon className="size-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{activity.detail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={activity.status === "running" ? "secondary" : "outline"}
                  className={cn(
                    "text-[10px] h-5 px-1.5 font-mono",
                    activity.status === "running" && "bg-amber-400/10 text-amber-400 border-amber-400/20",
                  )}
                >
                  {activity.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono w-14 text-right">
                  {activity.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
