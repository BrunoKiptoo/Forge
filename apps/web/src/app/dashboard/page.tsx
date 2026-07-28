"use client";

import { useAuth } from "@/lib/auth-context";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="h-8 w-40 bg-[#0f0f0f] border border-[#1a1a1a] animate-pulse" />
        <div className="grid grid-cols-4 gap-0 border border-[#1a1a1a]">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-[#0a0a0a] border-r border-[#1a1a1a] animate-pulse last:border-r-0" />)}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-[#a0a0a0] tracking-wide">Taking you to login...</p>
      </div>
    );
  }

  return <DashboardContent />;
}
