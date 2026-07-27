"use client";

import { useAuth } from "@/lib/auth-context";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-black overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-[240px] border-r border-[#1a1a1a] bg-black p-4 gap-3">
          <div className="h-6 w-24 bg-[#0f0f0f] border border-[#1a1a1a] animate-pulse" />
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-7 bg-[#0f0f0f] border border-[#1a1a1a] animate-pulse" />)}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-6 space-y-6">
          <div className="h-8 w-40 bg-[#0f0f0f] border border-[#1a1a1a] animate-pulse" />
          <div className="grid grid-cols-4 gap-0 border border-[#1a1a1a]">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-[#0a0a0a] border-r border-[#1a1a1a] animate-pulse last:border-r-0" />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse" />
            <div className="h-64 bg-[#0a0a0a] border border-[#1a1a1a] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-black items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-6 bg-[#F6410F]" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#F6410F]">Redirecting</span>
            <span className="h-px w-6 bg-[#F6410F]" />
          </div>
          <p className="text-xs text-[#4a4a4a] tracking-wide">Taking you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      <MobileSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardContent />
      </div>
    </div>
  );
}
