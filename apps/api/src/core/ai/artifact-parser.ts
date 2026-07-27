export interface ParsedArtifact {
  filename: string;
  language: string;
  content: string;
}

export function parseArtifacts(response: string, agentType: string): ParsedArtifact[] {
  const artifacts: ParsedArtifact[] = [];
  const codeBlockRegex = /```(\w+)?(?:\s+)?(?:\/\/\s*(.+))?\n([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockRegex.exec(response)) !== null) {
    const language = match[1] ?? inferLanguage(agentType);
    const filenameHint = match[2];
    const content = match[3]!.trim();

    artifacts.push({
      filename: filenameHint ?? generateFilename(agentType, language, artifacts.length),
      language,
      content,
    });
  }

  if (artifacts.length === 0 && response.trim().length > 0) {
    artifacts.push({
      filename: generateFilename(agentType, inferLanguage(agentType), 0),
      language: inferLanguage(agentType),
      content: response.trim(),
    });
  }

  return artifacts;
}

function inferLanguage(agentType: string): string {
  switch (agentType) {
    case "backend": return "typescript";
    case "frontend": return "tsx";
    case "testing": return "typescript";
    case "reviewer": return "markdown";
    default: return "text";
  }
}

function generateFilename(agentType: string, language: string, index: number): string {
  const map: Record<string, string> = {
    typescript: `.generated${index > 0 ? `-${index}` : ""}.ts`,
    tsx: `.generated${index > 0 ? `-${index}` : ""}.tsx`,
    markdown: `.review${index > 0 ? `-${index}` : ""}.md`,
    text: `.output${index > 0 ? `-${index}` : ""}.txt`,
  };
  return `${agentType}${map[language] ?? `.output.txt`}`;
}
