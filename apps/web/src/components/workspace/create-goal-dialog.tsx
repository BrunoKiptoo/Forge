"use client";

import { useState } from "react";
import { Loader2, Target, Plus, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  organizationId: string;
  projectId?: string;
  onCreated: () => void;
}

export function CreateGoalDialog({ open, onOpenChange, workspaceId, organizationId, projectId, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [criteria, setCriteria] = useState<string[]>([""]);
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle(""); setDescription(""); setObjective("");
    setCriteria([""]); setPriority("medium"); setDeadline(""); setError(null);
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/goals", {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          organizationId,
          projectId: projectId ?? organizationId, // fallback
          title: title.trim(),
          description: description.trim(),
          objective: objective.trim(),
          successCriteria: criteria.filter(Boolean),
          priority,
          deadline: deadline || undefined,
        }),
      });
      reset();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => { reset(); onOpenChange(false); }} />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-card shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center gap-3 p-5 border-b border-border shrink-0">
          <Target className="size-5 text-primary" />
          <h2 className="text-base font-semibold">New Goal</h2>
          <p className="text-xs text-muted-foreground ml-auto">Forge will auto-decompose this into tasks</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="grid gap-1.5">
            <Label>Goal Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Implement user authentication with OAuth" />
          </div>

          <div className="grid gap-1.5">
            <Label>Description</Label>
            <textarea
              className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be built?"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Objective</Label>
            <Input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g. Allow users to sign in with GitHub and Google" />
          </div>

          <div className="grid gap-1.5">
            <Label>Success Criteria</Label>
            <div className="space-y-2">
              {criteria.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={c}
                    onChange={(e) => { const next = [...criteria]; next[i] = e.target.value; setCriteria(next); }}
                    placeholder={`Criterion ${i + 1}`}
                  />
                  {criteria.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => setCriteria(criteria.filter((_, j) => j !== i))}>
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setCriteria([...criteria, ""])}>
                <Plus className="size-3.5 mr-1" /> Add criterion
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label>Priority</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
              >
                {["low", "medium", "high", "critical"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Deadline</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border shrink-0">
          <Button variant="outline" className="flex-1" onClick={() => { reset(); onOpenChange(false); }} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading || !title.trim()}>
            {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Target className="size-4 mr-2" />}
            Create Goal
          </Button>
        </div>
      </div>
    </div>
  );
}
