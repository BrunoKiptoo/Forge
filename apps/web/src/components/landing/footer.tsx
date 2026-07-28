import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black border-t border-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/images/forge_official_logo.png" alt="Forge" className="h-5 sm:h-6 w-auto object-contain" />
          <span className="text-sm font-semibold tracking-[0.1em] uppercase text-white">Forge</span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-5 sm:gap-6 flex-wrap justify-center">
          {["Dashboard", "Docs", "GitHub", "Status"].map((item, i, arr) => (
            <span key={item} className="flex items-center gap-5 sm:gap-6">
              <Link
                href="#"
                className="text-[10px] sm:text-xs tracking-[0.12em] uppercase text-[#888888] transition-colors hover:text-white"
              >
                {item}
              </Link>
              {i < arr.length - 1 && <span className="w-px h-3 bg-[#2a2a2a]" />}
            </span>
          ))}
        </nav>

        {/* Copyright — visible grey, not near-black */}
        <p className="text-[10px] sm:text-xs text-[#707070] tracking-[0.1em] shrink-0">
          &copy; {new Date().getFullYear()} FORGE
        </p>
      </div>
    </footer>
  );
}
