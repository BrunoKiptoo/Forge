"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm({ className }: { className?: string }) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError(null);
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-medium tracking-[0.1em] uppercase text-[#a0a0a0]">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register("email")}
          className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm px-4 py-3 outline-none placeholder:text-[#3a3a3a] focus:border-[#F6410F]/50 transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-medium tracking-[0.1em] uppercase text-[#a0a0a0]">
            Password
          </label>
          <a href="/forgot-password" className="text-xs text-[#888888] hover:text-[#F6410F] transition-colors">
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          className="w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm px-4 py-3 outline-none placeholder:text-[#3a3a3a] focus:border-[#F6410F]/50 transition-colors [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]"
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group w-full flex items-center justify-center gap-3 bg-[#F6410F] text-white text-xs font-semibold tracking-[0.1em] uppercase py-4 transition-all hover:bg-[#d93a0d] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {submitting ? (
          <span>Signing in...</span>
        ) : (
          <>
            <span>Sign in</span>
            <svg className="size-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
