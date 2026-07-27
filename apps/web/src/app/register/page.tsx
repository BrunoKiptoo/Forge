import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { GitHubButton } from "@/components/auth/github-button";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-black">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#F6410F]/5 blur-[120px]" />
        </div>

        <Link href="/" className="relative flex items-center gap-3">
          <img src="/images/forge_official_logo.png" alt="Forge" className="h-7 w-auto object-contain" />
          <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">Forge</span>
        </Link>

        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-[#F6410F]" />
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#F6410F]">
              Get started
            </span>
          </div>
          <p className="text-4xl font-bold tracking-[-0.03em] text-white leading-[1.1]">
            Your first task<br />
            <span className="text-[#3a3a3a]">ships in</span><br />
            minutes.
          </p>
          <p className="mt-6 text-sm text-[#4a4a4a] leading-relaxed max-w-xs">
            Describe what you want to build. Forge handles the rest — planning, coding, testing, deploying.
          </p>
        </div>

        <div className="relative grid grid-cols-3 border-t border-[#1a1a1a] pt-8">
          {[
            { value: "01", label: "Describe" },
            { value: "02", label: "Review" },
            { value: "03", label: "Ship" },
          ].map((s, i) => (
            <div key={s.label} className={i < 2 ? "border-r border-[#1a1a1a] pr-6" : "pl-6"}>
              <div className="text-xl font-bold text-[#F6410F]">{s.value}</div>
              <div className="text-[10px] text-[#4a4a4a] tracking-[0.12em] uppercase mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
          <img src="/images/forge_official_logo.png" alt="Forge" className="h-6 w-auto object-contain" />
          <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">Forge</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-5 bg-[#F6410F]" />
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#F6410F]">
                New account
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-white">Create your account</h1>
            <p className="mt-2 text-sm text-[#4a4a4a]">Start building with AI agents today</p>
          </div>

          <RegisterForm />

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#1a1a1a]" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#3a3a3a]">or</span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>

          <GitHubButton className="w-full" />

          <p className="mt-8 text-center text-xs text-[#4a4a4a]">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-[#F6410F] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
