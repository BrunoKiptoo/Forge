"use client";

import { useEffect, useState, useCallback } from "react";
import { GitBranch, Plus, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitHubConnectDialog } from "./github-connect-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Repo {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  url: string;
  description: string | null;
}

export function RepoBrowser() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Repo[] }>("/git/repos");
      setRepos(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repositories");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRepos(); }, [fetchRepos]);

  return (
    <>
      <Card className="bg-card/40 border-border/50 flex flex-col h-[400px]">
        <CardHeader className="flex-row items-center justify-between pb-2 shrink-0">
          <CardTitle className="text-base font-semibold">Repositories</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setConnectOpen(true)}>
            <Plus className="size-3.5 mr-1" /> Connect
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0">
          <ScrollArea className="h-full px-4">
            <div className="space-y-2 py-2">
              {loading ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">{error}</p>
                  <Button size="sm" variant="outline" onClick={() => setConnectOpen(true)}>
                    Connect GitHub
                  </Button>
                </div>
              ) : repos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No repositories. Connect GitHub to browse.
                </p>
              ) : (
                repos.map((repo) => (
                  <div key={repo.id} className="rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{repo.fullName}</span>
                        {repo.private && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Private</span>
                        )}
                      </div>
                      <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{repo.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <GitHubConnectDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onConnected={fetchRepos}
      />
    </>
  );
}
