"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useOrg } from "@/lib/org-context";
import { CreateOrgDialog } from "./create-org-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function OrganizationSwitcher() {
  const { organizations, activeOrg, switchOrg, isLoading } = useOrg();
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" disabled>
        <div className="size-4 rounded bg-muted animate-pulse" />
        Loading...
      </Button>
    );
  }

  if (organizations.length === 0) {
    return (
      <>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-4" />
          Create Organization
        </Button>
        <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full">
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 px-3 text-left font-normal"
          >
            <span className="truncate text-sm">
              {activeOrg?.name ?? "Select org"}
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[220px]">
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org._id}
              onClick={() => switchOrg(org)}
              className="flex items-center justify-between"
            >
              <span>{org.name}</span>
              {activeOrg?._id === org._id && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
