"use client";

import { Folder, Home, LayoutDashboard, Plus, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { projects } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const statusColors: Record<string, string> = {
  active: "bg-emerald-400",
  idle: "bg-amber-400",
  completed: "bg-blue-400",
  failed: "bg-red-400",
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState("1");

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]",
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 border-b border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/20"
        >
          <div className="size-3 rounded-sm bg-primary" />
        </button>
        {!collapsed && (
          <Link href="/" className="font-bold text-sidebar-foreground text-lg tracking-tight">
            Forge
          </Link>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
              "text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <LayoutDashboard className="size-4 shrink-0" />
            {!collapsed && "Dashboard"}
          </Link>
          <Link
            href="#"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
              "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <Search className="size-4 shrink-0" />
            {!collapsed && "Search"}
          </Link>
        </div>

        {!collapsed && (
          <>
            <Separator className="mx-3 my-2 w-auto bg-sidebar-border" />
            <div className="px-3 py-1">
              <div className="flex items-center justify-between px-3">
                <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Projects
                </span>
                <button className="text-muted-foreground hover:text-sidebar-foreground transition-colors">
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        <div className="px-3 space-y-0.5">
          {projects.slice(0, collapsed ? 3 : 6).map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm transition-all",
                selectedProject === project.id
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              {collapsed ? (
                <div className={cn("size-2 rounded-full", statusColors[project.status])} />
              ) : (
                <>
                  <Folder className="size-4 shrink-0" />
                  <span className="truncate text-left flex-1">{project.name}</span>
                  <div className={cn("size-2 rounded-full shrink-0", statusColors[project.status])} />
                </>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all hover:bg-sidebar-accent cursor-pointer">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                ZA
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Zamani</p>
              <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
            </div>
            <Settings className="size-3.5 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                ZA
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed bottom-4 left-4 z-50 rounded-full bg-primary p-3 text-primary-foreground shadow-lg"
      >
        <Home className="size-5" />
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <div className="size-3 rounded-sm bg-primary" />
              </div>
              <span className="text-lg font-bold">Forge</span>
            </div>
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
                >
                  <Folder className="size-4" />
                  {project.name}
                  <div className={cn("ml-auto size-2 rounded-full", statusColors[project.status])} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
