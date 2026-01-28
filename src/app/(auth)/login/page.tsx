"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);

    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setError(result.error.message || "Invalid email or password");
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
            Welcome back
          </h1>
          <p className="text-[var(--muted)]">
            Sign in to find your next brand partnership
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
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
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
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
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
                Signing in...
              </>
            ) : (
              <>
                Sign in
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
              New to NextCollab?
            </span>
          </div>
        </div>

        {/* Sign up link */}
        <Link
          href="/signup"
          className="w-full btn btn-secondary py-3.5 flex items-center justify-center"
        >
          Create an account
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-xs text-[var(--muted)] mt-6 max-w-sm mx-auto">
        By signing in, you agree to our{" "}
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
