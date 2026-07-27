"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const connectSchema = z.object({
  token: z.string().min(1, "GitHub token is required"),
});

export function GitHubConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(connectSchema) });

  async function onSubmit(data: { token: string }) {
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/git/connect", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSuccess(true);
      reset();
      setTimeout(() => {
        onOpenChange(false);
        onConnected?.();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Connect GitHub</h2>
        {success ? (
          <div className="rounded-md bg-primary/10 p-4 text-sm text-primary">
            GitHub connected successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Personal Access Token</Label>
              <Input id="token" type="password" placeholder="ghp_..." {...register("token")} />
              {errors.token && <p className="text-sm text-destructive">{errors.token.message}</p>}
              <p className="text-xs text-muted-foreground">
                Create a token at github.com/settings/tokens with repo scope.
              </p>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
