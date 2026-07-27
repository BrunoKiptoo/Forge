"use client";

import { tasks } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  high: "text-red-400 border-red-400/20 bg-red-400/5",
  medium: "text-amber-400 border-amber-400/20 bg-amber-400/5",
  low: "text-blue-400 border-blue-400/20 bg-blue-400/5",
};

const statusIcons: Record<string, string> = {
  completed: "✓",
  "in-progress": "●",
  review: "○",
  pending: "○",
};

const statusStyles: Record<string, string> = {
  completed: "text-emerald-400",
  "in-progress": "text-amber-400 animate-pulse",
  review: "text-blue-400",
  pending: "text-muted-foreground",
};

export function TaskTimeline() {
  return (
    <Card className="bg-card/40 border-border/50">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Task Timeline</CardTitle>
        <span className="text-xs text-muted-foreground font-mono">
          {tasks.filter((t) => t.status === "in-progress").length} active
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <span className={cn("mt-0.5 text-sm font-mono", statusStyles[task.status])}>
                {statusIcons[task.status]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] h-4 px-1.5", priorityColors[task.priority])}
                  >
                    {task.priority}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{task.assignee}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">{task.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
