"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const inputClass =
  "w-full bg-[#0a0a0a] border border-[#1f1f1f] text-white text-sm px-4 py-3 outline-none placeholder:text-[#3a3a3a] focus:border-[#F6410F]/50 transition-colors [&:-webkit-autofill]:![background-color:#0a0a0a] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#0a0a0a_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]";

const labelClass = "text-xs font-medium tracking-[0.1em] uppercase text-[#6b6b6b]";

export function RegisterForm({ className }: { className?: string }) {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setError(null);
    setSubmitting(true);
    try {
      await registerUser(data.email, data.password, data.name);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={labelClass}>Name</label>
        <input id="name" type="text" placeholder="Your name" {...register("name")} className={inputClass} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" type="email" placeholder="name@example.com" {...register("email")} className={inputClass} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>Password</label>
        <input id="password" type="password" placeholder="••••••••" {...register("password")} className={inputClass} />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
        <input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} className={inputClass} />
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
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
          <span>Creating account...</span>
        ) : (
          <>
            <span>Create account</span>
            <svg className="size-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
