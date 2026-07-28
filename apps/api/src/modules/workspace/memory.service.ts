import { Injectable } from "@nestjs/common";
import { WorkspaceMemoryRepository } from "../../core/database/repositories";
import type { MemoryCategory } from "../../core/database/schemas";

@Injectable()
export class MemoryService {
  constructor(private readonly memoryRepository: WorkspaceMemoryRepository) {}

  async getContext(workspaceId: string): Promise<string> {
    const entries = await this.memoryRepository.findByWorkspace(workspaceId);
    if (entries.length === 0) return "";

    const grouped: Partial<Record<MemoryCategory, string[]>> = {};
    for (const e of entries) {
      if (!grouped[e.category]) grouped[e.category] = [];
      grouped[e.category]!.push(`- ${e.key}: ${e.value}`);
    }

    const sections: string[] = ["=== Workspace Memory ==="];
    const labels: Record<MemoryCategory, string> = {
      architectural_decision: "Architectural Decisions",
      coding_standard: "Coding Standards",
      convention: "Project Conventions",
      ai_decision: "Previous AI Decisions",
      lesson_learned: "Lessons Learned",
      completed_goal: "Completed Goals",
      known_bug: "Known Bugs",
      tech_stack: "Tech Stack",
    };

    for (const [cat, lines] of Object.entries(grouped) as [MemoryCategory, string[]][]) {
      sections.push(`\n${labels[cat]}:\n${lines.join("\n")}`);
    }

    return sections.join("\n");
  }

  upsert(workspaceId: string, organizationId: string, category: MemoryCategory, key: string, value: string, metadata?: Record<string, unknown>) {
    return this.memoryRepository.upsert(workspaceId, organizationId, category, key, value, metadata);
  }

  findByWorkspace(workspaceId: string, category?: MemoryCategory) {
    return this.memoryRepository.findByWorkspace(workspaceId, category);
  }

  delete(id: string) {
    return this.memoryRepository.softDelete(id);
  }
}
