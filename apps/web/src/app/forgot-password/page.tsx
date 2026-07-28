"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(data: ForgotForm) {
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    void data;
  }

  return (
    <div className="flex min-h-screen bg-black items-center justify-center px-6">
      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2.5"
      >
        <img src="/images/forge_official_logo.png" alt="Forge" className="h-6 w-auto object-contain" />
        <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">Forge</span>
      </Link>

      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center">
            {/* Orange check */}
            <div className="mx-auto mb-8 flex items-center justify-center w-14 h-14 border border-[#F6410F]/30 bg-[#F6410F]/5">
              <svg className="size-6 text-[#F6410F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-5 bg-[#F6410F]" />
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#F6410F]">Sent</span>
              <span className="h-px w-5 bg-[#F6410F]" />
            </div>
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-white mb-3">Check your email</h1>
            <p className="text-sm text-[#4a4a4a] mb-10">
              We&apos;ve sent a password reset link to your inbox.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.1em] uppercase text-[#4a4a4a] border-b border-[#2a2a2a] pb-0.5 transition-all hover:text-white hover:border-[#F6410F]"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-5 bg-[#F6410F]" />
                <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#F6410F]">
                  Password reset
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-[-0.03em] text-white">Forgot your password?</h1>
              <p className="mt-2 text-sm text-[#4a4a4a]">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-medium tracking-[0.1em] uppercase text-[#6b6b6b]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm px-4 py-3 outline-none placeholder:text-[#3a3a3a] focus:border-[#F6410F]/50 transition-colors"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F6410F] text-white text-xs font-semibold tracking-[0.1em] uppercase py-4 transition-all hover:bg-[#d93a0d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-[#4a4a4a]">
              <Link
                href="/login"
                className="text-white hover:text-[#F6410F] transition-colors"
              >
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
