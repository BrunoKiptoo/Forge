"use client";

import { cn } from "@/lib/utils";
import { Menu } from "@base-ui/react/menu";
import { useState, type ComponentProps, type ReactNode } from "react";

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Menu.Root open={open} onOpenChange={setOpen}>
      {children}
    </Menu.Root>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
  ...props
}: ComponentProps<typeof Menu.Trigger>) {
  return (
    <Menu.Trigger
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </Menu.Trigger>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
  ...props
}: ComponentProps<typeof Menu.Popup> & { align?: "start" | "end" }) {
  return (
    <Menu.Portal>
      <Menu.Popup
        className={cn(
          "z-50 min-w-[180px] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
          "origin-top-right transition data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          align === "end" && "origin-top-right",
          align === "start" && "origin-top-left",
          className,
        )}
        {...props}
      >
        {children}
      </Menu.Popup>
    </Menu.Portal>
  );
}

export function DropdownMenuItem({
  children,
  className,
  ...props
}: ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </Menu.Item>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}
