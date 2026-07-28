import { Injectable } from "@nestjs/common";

interface PromptTemplate {
  system: string;
  user: (input: string, context?: Record<string, unknown>) => string;
}

@Injectable()
export class PromptBuilder {
  private templates: Record<string, PromptTemplate> = {
    planner: {
      system: `You are an expert software architect and technical project manager. 
Given a software task, create a detailed execution plan with ordered steps.
For each step, specify which agent type should handle it (backend, frontend, testing, or reviewer).
Output your plan as a JSON array of steps with: order, agentType, and description fields.
Only respond with valid JSON. No markdown formatting.`,
      user: (input) => `Task: ${input}\n\nCreate an execution plan for this task.`,
    },
    backend: {
      system: `You are an expert backend engineer. You write production-ready TypeScript/NestJS code.
Follow clean architecture, SOLID principles, and security best practices.
Always include imports, type annotations, and error handling.
Output ONLY the code. No explanations unless asked.`,
      user: (input, ctx) => `Task: ${input}\nProject context: ${JSON.stringify(ctx ?? {})}\n\nWrite the backend implementation.`,
    },
    frontend: {
      system: `You are an expert frontend engineer. You write React/Next.js components with Tailwind CSS.
Use TypeScript, hooks, and clean component architecture.
Components should be accessible, responsive, and follow design system conventions.
Output ONLY the code. No explanations unless asked.`,
      user: (input, ctx) => `Task: ${input}\nProject context: ${JSON.stringify(ctx ?? {})}\n\nWrite the frontend implementation.`,
    },
    testing: {
      system: `You are an expert QA engineer. Write comprehensive tests using Jest and Testing Library.
Include unit tests, integration tests, and edge case coverage.
Follow AAA pattern (Arrange, Act, Assert).
Output ONLY the test code. No explanations unless asked.`,
      user: (input, ctx) => `Task: ${input}\nProject context: ${JSON.stringify(ctx ?? {})}\n\nWrite the test suite.`,
    },
    reviewer: {
      system: `You are an expert code reviewer. Review the provided code for issues.
Return a JSON object with: issues (array of {severity, file, line, description}), suggestions (array of strings), and score (0-100).
Only respond with valid JSON. No markdown formatting.`,
      user: (input, ctx) => `Code to review:\n${input}\n\nContext: ${JSON.stringify(ctx ?? {})}\n\nProvide a review.`,
    },
    browser: {
      system: `You are an expert browser automation agent. Given a task, produce a JSON array of browser actions to perform.
Each action has: type (navigate|click|type|scroll|screenshot|extract), selector (CSS selector, optional), value (for type), url (for navigate).
Always start with a navigate action. End with a screenshot. Only respond with valid JSON array. No markdown.`,
      user: (input, ctx) => `Task: ${input}\nContext: ${JSON.stringify(ctx ?? {})}\n\nProduce the browser action sequence.`,
    },
  };

  build(agentType: string, input: string, context?: Record<string, unknown>, repoContext?: string) {
    const template = this.templates[agentType];
    const repoSection = repoContext ? `\n\nRepository context (use this to understand the existing codebase):\n${repoContext}` : "";
    if (!template) {
      return [
        { role: "system" as const, content: `You are a ${agentType} agent. Complete the task.` },
        { role: "user" as const, content: input + repoSection },
      ];
    }
    return [
      { role: "system" as const, content: template.system },
      { role: "user" as const, content: template.user(input, context) + repoSection },
    ];
  }
}
