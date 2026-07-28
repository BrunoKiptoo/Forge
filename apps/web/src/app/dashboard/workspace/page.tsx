"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, GitBranch, Target } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useOrg } from "@/lib/org-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TopNav } from "@/components/dashboard/top-nav";

interface Workspace {
  _id: string;
  name: string;
  repositoryId: string;
  defaultBranch: string;
  deploymentTarget: string;
  createdAt: string;
}

export default function WorkspacesPage() {
  const { activeOrg } = useOrg();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [repoId, setRepoId] = useState("");

  const fetchWorkspaces = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await apiFetch<{ data: Workspace[] }>(`/workspaces?organizationId=${activeOrg._id}`);
      setWorkspaces(res.data);
    } catch {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [activeOrg]);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  async function handleCreate() {
    if (!name.trim() || !activeOrg) return;
    setCreating(true);
    try {
      await apiFetch("/workspaces", {
        method: "POST",
        body: JSON.stringify({ organizationId: activeOrg._id, name: name.trim(), repositoryId: repoId.trim() }),
      });
      setName(""); setRepoId(""); setShowForm(false);
      await fetchWorkspaces();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <TopNav />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
              <p className="text-sm text-muted-foreground mt-1">Autonomous engineering environments.</p>
            </div>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="size-3.5 mr-1.5" /> New Workspace
            </Button>
          </div>

          {showForm && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold">Create Workspace</h3>
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Forge API" />
              </div>
              <div className="grid gap-1.5">
                <Label>Repository (optional)</Label>
                <Input value={repoId} onChange={(e) => setRepoId(e.target.value)} placeholder="owner/repo" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreate} disabled={creating || !name.trim()}>
                  {creating ? <Loader2 className="size-4 animate-spin mr-2" /> : null} Create
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => <div key={i} className="h-32 rounded-xl border border-border bg-card/40 animate-pulse" />)}
            </div>
          ) : workspaces.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Target className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No workspaces yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create a workspace to start autonomous engineering.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {workspaces.map((ws) => (
                <Link key={ws._id} href={`/dashboard/workspace/${ws._id}`}>
                  <div className="rounded-xl border border-border bg-card/40 p-5 hover:bg-card/70 transition cursor-pointer">
                    <p className="font-semibold">{ws.name}</p>
                    {ws.repositoryId && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                        <GitBranch className="size-3" /> {ws.repositoryId}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-3">
                      Created {new Date(ws.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
