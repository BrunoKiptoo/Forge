"use client";

import { useEffect, useState, useRef } from "react";
import { MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useForgeSocket } from "@/lib/use-forge-socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CommentItem {
  _id: string;
  body: string;
  resolved: boolean;
  createdAt: string;
  authorId: { _id: string; name: string; avatar?: string } | null;
}

export function CommentThread({
  organizationId,
  entityType,
  entityId,
  currentUserId,
}: {
  organizationId: string;
  entityType: "task" | "artifact";
  entityId: string;
  currentUserId: string;
}) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchComments() {
    try {
      const res = await apiFetch<{ data: CommentItem[] }>(`/comments?entityType=${entityType}&entityId=${entityId}`);
      setComments(res.data);
    } catch { /* silent */ }
  }

  useEffect(() => { void fetchComments(); }, [entityId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  useForgeSocket([`entity:${entityId}`], {
    "comment.created": () => { void fetchComments(); },
  });

  // Parse @mentions from body
  function parseMentions(text: string): string[] {
    return [...text.matchAll(/@\[([^\]]+)\]\(([^)]+)\)/g)].map((m) => m[2]!);
  }

  async function handleSubmit() {
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      await apiFetch("/comments", {
        method: "POST",
        body: JSON.stringify({
          organizationId,
          entityType,
          entityId,
          body: body.trim(),
          mentions: parseMentions(body),
        }),
      });
      setBody("");
      await fetchComments();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolve(id: string) {
    await apiFetch(`/comments/${id}/resolve`, { method: "PATCH" });
    await fetchComments();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <MessageSquare className="size-3.5" />
        <span>{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
      </div>

      {comments.length > 0 && (
        <ScrollArea className="max-h-48 rounded-lg border border-border/50 bg-muted/10">
          <div className="p-3 space-y-3">
            {comments.map((c) => (
              <div key={c._id} className={`flex gap-2.5 ${c.resolved ? "opacity-50" : ""}`}>
                <Avatar size="sm" className="shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/20 text-[10px]">
                    {c.authorId?.name?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{c.authorId?.name ?? "Unknown"}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                    {c.resolved && <span className="text-[10px] text-emerald-400">resolved</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap">{c.body}</p>
                  {!c.resolved && c.authorId?._id === currentUserId && (
                    <button
                      onClick={() => void handleResolve(c._id)}
                      className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-emerald-400 transition"
                    >
                      <CheckCircle className="size-2.5" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}

      <div className="flex gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSubmit(); }}
          placeholder="Add a comment… (⌘+Enter to submit)"
          className="text-xs h-9"
          disabled={submitting}
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-auto px-2 self-end"
          disabled={submitting || !body.trim()}
          onClick={handleSubmit}
        >
          {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        </Button>
      </div>
    </div>
  );
}
