"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Loader2, Clock, ArrowRight, RotateCcw, Rocket, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useForgeSocket } from "@/lib/use-forge-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EnvDeployment {
  _id: string;
  status: string;
  branch: string;
  createdAt: string;
  url: string | null;
}

interface Environment {
  _id: string;
  name: string;
  order: number;
  branch: string;
  deployTarget: string;
  status: string;
  currentUrl: string | null;
  requiresApproval: boolean;
  lastPromotedAt: string | null;
  latestDeployment: EnvDeployment | null;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  idle: <Clock className="size-3.5 text-muted-foreground" />,
  deploying: <Loader2 className="size-3.5 text-amber-400 animate-spin" />,
  ready: <CheckCircle className="size-3.5 text-emerald-400" />,
  failed: <AlertCircle className="size-3.5 text-red-400" />,
};

const STATUS_BADGE: Record<string, string> = {
  idle: "bg-muted/40 text-muted-foreground",
  deploying: "bg-amber-500/20 text-amber-400",
  ready: "bg-emerald-500/20 text-emerald-400",
  failed: "bg-red-500/20 text-red-400",
};

const ENV_COLORS: Record<string, string> = {
  dev: "border-blue-500/30 bg-blue-500/5",
  test: "border-purple-500/30 bg-purple-500/5",
  staging: "border-amber-500/30 bg-amber-500/5",
  production: "border-emerald-500/30 bg-emerald-500/5",
};

export function EnvironmentPipeline({
  workspaceId,
  organizationId,
}: {
  workspaceId: string;
  organizationId: string;
}) {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const fetchEnvironments = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: Environment[] }>(`/environments?workspaceId=${workspaceId}`);
      setEnvironments(res.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { fetchEnvironments(); }, [fetchEnvironments]);

  useForgeSocket([`workspace:${workspaceId}`], {
    "environment.updated": () => { void fetchEnvironments(); },
  });

  async function handleProvision() {
    setProvisioning(true);
    try {
      await apiFetch("/environments/provision", {
        method: "POST",
        body: JSON.stringify({ workspaceId, organizationId }),
      });
      await fetchEnvironments();
    } finally {
      setProvisioning(false);
    }
  }

  async function handleDeploy(envId: string) {
    setActing(envId);
    try {
      await apiFetch(`/environments/${envId}/deploy`, {
        method: "POST",
        body: JSON.stringify({ organizationId }),
      });
      await fetchEnvironments();
    } finally {
      setActing(null);
    }
  }

  async function handlePromote(envId: string) {
    setActing(envId);
    try {
      const res = await apiFetch<{ data: { status?: string; toEnv?: string } }>(`/environments/${envId}/promote`, {
        method: "POST",
        body: JSON.stringify({ organizationId }),
      });
      if (res.data.status === "awaiting_approval") {
        // Refresh to show pending state
      }
      await fetchEnvironments();
    } finally {
      setActing(null);
    }
  }

  async function handleRollback(envId: string) {
    setActing(envId);
    try {
      await apiFetch(`/environments/${envId}/rollback`, {
        method: "POST",
        body: JSON.stringify({ organizationId }),
      });
      await fetchEnvironments();
    } finally {
      setActing(null);
    }
  }

  if (loading) return null;

  if (environments.length === 0) {
    return (
      <Card className="bg-card/40 border-border/50">
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-muted-foreground">No environments configured for this workspace.</p>
          <Button size="sm" onClick={handleProvision} disabled={provisioning}>
            {provisioning ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Rocket className="size-3.5 mr-1.5" />}
            Provision Pipeline
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/40 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Rocket className="size-4 text-muted-foreground" /> Deployment Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-stretch gap-2">
          {environments.map((env, idx) => (
            <div key={env._id} className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`flex-1 rounded-lg border p-3 space-y-2 ${ENV_COLORS[env.name] ?? "border-border/50"}`}>
                {/* Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    {STATUS_ICON[env.status] ?? <Clock className="size-3.5" />}
                    <span className="text-xs font-semibold capitalize">{env.name}</span>
                    {env.requiresApproval && <ShieldCheck className="size-3 text-muted-foreground/60" />}
                  </div>
                  <Badge className={`text-[9px] px-1.5 py-0 ${STATUS_BADGE[env.status]}`}>{env.status}</Badge>
                </div>

                {/* Branch */}
                <p className="text-[10px] text-muted-foreground font-mono truncate">{env.branch}</p>

                {/* URL */}
                {env.currentUrl && (
                  <a
                    href={env.currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary truncate block hover:underline"
                  >
                    {env.currentUrl.replace(/^https?:\/\//, "")}
                  </a>
                )}

                {/* Last promoted */}
                {env.lastPromotedAt && (
                  <p className="text-[10px] text-muted-foreground/60">
                    {new Date(env.lastPromotedAt).toLocaleString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-1 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px] flex-1"
                    disabled={acting === env._id || env.status === "deploying"}
                    onClick={() => void handleDeploy(env._id)}
                  >
                    {acting === env._id ? <Loader2 className="size-2.5 animate-spin" /> : <Rocket className="size-2.5 mr-1" />}
                    Deploy
                  </Button>
                  {env.latestDeployment && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-amber-400"
                      disabled={acting === env._id}
                      onClick={() => void handleRollback(env._id)}
                      title="Rollback"
                    >
                      <RotateCcw className="size-2.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Arrow between stages */}
              {idx < environments.length - 1 && (
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 rounded-full"
                    disabled={acting === env._id || env.status !== "ready"}
                    onClick={() => void handlePromote(env._id)}
                    title={`Promote to ${environments[idx + 1]?.name}`}
                  >
                    <ArrowRight className={`size-3.5 ${env.status === "ready" ? "text-primary" : "text-muted-foreground/30"}`} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
