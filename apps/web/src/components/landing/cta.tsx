import Link from "next/link";

const steps = [
  { n: "01", title: "Describe", body: "Write a task in plain English. No special syntax." },
  { n: "02", title: "Review", body: "Approve the execution plan before anything runs." },
  { n: "03", title: "Execute", body: "Agents work in parallel. Watch every step live." },
  { n: "04", title: "Ship", body: "Code is tested, committed, and deployed automatically." },
];

export function CTA() {
  return (
    <>
      {/* How it works */}
      <section className="bg-[#050505] py-20 sm:py-32 lg:py-40 border-t border-[#1a1a1a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 sm:mb-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-[#F6410F]" />
              <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-[#F6410F]">
                Process
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-white">
              Four steps.<br />
              <span className="text-[#3a3a3a]">Zero friction.</span>
            </h2>
          </div>

          {/* Steps — 1 col mobile, 2 col sm, 4 col lg */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-[#1a1a1a]">
            {steps.map(({ n, title, body }, i) => (
              <div
                key={n}
                className={[
                  "pt-8 pb-10 px-0 sm:pr-8",
                  // mobile: bottom border except last
                  i < 3 ? "border-b border-[#1a1a1a]" : "",
                  // sm 2-col
                  i % 2 === 0 ? "sm:border-r sm:border-[#1a1a1a]" : "sm:border-r-0",
                  i < 2 ? "sm:border-b sm:border-[#1a1a1a]" : "sm:border-b-0",
                  // lg 4-col
                  i < 3 ? "lg:border-r lg:border-[#1a1a1a] lg:border-b-0" : "lg:border-r-0",
                  i >= 2 ? "sm:border-b-0" : "",
                ].join(" ")}
              >
                <div className="text-[#F6410F] text-xs font-bold tracking-[0.2em] mb-5 sm:mb-6">{n}</div>
                <div className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 tracking-tight">{title}</div>
                <div className="text-xs sm:text-sm text-[#4a4a4a] leading-relaxed">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-black py-28 sm:py-40 overflow-hidden border-t border-[#1a1a1a]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] rounded-full bg-[#F6410F]/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <span className="h-px w-6 sm:w-8 bg-[#F6410F]" />
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-[#F6410F]">
              Get Started
            </span>
            <span className="h-px w-6 sm:w-8 bg-[#F6410F]" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-[-0.04em] text-white leading-[0.95] mb-6 sm:mb-8">
            Build something<br />
            <span className="text-[#3a3a3a]">remarkable.</span>
          </h2>

          <p className="text-[#4a4a4a] text-sm sm:text-base max-w-sm sm:max-w-md mx-auto mb-10 sm:mb-14 leading-relaxed">
            Join engineering teams already using Forge to ship faster, with fewer errors, and less overhead.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/register"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#F6410F] text-white text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase px-10 py-4 transition-all duration-300 hover:bg-[#d93a0d]"
            >
              <span>Start Free</span>
              <svg className="size-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium tracking-[0.08em] uppercase text-[#4a4a4a] border-b border-[#2a2a2a] pb-0.5 transition-all duration-300 hover:text-white hover:border-[#F6410F]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
