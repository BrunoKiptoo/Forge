"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Brain, Zap, GitBranch, Clock, CheckCircle, AlertCircle, Loader2, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useOrg } from "@/lib/org-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateGoalDialog } from "./create-goal-dialog";
import { MemoryPanel } from "./memory-panel";
import { DeploymentPanel } from "@/components/deployments/deployment-panel";
import { EnvironmentPipeline } from "@/components/environments/environment-pipeline";
import { BrowserPanel } from "@/components/browser/browser-panel";

interface Workspace {
  _id: string;
  name: string;
  repositoryId: string;
  defaultBranch: string;
  deploymentTarget: string;
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  taskIds: string[];
  createdAt: string;
}

interface MemoryEntry {
  _id: string;
  category: "architectural_decision" | "coding_standard" | "convention" | "ai_decision" | "lesson_learned" | "completed_goal" | "known_bug" | "tech_stack";
  key: string;
  value: string;
  createdAt: string;
}

const GOAL_STATUS_ICON: Record<string, React.ReactNode> = {
  draft: <Clock className="size-3.5 text-muted-foreground" />,
  active: <Zap className="size-3.5 text-blue-400" />,
  in_progress: <Loader2 className="size-3.5 text-amber-400 animate-spin" />,
  completed: <CheckCircle className="size-3.5 text-emerald-400" />,
  failed: <AlertCircle className="size-3.5 text-red-400" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-blue-400",
  high: "text-amber-400",
  critical: "text-red-400",
};

export function WorkspaceDashboard({ workspaceId }: { workspaceId: string }) {
  const { activeOrg } = useOrg();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [wsRes, goalsRes, memRes] = await Promise.all([
        apiFetch<{ data: Workspace }>(`/workspaces/${workspaceId}`),
        apiFetch<{ data: Goal[] }>(`/goals?workspaceId=${workspaceId}`),
        apiFetch<{ data: MemoryEntry[] }>(`/workspaces/${workspaceId}/memory`),
      ]);
      setWorkspace(wsRes.data);
      setGoals(goalsRes.data);
      setMemory(memRes.data);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeGoal = goals.find((g) => g.status === "in_progress" || g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{workspace?.name ?? "Workspace"}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
            {workspace?.repositoryId && (
              <span className="flex items-center gap-1">
                <GitBranch className="size-3.5" />
                {workspace.repositoryId} ({workspace.defaultBranch})
              </span>
            )}
            {workspace?.deploymentTarget && (
              <span>→ {workspace.deploymentTarget}</span>
            )}
          </div>
        </div>
        <Button size="sm" onClick={() => setGoalDialogOpen(true)}>
          <Plus className="size-3.5 mr-1.5" /> New Goal
        </Button>
      </div>

      <EnvironmentPipeline workspaceId={workspaceId} organizationId={activeOrg?._id ?? ""} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Goals", value: goals.length, icon: <Target className="size-4 text-primary" /> },
          { label: "Completed", value: completedGoals, icon: <CheckCircle className="size-4 text-emerald-400" /> },
          { label: "Memory Entries", value: memory.length, icon: <Brain className="size-4 text-purple-400" /> },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/40 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Goals list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active goal highlight */}
          {activeGoal && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 text-primary animate-spin" />
                  <CardTitle className="text-sm font-semibold text-primary">Active Goal</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{activeGoal.title}</p>
                {activeGoal.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activeGoal.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-[10px]">{activeGoal.taskIds.length} tasks</Badge>
                  <span className={`text-xs ${PRIORITY_COLORS[activeGoal.priority]}`}>{activeGoal.priority}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All goals */}
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="size-4 text-muted-foreground" /> Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-72">
                <div className="px-4 pb-4 space-y-2">
                  {goals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No goals yet. Create one to start autonomous execution.
                    </p>
                  ) : (
                    goals.map((goal) => (
                      <div key={goal._id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                        <div className="mt-0.5">{GOAL_STATUS_ICON[goal.status] ?? <Clock className="size-3.5" />}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{goal.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">{goal.status}</Badge>
                            <span className={`text-xs ${PRIORITY_COLORS[goal.priority]}`}>{goal.priority}</span>
                            <span className="text-[10px] text-muted-foreground">{goal.taskIds.length} tasks</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Memory panel */}
        <div className="space-y-4">
          <MemoryPanel workspaceId={workspaceId} entries={memory} onRefresh={fetchAll} organizationId={activeOrg?._id ?? ""} />
          <DeploymentPanel workspaceId={workspaceId} organizationId={activeOrg?._id ?? ""} />
          <BrowserPanel organizationId={activeOrg?._id ?? ""} workspaceId={workspaceId} />
        </div>
      </div>

      <CreateGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        workspaceId={workspaceId}
        organizationId={activeOrg?._id ?? ""}
        onCreated={fetchAll}
      />
    </div>
  );
}
