import { WorkspaceDashboard } from "@/components/workspace/workspace-dashboard";

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
          <WorkspaceDashboard workspaceId={id} />
        </div>
      </div>
    </div>
  );
}
