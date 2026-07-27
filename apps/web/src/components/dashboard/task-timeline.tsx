"use client";

import { useEffect, useState, useCallback } from "react";
import { Play, MessageSquare, ShieldCheck, ShieldX, Clock } from "lucide-react";
import { useOrg } from "@/lib/org-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { useForgeSocket } from "@/lib/use-forge-socket";
import { CommentThread } from "@/components/comments/comment-thread";
import { ApprovalDialog } from "./approval-dialog";
import type { ApprovalPayload } from "./approval-dialog";

interface TaskItem {
  _id: string; title: string; status: string; priority: string;
  projectId: string; assignedAgent?: string | null; updatedAt: string;
}
interface ApprovalItem {
  _id: string; status: string; note: string | null;
  planSnapshot: Record<string, unknown>; createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  planning: "text-[#6b6b6b] border-[#2a2a2a]",
  queued: "text-[#6b6b6b] border-[#2a2a2a]",
  running: "text-[#F6410F] border-[#F6410F]/30",
  waiting: "text-[#6b6b6b] border-[#2a2a2a]",
  review: "text-amber-400 border-amber-400/30",
  completed: "text-white border-[#3a3a3a]",
  failed: "text-red-400 border-red-400/30",
  cancelled: "text-[#3a3a3a] border-[#2a2a2a]",
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-[#3a3a3a]", medium: "text-[#6b6b6b]", high: "text-amber-400", critical: "text-red-400",
};

export function TaskTimeline({ onSelectTask, refreshKey }: {
  onSelectTask?: (taskId: string, taskTitle: string) => void;
  refreshKey?: number;
}) {
  const { activeOrg } = useOrg();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [approval, setApproval] = useState<ApprovalPayload | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [taskApprovals, setTaskApprovals] = useState<Record<string, ApprovalItem | null>>({});
  const [resolvingApproval, setResolvingApproval] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await apiFetch<{ data: TaskItem[] }>(`/tasks?organizationId=${activeOrg._id}`);
      setTasks(res.data);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  }, [activeOrg]);

  useEffect(() => { fetchTasks(); }, [fetchTasks, refreshKey]);

  useEffect(() => {
    if (!tasks.length) return;
    tasks.forEach((task) => {
      apiFetch<{ data: unknown[] }>(`/comments?entityType=task&entityId=${task._id}`)
        .then((r) => setCommentCounts((p) => ({ ...p, [task._id]: r.data.length }))).catch(() => {});
      if (task.status === "review") {
        apiFetch<{ data: ApprovalItem[] }>(`/approvals/task/${task._id}`)
          .then((r) => setTaskApprovals((p) => ({ ...p, [task._id]: r.data.find((a) => a.status === "pending") ?? null }))).catch(() => {});
      }
    });
  }, [tasks]);

  useForgeSocket(activeOrg ? [`org:${activeOrg._id}`] : [], {
    "task.updated": () => { void fetchTasks(); },
    "approval.updated": () => { void fetchTasks(); },
    "comment.created": (data) => {
      const d = data as { entityId: string };
      apiFetch<{ data: unknown[] }>(`/comments?entityType=task&entityId=${d.entityId}`)
        .then((r) => setCommentCounts((p) => ({ ...p, [d.entityId]: r.data.length }))).catch(() => {});
    },
  });

  async function handleExecuteClick(e: React.MouseEvent, task: TaskItem) {
    e.stopPropagation();
    setPreviewing(task._id);
    try {
      const res = await apiFetch<{ data: { plan: ApprovalPayload["plan"]; costMeta: ApprovalPayload["costMeta"] } }>(
        `/agents/preview`, { method: "POST", body: JSON.stringify({ taskId: task._id }) },
      );
      setApproval({ plan: res.data.plan, costMeta: res.data.costMeta, taskTitle: task.title, taskId: task._id });
    } catch { await runOrchestrate(task._id, task.title); }
    finally { setPreviewing(null); }
  }

  async function handleRequestApproval(e: React.MouseEvent, task: TaskItem) {
    e.stopPropagation();
    if (!activeOrg || !user) return;
    try {
      await apiFetch("/approvals", { method: "POST", body: JSON.stringify({ organizationId: activeOrg._id, taskId: task._id }) });
      await fetchTasks();
    } catch { /* silent */ }
  }

  async function handleResolveApproval(e: React.MouseEvent, approvalId: string, taskId: string, status: "approved" | "rejected") {
    e.stopPropagation();
    setResolvingApproval(approvalId);
    try {
      await apiFetch(`/approvals/${approvalId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setTaskApprovals((p) => ({ ...p, [taskId]: null }));
      await fetchTasks();
    } finally { setResolvingApproval(null); }
  }

  async function runOrchestrate(taskId: string, taskTitle: string) {
    await apiFetch(`/tasks/${taskId}/execute`, { method: "POST" });
    onSelectTask?.(taskId, taskTitle);
    await fetchTasks();
  }

  return (
    <>
      <div className="border border-[#1a1a1a] bg-black">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <span className="h-px w-4 bg-[#F6410F]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#F6410F]">Tasks</span>
          </div>
          <span className="text-[10px] text-[#3a3a3a] tracking-[0.1em] uppercase">{tasks.length} total</span>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse" />)}
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-xs text-[#3a3a3a] text-center py-8 tracking-wide">No tasks yet. Use &ldquo;New Task&rdquo; to create one.</p>
          ) : (
            <div className="space-y-0 divide-y divide-[#0f0f0f]">
              {tasks.map((task, i) => {
                const pendingApproval = taskApprovals[task._id];
                const commentCount = commentCounts[task._id] ?? 0;
                const isExpanded = expandedTask === task._id;
                const statusClass = STATUS_COLOR[task.status] ?? "text-[#6b6b6b] border-[#2a2a2a]";

                return (
                  <div key={task._id}>
                    <div
                      className="flex items-center gap-4 py-3 cursor-pointer hover:bg-[#080808] transition-all px-1"
                      onClick={() => onSelectTask?.(task._id, task.title)}
                    >
                      {/* Index */}
                      <span className="text-[10px] font-bold text-[#2a2a2a] w-5 shrink-0 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-semibold tracking-[0.15em] uppercase border px-1.5 py-0.5 ${statusClass}`}>
                            {task.status}
                          </span>
                          <span className={`text-[9px] tracking-[0.1em] uppercase ${PRIORITY_COLOR[task.priority] ?? "text-[#3a3a3a]"}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedTask(isExpanded ? null : task._id); }}
                          className="flex items-center gap-1 text-[10px] text-[#3a3a3a] hover:text-white transition px-2 py-1"
                        >
                          <MessageSquare className="size-3" />
                          {commentCount > 0 && <span>{commentCount}</span>}
                        </button>

                        {(task.status === "planning" || task.status === "queued") && (
                          <button
                            className="text-[10px] text-[#4a4a4a] hover:text-amber-400 transition px-2 py-1 flex items-center gap-1"
                            onClick={(e) => void handleRequestApproval(e, task)}
                          >
                            <Clock className="size-3" /> Review
                          </button>
                        )}

                        {(task.status === "planning" || task.status === "queued") && (
                          <button
                            className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] uppercase bg-[#F6410F] text-white px-3 py-1.5 hover:bg-[#d93a0d] transition disabled:opacity-50"
                            disabled={previewing === task._id}
                            onClick={(e) => { void handleExecuteClick(e, task); }}
                          >
                            <Play className="size-2.5" />
                            {previewing === task._id ? "..." : "Run"}
                          </button>
                        )}

                        {task.status === "review" && pendingApproval && (
                          <div className="flex items-center gap-1">
                            <button
                              className="text-[10px] text-white bg-white/10 hover:bg-white/20 px-2 py-1 flex items-center gap-1 transition disabled:opacity-50"
                              disabled={resolvingApproval === pendingApproval._id}
                              onClick={(e) => void handleResolveApproval(e, pendingApproval._id, task._id, "approved")}
                            >
                              <ShieldCheck className="size-3 text-white" /> Approve
                            </button>
                            <button
                              className="text-[10px] text-red-400 hover:bg-red-500/10 px-2 py-1 flex items-center gap-1 transition disabled:opacity-50"
                              disabled={resolvingApproval === pendingApproval._id}
                              onClick={(e) => void handleResolveApproval(e, pendingApproval._id, task._id, "rejected")}
                            >
                              <ShieldX className="size-3" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {isExpanded && user && (
                      <div className="border-t border-[#1a1a1a] px-5 py-4 bg-[#050505]">
                        <CommentThread
                          organizationId={activeOrg!._id}
                          entityType="task"
                          entityId={task._id}
                          currentUserId={user.id}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {approval && (
        <ApprovalDialog
          payload={approval}
          onApprove={async () => { await runOrchestrate(approval.taskId, approval.taskTitle); setApproval(null); }}
          onCancel={() => setApproval(null)}
        />
      )}
    </>
  );
}
