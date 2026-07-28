"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { useOrg } from "@/lib/org-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ICONS = ["folder", "code", "cpu", "database", "globe", "layout-dashboard", "smartphone", "server", "shield", "terminal"];
const COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e", "#a855f7", "#ec4899"];

const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string(),
  color: z.string(),
  visibility: z.enum(["private", "public"]),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const { activeOrg } = useOrg();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { icon: "folder", color: "#6366f1", visibility: "private", name: "", description: "" },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");

  async function onSubmit(data: CreateProjectForm) {
    if (!activeOrg) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({ ...data, organizationId: activeOrg._id }),
      });
      reset();
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Create Project</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="My Project" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="What is this project about?" {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue("icon", icon)}
                    className={`flex size-9 items-center justify-center rounded-md border text-sm transition ${
                      selectedIcon === icon
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {icon === "folder" && "📁"}
                    {icon === "code" && "💻"}
                    {icon === "cpu" && "⚙️"}
                    {icon === "database" && "🗄️"}
                    {icon === "globe" && "🌐"}
                    {icon === "layout-dashboard" && "📊"}
                    {icon === "smartphone" && "📱"}
                    {icon === "server" && "🖥️"}
                    {icon === "shield" && "🛡️"}
                    {icon === "terminal" && "⬛"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={`size-7 rounded-full border-2 transition ${
                      selectedColor === color ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              {...register("visibility")}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
