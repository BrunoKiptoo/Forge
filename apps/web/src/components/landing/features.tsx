import { Braces, Bot, Workflow, Shield, Zap, GitBranch } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Multi-Agent Orchestration",
    description: "Planner, backend, frontend, testing, and reviewer agents work in sequence. Each specialized. Each autonomous.",
    icon: Bot,
  },
  {
    number: "02",
    title: "Real-Time Execution",
    description: "Every agent step, terminal line, and deployment status streams live over WebSocket. No polling. No waiting.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Code Generation",
    description: "Production-ready code across any language or framework. Context-aware, architecture-respecting, test-covered.",
    icon: Braces,
  },
  {
    number: "04",
    title: "Approval Gates",
    description: "Review the execution plan before a single line is written. Approve, reject, or comment inline.",
    icon: Shield,
  },
  {
    number: "05",
    title: "One-Click Deployment",
    description: "Push to Vercel or Railway directly from the workspace. Logs stream live. Rollback in one click.",
    icon: Workflow,
  },
  {
    number: "06",
    title: "GitHub Integration",
    description: "Index repositories for semantic context. Push artifacts to a branch. Open pull requests automatically.",
    icon: GitBranch,
  },
];

// Border classes per cell position for each breakpoint:
// Mobile (1-col): bottom border on all but last
// sm (2-col): right border on even cols (0,2,4), bottom on rows 0-3
// lg (3-col): right border on cols 0,1,3,4; bottom on row 0 (cols 0-2)
const cellBorder = (i: number) =>
  [
    // mobile: bottom border except last
    i < 5 ? "border-b border-[#1a1a1a]" : "",
    // sm 2-col: right on left column, override bottom
    i % 2 === 0 ? "sm:border-r" : "sm:border-r-0",
    i < 4 ? "sm:border-b" : "sm:border-b-0",
    i === 4 || i === 5 ? "sm:border-b-0" : "",
    // lg 3-col
    i % 3 !== 2 ? "lg:border-r" : "lg:border-r-0",
    i < 3 ? "lg:border-b" : "lg:border-b-0",
  ]
    .filter(Boolean)
    .join(" ");

export function Features() {
  return (
    <section id="features" className="relative bg-black py-20 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12 sm:mb-20 pb-8 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-6 bg-[#F6410F]" />
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-[#F6410F]">
              Capabilities
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-white">
              Built for the<br />
              <span className="text-[#3a3a3a]">entire workflow.</span>
            </h2>
            <p className="lg:max-w-xs text-sm text-[#4a4a4a] leading-relaxed lg:text-right">
              From first prompt to merged pull request — every step handled by purpose-built agents.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ number, title, description, icon: Icon }, i) => (
            <div
              key={number}
              className={`group relative p-6 sm:p-8 transition-all duration-500 hover:bg-[#080808] ${cellBorder(i)}`}
            >
              {/* Orange top accent on hover */}
              <div className="absolute top-0 left-6 right-6 sm:left-8 sm:right-8 h-px bg-[#F6410F] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="flex items-start justify-between mb-5 sm:mb-6">
                <span className="text-[#F6410F] text-xs font-bold tracking-[0.2em]">{number}</span>
                <Icon className="size-4 text-[#2a2a2a] group-hover:text-[#F6410F]/40 transition-colors duration-300" />
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3 tracking-tight">{title}</h3>
              <p className="text-xs sm:text-sm text-[#4a4a4a] leading-relaxed group-hover:text-[#6b6b6b] transition-colors duration-300">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
