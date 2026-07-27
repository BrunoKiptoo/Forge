import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-glow opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-accent/20 blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="rounded-3xl border border-primary/10 bg-gradient-to-b from-primary/5 to-transparent p-12 sm:p-16">
          <Sparkles className="mx-auto size-8 text-primary mb-6" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Ready to ship faster?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of engineering teams already using Forge to accelerate their development workflow.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_0_40px_-4px_var(--primary)] transition-all hover:shadow-[0_0_60px_-4px_var(--primary)] hover:translate-y-[-1px]"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-sm font-semibold text-foreground transition-all hover:bg-card"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
