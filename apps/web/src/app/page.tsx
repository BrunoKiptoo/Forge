import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/forge_official_logo.png" alt="Forge" className="h-6 w-auto object-contain" />
          <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">Forge</span>
        </Link>

        {/* Center links */}
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "Docs", "Pricing"].map((item) => (
            <Link
              key={item}
              href={item === "Features" ? "#features" : "#"}
              className="text-xs tracking-[0.15em] uppercase text-[#4a4a4a] transition-colors hover:text-white"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:block text-xs tracking-[0.15em] uppercase text-[#4a4a4a] transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold tracking-[0.12em] uppercase bg-[#F6410F] text-white px-5 py-2.5 transition-all duration-200 hover:bg-[#d93a0d]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="overflow-x-hidden pt-14">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
