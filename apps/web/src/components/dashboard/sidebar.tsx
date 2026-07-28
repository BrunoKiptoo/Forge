"use client";

import {
  LayoutDashboard, Plus, Settings, LogOut, Target, BarChart2, ChevronLeft, ChevronRight, Folder,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useOrg } from "@/lib/org-context";
import { apiFetch } from "@/lib/api";
import { OrganizationSwitcher } from "@/components/org/organization-switcher";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";

interface RealProject {
  _id: string; name: string; slug: string; icon: string; color: string; status: string;
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-[#F6410F]", draft: "bg-[#888888]", paused: "bg-[#666666]", archived: "bg-[#444444]",
};

const navLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/workspace", icon: Target, label: "Workspaces" },
  { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [realProjects, setRealProjects] = useState<RealProject[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const { user, logout } = useAuth();
  const { activeOrg } = useOrg();

  const fetchProjects = useCallback(async () => {
    if (!activeOrg) return setRealProjects([]);
    try {
      const res = await apiFetch<{ data: RealProject[] }>(`/projects?organizationId=${activeOrg._id}`);
      setRealProjects(res.data);
    } catch { setRealProjects([]); }
  }, [activeOrg]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const initials = user ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  return (
    <>
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-[#1a1a1a] bg-black transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[240px]",
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-[#1a1a1a]">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/images/forge_official_logo.png" alt="Forge" className="h-6 w-auto object-contain" />
              <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">Forge</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-[#888888] hover:text-white transition-colors", collapsed && "mx-auto")}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Nav */}
          <div className="px-3 space-y-0.5">
            {!collapsed && (
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#888888] px-3 mb-2">Navigation</p>
            )}
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-xs font-medium tracking-wide transition-all",
                  "text-[#c0c0c0] hover:text-white hover:bg-[#0f0f0f]",
                  collapsed && "justify-center",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && label}
              </Link>
            ))}
          </div>

          {/* Org switcher */}
          {!collapsed && (
            <div className="px-3 border-t border-[#1a1a1a] pt-4">
              <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#888888] px-3 mb-2">Organization</p>
              <OrganizationSwitcher />
            </div>
          )}

          {/* Projects */}
          {!collapsed && (
            <div className="px-3 border-t border-[#1a1a1a] pt-4">
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#888888]">Projects</p>
                <button onClick={() => setCreateOpen(true)} className="text-[#888888] hover:text-[#F6410F] transition-colors">
                  <Plus className="size-3.5" />
                </button>
              </div>
              {realProjects.length === 0 ? (
                <p className="text-[10px] text-[#888888] px-3 py-2">No projects yet.</p>
              ) : (
                <div className="space-y-0.5">
                  {realProjects.map((p) => (
                    <div key={p._id} className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#c0c0c0] hover:text-white hover:bg-[#0f0f0f] transition-all cursor-pointer">
                      <Folder className="size-3.5 shrink-0" />
                      <span className="truncate flex-1">{p.name}</span>
                      <div className={cn("size-1.5 rounded-full shrink-0", STATUS_DOT[p.status] ?? "bg-[#2a2a2a]")} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div className="border-t border-[#1a1a1a] p-3">
          {!collapsed ? (
            <div className="group relative">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#0f0f0f] transition-all cursor-pointer">
                <div className="size-7 rounded-none bg-[#F6410F]/10 border border-[#F6410F]/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#F6410F]">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user?.name ?? "..."}</p>
                  <p className="text-[10px] text-[#888888] truncate">{user?.email ?? ""}</p>
                </div>
              </div>
              <div className="hidden group-hover:flex flex-col absolute bottom-full left-0 right-0 bg-[#0a0a0a] border border-[#1f1f1f] mb-1">
                <Link href="#" className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#c0c0c0] hover:text-white hover:bg-[#111] transition-all">
                  <Settings className="size-3.5" /> Settings
                </Link>
                <button
                  onClick={async () => { await logout(); window.location.href = "/"; }}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#c0c0c0] hover:text-[#F6410F] hover:bg-[#111] transition-all text-left"
                >
                  <LogOut className="size-3.5" /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="size-7 bg-[#F6410F]/10 border border-[#F6410F]/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#F6410F]">{initials}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchProjects} />
    </>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const initials = user ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-5 left-5 z-50 bg-[#F6410F] text-white p-3 shadow-lg"
      >
        <LayoutDashboard className="size-5" />
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-72 bg-black border-r border-[#1a1a1a] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between h-14 px-5 border-b border-[#1a1a1a]">
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/images/forge_official_logo.png" alt="Forge" className="h-6 w-auto object-contain" />
                <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">Forge</span>
              </Link>
              <button onClick={() => setOpen(false)} className="text-[#888888] hover:text-white transition-colors">
                <ChevronLeft className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium tracking-wide text-[#c0c0c0] hover:text-white hover:bg-[#0f0f0f] transition-all"
                >
                  <Icon className="size-4" /> {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-[#1a1a1a] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-7 bg-[#F6410F]/10 border border-[#F6410F]/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#F6410F]">{initials}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{user?.name}</p>
                  <p className="text-[10px] text-[#888888]">{user?.email}</p>
                </div>
              </div>
              <button onClick={async () => { await logout(); window.location.href = "/"; }} className="text-[#888888] hover:text-[#F6410F] transition-colors">
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
