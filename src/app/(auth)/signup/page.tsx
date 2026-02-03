"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/lib/auth-client";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              {...register("name")}
              type="text"
              id="name"
              autoComplete="name"
              placeholder="Your name"
              className="h-12 rounded-xl bg-[var(--surface-elevated)]"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register("email")}
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-12 rounded-xl bg-[var(--surface-elevated)]"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                placeholder="Create a password"
                className="h-12 pr-12 rounded-xl bg-[var(--surface-elevated)]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="h-12 pr-12 rounded-xl bg-[var(--surface-elevated)]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <ShimmerButton
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 mt-2 text-base font-medium disabled:opacity-50"
            background="var(--accent)"
            shimmerColor="rgba(255,255,255,0.3)"
            borderRadius="12px"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </ShimmerButton>
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
        <Button variant="outline" size="lg" className="w-full h-12" asChild>
          <Link href="/login">Sign in instead</Link>
        </Button>
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
