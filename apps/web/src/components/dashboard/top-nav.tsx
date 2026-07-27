"use client";

import { Bell, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";

export function TopNav({ onTaskCreated }: { onTaskCreated?: () => void }) {
  const { user } = useAuth();
  const [taskOpen, setTaskOpen] = useState(false);
  const initials = user ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b border-[#1a1a1a] bg-black px-4 lg:px-6 shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#3a3a3a]" />
          <input
            placeholder="Search tasks, projects..."
            className="w-full h-8 bg-[#0a0a0a] border border-[#1a1a1a] text-xs text-white pl-8 pr-3 outline-none placeholder:text-[#3a3a3a] focus:border-[#F6410F]/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => setTaskOpen(true)}
            className="flex items-center gap-2 bg-[#F6410F] text-white text-xs font-semibold tracking-[0.08em] uppercase px-4 py-2 hover:bg-[#d93a0d] transition-all"
          >
            <Plus className="size-3.5" />
            New Task
          </button>
          <button className="text-[#3a3a3a] hover:text-white transition-colors p-1.5">
            <Bell className="size-4" />
          </button>
          <div className="size-7 bg-[#F6410F]/10 border border-[#F6410F]/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#F6410F]">{initials}</span>
          </div>
        </div>
      </header>

      <CreateTaskDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        onCreated={() => { setTaskOpen(false); onTaskCreated?.(); }}
      />
    </>
  );
}
