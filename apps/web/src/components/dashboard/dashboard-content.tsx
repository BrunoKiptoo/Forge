"use client";

import { StatsCards } from "./stats-cards";
import { TopNav } from "./top-nav";
import { AgentActivity } from "./agent-activity";
import { TaskTimeline } from "./task-timeline";
import { ChatPanel } from "./chat-panel";
import { TerminalPanel } from "./terminal-panel";

export function DashboardContent() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <TopNav />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor your AI agents and project activity.
              </p>
            </div>
          </div>

          <StatsCards />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <AgentActivity />
              <TaskTimeline />
            </div>
            <div className="space-y-6">
              <ChatPanel />
              <TerminalPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
