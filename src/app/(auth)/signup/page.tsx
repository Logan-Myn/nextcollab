"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignupForm) => {
    setError(null);

    const result = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (result.error) {
      setError(result.error.message || "Something went wrong. Please try again.");
      return;
    }

    router.push("/onboarding");
  };

  return (
    <div className="w-full max-w-md animate-fade-up opacity-0">
      {/* Card */}
      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-8 md:p-10 shadow-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create your account
          </h1>
          <p className="text-[var(--muted)]">
            Start finding brand partnerships today
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-scale-in">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
            >
              Full name
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              autoComplete="name"
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                placeholder="Create a password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Password requirements */}
            {password && (
              <div className="mt-3 space-y-1.5">
                {passwordRequirements.map((req) => {
                  const passed = req.test(password);
                  return (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passed ? "text-green-600 dark:text-green-400" : "text-[var(--muted)]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          passed
                            ? "bg-green-500 text-white"
                            : "bg-[var(--surface-elevated)] border border-[var(--border)]"
                        }`}
                      >
                        {passed && <Check className="w-2.5 h-2.5" />}
                      </div>
                      {req.label}
                    </div>
                  );
                })}
              </div>
            )}

            {errors.password && !password && (
              <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[var(--surface)] text-[var(--muted)]">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign in link */}
        <Link
          href="/login"
          className="w-full btn btn-secondary py-3.5 flex items-center justify-center"
        >
          Sign in instead
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-[var(--muted)] mt-6 max-w-sm mx-auto">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-[var(--accent)] hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[var(--accent)] hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
