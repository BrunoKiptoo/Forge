"use client";

import { useState } from "react";
import { StatsCards } from "./stats-cards";
import { TopNav } from "./top-nav";
import { AgentActivity } from "./agent-activity";
import { TaskTimeline } from "./task-timeline";
import { ChatPanel } from "./chat-panel";
import { TerminalPanel } from "./terminal-panel";
import { ArtifactPanel } from "./artifact-panel";
import { RepoBrowser } from "@/components/git/repo-browser";

export function DashboardContent() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-black">
      <TopNav onTaskCreated={() => setRefreshKey((k) => k + 1)} />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">

          {/* Page header */}
          <div className="border-b border-[#1a1a1a] pb-6 pt-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-5 bg-[#F6410F]" />
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#F6410F]">Overview</span>
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-white">Dashboard</h1>
            <p className="text-sm text-[#a0a0a0] mt-1">Monitor your AI agents and project activity.</p>
          </div>

          <StatsCards />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <AgentActivity />
              <TaskTimeline
                onSelectTask={(id, title) => { setSelectedTaskId(id); setSelectedTaskTitle(title); }}
                refreshKey={refreshKey}
              />
            </div>
            <div className="space-y-6">
              <ChatPanel />
              <RepoBrowser />
              <TerminalPanel />
              <ArtifactPanel taskId={selectedTaskId} taskTitle={selectedTaskTitle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
