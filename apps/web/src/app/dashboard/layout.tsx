import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Forge",
  description: "Monitor your AI agents and project activity.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
