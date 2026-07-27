"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNav() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card/50 px-4 lg:px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, tasks, or agents..."
          className="h-9 pl-9 bg-muted/50 border-border/50 focus:bg-card text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
        </button>
        <div className="hidden sm:flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted cursor-pointer">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">ZA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
