import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <div className="absolute inset-0 bg-glow" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
          <Sparkles className="size-3.5" />
          <span>Now in public beta</span>
        </div>

        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
            Software
          </span>
          <br />
          <span className="bg-gradient-to-r from-primary via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            at the speed
          </span>
          <br />
          <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
            of thought
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Forge deploys autonomous AI agents that plan, code, test, and deploy your software.
          Give it a task. Watch it execute. Ship faster than ever.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_-4px_var(--primary)] transition-all hover:shadow-[0_0_60px_-4px_var(--primary)] hover:translate-y-[-1px]"
          >
            Open Dashboard
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-card hover:border-primary/30"
          >
            See Features
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card/30 p-1 max-w-lg mx-auto">
          {["Code Gen", "Testing", "Deployment"].map((item) => (
            <div
              key={item}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-card cursor-default"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
