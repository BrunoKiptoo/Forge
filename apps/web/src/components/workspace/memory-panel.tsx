"use client";

import { useState } from "react";
import { Brain, Plus, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type MemoryCategory = "architectural_decision" | "coding_standard" | "convention" | "ai_decision" | "lesson_learned" | "completed_goal" | "known_bug" | "tech_stack";

interface MemoryEntry {
  _id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  createdAt: string;
}

const CATEGORY_COLORS: Record<MemoryCategory, string> = {
  architectural_decision: "bg-blue-500/20 text-blue-400",
  coding_standard: "bg-purple-500/20 text-purple-400",
  convention: "bg-indigo-500/20 text-indigo-400",
  ai_decision: "bg-amber-500/20 text-amber-400",
  lesson_learned: "bg-emerald-500/20 text-emerald-400",
  completed_goal: "bg-teal-500/20 text-teal-400",
  known_bug: "bg-red-500/20 text-red-400",
  tech_stack: "bg-cyan-500/20 text-cyan-400",
};

const CATEGORY_LABELS: Record<MemoryCategory, string> = {
  architectural_decision: "Architecture",
  coding_standard: "Standards",
  convention: "Convention",
  ai_decision: "AI Decision",
  lesson_learned: "Lesson",
  completed_goal: "Completed",
  known_bug: "Bug",
  tech_stack: "Tech Stack",
};

export function MemoryPanel({ workspaceId, organizationId, entries, onRefresh }: {
  workspaceId: string;
  organizationId: string;
  entries: MemoryEntry[];
  onRefresh: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState<MemoryCategory>("tech_stack");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!key.trim() || !value.trim()) return;
    setSaving(true);
    try {
      await apiFetch(`/workspaces/${workspaceId}/memory`, {
        method: "POST",
        body: JSON.stringify({ organizationId, category, key: key.trim(), value: value.trim() }),
      });
      setKey(""); setValue(""); setAdding(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-card/40 border-border/50 flex flex-col">
      <CardHeader className="flex-row items-center justify-between pb-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Brain className="size-4 text-purple-400" /> Memory
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setAdding(!adding)}>
          <Plus className="size-3.5" />
        </Button>
      </CardHeader>

      {adding && (
        <div className="px-4 pb-3 space-y-2 border-b border-border/50">
          <div className="grid gap-1">
            <Label className="text-xs">Category</Label>
            <select
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value as MemoryCategory)}
            >
              {Object.keys(CATEGORY_LABELS).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c as MemoryCategory]}</option>
              ))}
            </select>
          </div>
          <Input className="h-8 text-xs" placeholder="Key" value={key} onChange={(e) => setKey(e.target.value)} />
          <Input className="h-8 text-xs" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button size="sm" className="w-full h-7 text-xs" onClick={handleSave} disabled={saving || !key || !value}>
            {saving ? <Loader2 className="size-3 animate-spin mr-1" /> : null} Save
          </Button>
        </div>
      )}

      <CardContent className="flex-1 p-0 min-h-0">
        <ScrollArea className="h-64 px-4">
          <div className="space-y-2 py-2">
            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No memory yet. Forge will populate this as it works.
              </p>
            ) : (
              entries.map((e) => (
                <div key={e._id} className="rounded-lg border border-border/40 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge className={`text-[9px] px-1.5 py-0 ${CATEGORY_COLORS[e.category]}`}>
                      {CATEGORY_LABELS[e.category]}
                    </Badge>
                    <span className="text-xs font-medium truncate">{e.key}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{e.value}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
