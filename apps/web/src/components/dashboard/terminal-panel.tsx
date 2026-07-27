"use client";

import { terminalLines } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  command: "text-cyan-400",
  output: "text-muted-foreground",
  success: "text-emerald-400",
  error: "text-red-400",
};

export function TerminalPanel() {
  return (
    <Card className="bg-card/40 border-border/50 flex flex-col h-[400px]">
      <CardHeader className="flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-base font-semibold">Terminal</CardTitle>
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400/80" />
          <div className="size-2.5 rounded-full bg-amber-400/80" />
          <div className="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 font-mono text-sm leading-relaxed">
            {terminalLines.map((line) => (
              <div key={line.id} className={cn("py-0.5", typeStyles[line.type])}>
                {line.content}
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 text-muted-foreground">
              <span className="text-cyan-400">$</span>
              <span className="w-2 h-4 bg-muted-foreground/50 animate-pulse rounded-sm" />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
