import {
  Bot,
  Braces,
  Bug,
  CheckCircle,
  Clock,
  Code2,
  GitBranch,
  Shield,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

export const features = [
  {
    icon: Braces,
    title: "Code Generation",
    description: "Generate production-ready code across multiple languages and frameworks with context-aware accuracy.",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description: "Deploy autonomous agents that plan, reason, and execute complex engineering tasks end-to-end.",
  },
  {
    icon: Workflow,
    title: "Orchestration",
    description: "Chain multiple operations into cohesive workflows with intelligent dependency resolution.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with encrypted data handling, role-based access, and audit logging.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-second response times powered by optimized inference pipelines and edge computing.",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Native Git integration with automatic branching, PR creation, and intelligent merge conflict resolution.",
  },
];

export const projects = [
  { id: "1", name: "Forge Dashboard", status: "active", lastModified: "2m ago" },
  { id: "2", name: "API Gateway", status: "active", lastModified: "15m ago" },
  { id: "3", name: "Auth Service", status: "idle", lastModified: "1h ago" },
  { id: "4", name: "Database Migration", status: "completed", lastModified: "3h ago" },
  { id: "5", name: "CI/CD Pipeline", status: "failed", lastModified: "5h ago" },
  { id: "6", name: "Monitoring Stack", status: "active", lastModified: "1d ago" },
] as const;

export const agentActivities = [
  {
    id: "act-1",
    agent: "Code Generator",
    action: "Generated auth middleware",
    detail: "apps/api/src/middleware/auth.ts",
    status: "completed",
    timestamp: "2s ago",
    icon: Code2,
  },
  {
    id: "act-2",
    agent: "Test Runner",
    action: "Running test suite",
    detail: "156/312 tests passed",
    status: "running",
    timestamp: "12s ago",
    icon: CheckCircle,
  },
  {
    id: "act-3",
    agent: "Debugger",
    action: "Fixed null reference error",
    detail: "packages/ui/src/button.tsx:42",
    status: "completed",
    timestamp: "45s ago",
    icon: Bug,
  },
  {
    id: "act-4",
    agent: "Planner",
    action: "Created implementation plan",
    detail: "Feature: WebSocket support",
    status: "completed",
    timestamp: "2m ago",
    icon: Workflow,
  },
  {
    id: "act-5",
    agent: "Terminal",
    action: "npm run build completed",
    detail: "Compiled with 0 errors",
    status: "completed",
    timestamp: "5m ago",
    icon: Terminal,
  },
] as const;

export const tasks = [
  {
    id: "task-1",
    title: "Implement WebSocket support",
    description: "Add real-time communication layer",
    status: "in-progress",
    priority: "high",
    assignee: "Code Generator",
    createdAt: "10:30 AM",
  },
  {
    id: "task-2",
    title: "Add rate limiting middleware",
    description: "Protect API endpoints from abuse",
    status: "completed",
    priority: "high",
    assignee: "Security Agent",
    createdAt: "9:15 AM",
  },
  {
    id: "task-3",
    title: "Refactor database queries",
    description: "Optimize N+1 queries in user service",
    status: "review",
    priority: "medium",
    assignee: "Refactor Agent",
    createdAt: "8:00 AM",
  },
  {
    id: "task-4",
    title: "Write E2E tests for auth flow",
    description: "Cover login, register, password reset",
    status: "pending",
    priority: "medium",
    assignee: "Test Runner",
    createdAt: "Yesterday",
  },
  {
    id: "task-5",
    title: "Set up monitoring dashboards",
    description: "Grafana + Prometheus integration",
    status: "in-progress",
    priority: "low",
    assignee: "DevOps Agent",
    createdAt: "2d ago",
  },
] as const;

export const chatMessages = [
  {
    id: "msg-1",
    role: "agent",
    content: "I've analyzed the WebSocket implementation plan. Adding real-time support requires modifying the API gateway and creating a new connection manager. Ready to proceed?",
    timestamp: "11:42 AM",
  },
  {
    id: "msg-2",
    role: "user",
    content: "Yes, go ahead. Make sure to add heartbeat/ping support and handle reconnection gracefully.",
    timestamp: "11:42 AM",
  },
  {
    id: "msg-3",
    role: "agent",
    content: "Got it. I'll implement WebSocket with automatic reconnection, exponential backoff, and heartbeat every 30s. Starting with the connection manager now.",
    timestamp: "11:43 AM",
  },
  {
    id: "msg-4",
    role: "agent",
    content: "Connection manager created. Now integrating with the API gateway middleware chain. The implementation follows the WS protocol with room-based broadcasting.",
    timestamp: "11:43 AM",
  },
  {
    id: "msg-5",
    role: "user",
    content: "Looks good. Can you also add JWT authentication to the WebSocket handshake?",
    timestamp: "11:44 AM",
  },
] as const;

export const terminalLines = [
  { id: "term-1", type: "command", content: "$ forge agent run --task websocket-support" },
  { id: "term-2", type: "output", content: "Agent 'Code Generator' initialized with context window 128K" },
  { id: "term-3", type: "output", content: "Reading project structure..." },
  { id: "term-4", type: "output", content: "Analyzing 47 files in apps/api/src/" },
  { id: "term-5", type: "success", content: "✓ Generated apps/api/src/websocket/connection-manager.ts" },
  { id: "term-6", type: "success", content: "✓ Generated apps/api/src/websocket/ws.gateway.ts" },
  { id: "term-7", type: "output", content: "Installing dependencies: ws, @types/ws" },
  { id: "term-8", type: "success", content: "✓ Build completed successfully (0 errors)" },
  { id: "term-9", type: "command", content: "$ forge test --suite websocket" },
  { id: "term-10", type: "output", content: "22 tests passed, 0 failed" },
] as const;

export const statsCards = [
  { label: "Active Agents", value: "4", change: "+2", icon: Bot },
  { label: "Tasks Today", value: "23", change: "+5", icon: CheckCircle },
  { label: "Code Gen", value: "1,247", change: "+89", icon: Code2 },
  { label: "Avg Response", value: "0.8s", change: "-0.2s", icon: Clock },
] as const;
