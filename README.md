# Forge

Forge is an AI-powered software engineering platform. You describe a task, and a team of specialized AI agents — planner, backend, frontend, testing, reviewer — autonomously breaks it down, writes the code, runs tests, and pushes to GitHub. You stay in control through an approval gate, inline comments, and real-time visibility into everything the agents are doing.

## What it does

- **Multi-agent orchestration** — tasks are decomposed into an execution plan and handed off across agents in sequence. Each agent is specialized: the planner designs the steps, backend/frontend agents write code, the testing agent runs the test suite in a real sandbox, and the reviewer scores the output.
- **Real-time dashboard** — every agent step, handoff message, terminal line, and deployment status update streams live to the UI over WebSocket. No polling.
- **Terminal execution** — run arbitrary commands (allowlisted) in a sandboxed child process. Output streams line-by-line to an interactive terminal panel.
- **Browser agent** — a headless Playwright browser controlled by an AI agent. Give it a URL and a task; it navigates, clicks, types, extracts text, and returns a screenshot.
- **Deployment** — one-click deploy to Vercel or Railway directly from the workspace. Logs and status stream live.
- **Comments + approvals** — leave inline comments on any task or artifact. Request a formal approval before execution runs — the task moves to `review` status and is blocked until a reviewer approves or rejects it.
- **Observability** — token usage, cost-over-time, agent performance, and failure diagnostics aggregated into a `/dashboard/analytics` page with Recharts charts.
- **GitHub integration** — index a repository for semantic context, push generated artifacts to a branch, and open a pull request.
- **Workspaces + Goals** — organize work into workspaces with goals that auto-decompose into tasks via the planner.

## Tech stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| API | NestJS 11, TypeScript, MongoDB (Mongoose) |
| Web | Next.js 15, React 19, Tailwind CSS v4, Recharts |
| Real-time | Socket.IO (`@nestjs/websockets`) |
| AI | OpenAI, Anthropic, DeepSeek, Gemini, Grok (provider-agnostic) |
| Browser | Playwright (headless Chromium) |
| Deployment | Vercel REST API v13, Railway GraphQL API |
| Auth | JWT + Passport (local + GitHub OAuth) |
| Database | MongoDB 7 via Docker |

## Project structure

```
forge/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   └── web/          # Next.js frontend (port 3000)
└── packages/
    ├── config/       # Shared env/config
    ├── types/        # Shared TypeScript types
    └── ui/           # Shared UI primitives
```

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for MongoDB)

### 1. Clone and install

```bash
git clone https://github.com/your-org/forge.git
cd forge
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```env
# Pick a provider: deepseek | openai | anthropic | gemini | grok
AI_PROVIDER=deepseek
AI_PROVIDER_API_KEY=sk-your-key-here
AI_PROVIDER_MODEL=deepseek-chat

# GitHub OAuth (optional — needed for repo indexing and git push)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 3. Start MongoDB

```bash
docker compose up mongodb -d
```

A Mongo Express UI is available at `http://localhost:8081` if you also run:

```bash
docker compose up mongo-express -d
```

### 4. Seed the database (optional)

```bash
pnpm --filter @forge/api seed
```

This creates a default organization, sample agents, and a demo project.

### 5. Run in development

```bash
pnpm dev
```

This starts both the API (`http://localhost:3001`) and the web app (`http://localhost:3000`) in watch mode via Turborepo.

### 6. Or run with Docker

```bash
docker compose up --build
```

---

## How it works

### Creating and running a task

1. Open `http://localhost:3000` and register an account.
2. Create an organization and a project.
3. Click **New Task**, give it a title and description.
4. Click **Execute** on the task — the planner agent generates a multi-step execution plan.
5. An approval dialog shows the plan, estimated token cost, and files that will be changed. Approve to proceed.
6. Watch the agents work in real-time in the **Agent Activity** feed and **Task Timeline**.

### Approval gate

Before executing a task you can click **Review** instead of **Execute**. This moves the task to `review` status and creates a pending approval record. The task is blocked from running until a reviewer clicks **Approve** or **Reject** directly in the task list. Approved tasks move back to `queued` and can be executed normally.

### Comments

Click the comment icon on any task to expand an inline comment thread. Comments are live — anyone viewing the same task sees new comments appear instantly via WebSocket.

### Terminal

The **Terminal** panel in the workspace dashboard lets you run allowlisted commands (`node`, `pnpm`, `git`, `tsc`, etc.) in a sandboxed child process. Output streams line-by-line. After the testing agent step, `pnpm test` runs automatically in the sandbox.

### Browser agent

The **Browser Agent** panel takes a URL, sends it to a headless Playwright browser, and streams back each action (navigate, click, type, extract, screenshot) as it happens. The final screenshot is displayed in the panel. When a task plan includes a `browser` step, the AI generates the action sequence automatically.

### Deployment

Configure `vercelToken` / `railwayToken` in your workspace settings. Click **Deploy** in the **Deployments** panel — Forge pushes to your provider and polls for status, streaming logs live. You can also trigger a deploy from the **Push to GitHub** dialog after a PR is created.

### Analytics

`/dashboard/analytics` shows:
- Token usage and cost over time (line chart)
- Per-agent performance (bar chart)
- Provider breakdown (pie chart)
- Failure diagnostics table

---

## API overview

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks/:id/execute` | Execute a task |
| GET | `/api/agents/preview` | Preview execution plan |
| POST | `/api/approvals` | Request approval |
| PATCH | `/api/approvals/:id` | Approve or reject |
| GET | `/api/comments` | Get comments for an entity |
| POST | `/api/comments` | Post a comment |
| POST | `/api/terminal/exec` | Run a sandboxed command |
| POST | `/api/browser/run` | Start a browser agent session |
| POST | `/api/deployments` | Trigger a deployment |
| GET | `/api/analytics/...` | Observability endpoints |

WebSocket namespace: `ws://localhost:3001/ws`

Rooms follow the pattern `org:<id>`, `deployment:<id>`, `browser:<id>`, `entity:<id>`.

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret |
| `AI_PROVIDER` | Yes | `deepseek` \| `openai` \| `anthropic` \| `gemini` \| `grok` |
| `AI_PROVIDER_API_KEY` | Yes | API key for the chosen provider |
| `AI_PROVIDER_MODEL` | Yes | Model name (e.g. `deepseek-chat`, `gpt-4o`) |
| `AI_PROVIDER_BASE_URL` | No | Custom base URL (required for DeepSeek) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth app client secret |
| `GITHUB_CALLBACK_URL` | No | OAuth callback URL |
| `NEXT_PUBLIC_API_URL` | Yes | API base URL for the web app |
| `FRONTEND_URL` | Yes | Web app URL (used for CORS) |
