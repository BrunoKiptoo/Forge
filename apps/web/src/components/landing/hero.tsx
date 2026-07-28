"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      if (particles.length < 60) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.4 - 0.1,
          life: 0,
          maxLife: 200 + Math.random() * 300,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life > p.maxLife) { particles.splice(i, 1); continue; }
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246,65,15,${alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div className="absolute inset-0 bg-glow pointer-events-none" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F6410F]/20 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 w-full max-w-6xl mx-auto">

        {/* Eyebrow */}
        <div className="mb-6 sm:mb-10 flex items-center gap-3">
          <span className="h-px w-6 sm:w-8 bg-[#F6410F]" />
          <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#F6410F]">
            Autonomous Engineering
          </span>
          <span className="h-px w-6 sm:w-8 bg-[#F6410F]" />
        </div>

        {/* Wordmark */}
        <h1 className="font-bold leading-[0.9]" style={{ letterSpacing: "-0.04em" }}>
          <span className="block text-[clamp(3.5rem,18vw,11rem)] text-white">
            FORGE
          </span>
          <span className="block text-[clamp(0.75rem,3.5vw,2.5rem)] font-light tracking-[0.12em] sm:tracking-[0.15em] uppercase mt-3 sm:mt-4 text-[#b0b0b0]">
            AI Software Engineering
          </span>
        </h1>

        {/* Divider */}
        <div className="mt-8 sm:mt-12 mb-8 sm:mb-12 flex items-center gap-4 w-full max-w-xs sm:max-w-md">
          <div className="flex-1 h-px bg-[#1f1f1f]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#F6410F]" />
          <div className="flex-1 h-px bg-[#1f1f1f]" />
        </div>

        {/* Descriptor */}
        <p className="max-w-sm sm:max-w-lg text-[#a0a0a0] text-sm sm:text-base leading-relaxed font-light tracking-wide px-2 sm:px-0">
          Describe a task. A team of specialized agents plans, codes,
          tests, and deploys — autonomously.
        </p>

        {/* CTAs */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
          <Link
            href="/register"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#F6410F] text-white text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase px-8 py-4 transition-all duration-300 hover:bg-[#d93a0d]"
          >
            <span>Start Building</span>
            <svg className="size-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.08em] uppercase text-[#a0a0a0] border-b border-[#2a2a2a] pb-0.5 transition-all duration-300 hover:text-white hover:border-[#F6410F]"
          >
            See How It Works
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-14 sm:mt-24 grid grid-cols-3 gap-0 border border-[#1a1a1a] w-full max-w-sm sm:max-w-2xl">
          {[
            { value: "5", label: "Agents" },
            { value: "∞", label: "Tasks" },
            { value: "0", label: "Manual Steps" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`px-3 sm:px-8 py-5 sm:py-6 text-center ${i < 2 ? "border-r border-[#1a1a1a]" : ""}`}
            >
              <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="mt-1 text-[9px] sm:text-xs text-[#888888] tracking-[0.1em] sm:tracking-[0.12em] uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator — hide on short screens */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#a0a0a0]">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-[#6b6b6b] to-transparent" />
      </div>
    </section>
  );
}
