"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { MagicCard } from "@/components/ui/magic-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import { Marquee } from "@/components/ui/marquee";

const stats = [
  { value: 10000, suffix: "+", label: "Active Creators" },
  { value: 2500, suffix: "", label: "Brand Partners" },
  { value: 12, prefix: "€", suffix: "M", label: "Deals Facilitated" },
  { value: 94, suffix: "%", label: "Match Success" },
];

const features = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.728.121a6 6 0 01-4.814-1.5m.003 0a6 6 0 01-4.814 1.5l-.728-.121c-1.716-.293-2.299-2.379-1.067-3.611L5 14.5"
        />
      </svg>
    ),
    title: "AI-Powered Matching",
    description:
      "Our algorithm analyzes engagement patterns, audience demographics, and brand fit to surface your ideal partnerships.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
        />
      </svg>
    ),
    title: "Real-Time Analytics",
    description:
      "Track campaign performance, engagement rates, and ROI with dashboards built for creators and brands alike.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
    title: "Direct Connections",
    description:
      "Skip the middlemen. Connect directly with brand decision-makers and negotiate on your terms.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Transparent Pricing",
    description:
      "See market rates, compare opportunities, and ensure you're getting fair value for your content.",
  },
];

const testimonials = [
  {
    quote:
      "I went from spending hours searching for sponsors to having qualified brands reach out to me. Game changer.",
    author: "Marie Chen",
    role: "Lifestyle Creator",
    followers: "340K followers",
    avatar: "MC",
  },
  {
    quote:
      "The matching algorithm is scary good. Every creator we've partnered with has exceeded our campaign goals.",
    author: "Thomas Weber",
    role: "Marketing Director, Fauna",
    followers: "B2B SaaS",
    avatar: "TW",
  },
  {
    quote:
      "Finally, a platform that understands European creators. The localized brand database is exactly what we needed.",
    author: "Sofia Andersson",
    role: "Fashion Creator",
    followers: "890K followers",
    avatar: "SA",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For creators just getting started",
    features: [
      "Basic profile",
      "5 brand searches/month",
      "Email notifications",
      "Community access",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Creator Pro",
    price: "€49",
    period: "/month",
    description: "For serious creators ready to scale",
    features: [
      "Unlimited searches",
      "AI recommendations",
      "Priority inbox placement",
      "Analytics dashboard",
      "Direct brand contacts",
      "Media kit builder",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "€149",
    period: "/month",
    description: "For agencies managing multiple creators",
    features: [
      "Up to 15 creator profiles",
      "Team collaboration",
      "Bulk outreach tools",
      "Advanced analytics",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              NextCollab
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
            >
              Stories
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden noise-bg">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--accent)] opacity-[0.02] rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left content */}
            <div className="relative z-10">
              <div className="animate-fade-up opacity-0">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-sm font-medium mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                  Now in open beta
                </span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 animate-fade-up opacity-0 delay-100"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Where creators
                <br />
                <span className="gradient-text">meet their</span>
                <br />
                perfect brands
              </h1>

              <p className="text-lg md:text-xl text-[var(--muted)] max-w-lg mb-8 animate-fade-up opacity-0 delay-200">
                Stop searching. Start matching. Our AI connects Instagram
                creators with sponsorship opportunities that actually fit.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up opacity-0 delay-300">
                <ShimmerButton
                  className="h-12 px-6 text-base font-medium"
                  background="var(--accent)"
                  shimmerColor="rgba(255,255,255,0.3)"
                  borderRadius="12px"
                  onClick={() => window.location.href = "/signup?type=creator"}
                >
                  I&apos;m a Creator
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </ShimmerButton>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/signup?type=brand">I&apos;m a Brand</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-up opacity-0 delay-400">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div
                      className="text-2xl md:text-3xl font-bold text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {stat.prefix}
                      <NumberTicker value={stat.value} className="text-[var(--foreground)]" />
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-[var(--muted)]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Floating cards visualization */}
            <div className="relative lg:h-[600px] hidden lg:block">
              {/* Creator card 1 */}
              <div className="absolute top-0 right-0 w-72 bg-[var(--surface)] rounded-2xl p-4 shadow-xl border border-[var(--border)] animate-float card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                    JL
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Julia Laurent</div>
                    <div className="text-xs text-[var(--muted)]">
                      @julialaurent
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs font-medium text-[var(--accent)]">
                      98% match
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-[var(--muted)] mb-3">
                  <span>234K followers</span>
                  <span>4.8% engagement</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full bg-[var(--surface-elevated)] text-xs">
                    Fashion
                  </span>
                  <span className="px-2 py-1 rounded-full bg-[var(--surface-elevated)] text-xs">
                    Lifestyle
                  </span>
                </div>
              </div>

              {/* Brand notification */}
              <div
                className="absolute top-40 left-0 w-64 bg-[var(--surface)] rounded-xl p-4 shadow-lg border border-[var(--border)] animate-float card-hover"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[var(--accent)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">New opportunity</div>
                    <div className="text-xs text-[var(--muted)]">
                      Glossier wants to collaborate
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics card */}
              <div
                className="absolute bottom-20 right-10 w-80 bg-[var(--surface)] rounded-2xl p-5 shadow-xl border border-[var(--border)] animate-float card-hover"
                style={{ animationDelay: "2s" }}
              >
                <div className="text-sm font-medium mb-4">
                  Campaign Performance
                </div>
                <div className="flex items-end gap-2 h-24">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-[var(--accent)] opacity-80"
                      style={{
                        height: `${height}%`,
                        opacity: 0.4 + i * 0.1,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-xs text-[var(--muted)]">
                  <span>Mon</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* Match badge */}
              <div
                className="absolute bottom-40 left-10 bg-[var(--foreground)] text-[var(--background)] rounded-full px-4 py-2 text-sm font-medium shadow-lg animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[var(--accent)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  12 new matches today
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 border-y border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-[var(--muted)] mb-8">
            Trusted by leading brands and agencies
          </p>
          <Marquee pauseOnHover className="[--duration:30s] opacity-40">
            {["Sephora", "Zalando", "Glossier", "Gymshark", "ASOS", "H&M", "Nike", "Adidas"].map(
              (brand) => (
                <span
                  key={brand}
                  className="text-xl font-semibold tracking-tight mx-8"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {brand}
                </span>
              )
            )}
          </Marquee>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything you need to
              <br />
              <span className="gradient-text">monetize your influence</span>
            </h2>
            <p className="text-lg text-[var(--muted)]">
              Built by creators, for creators. We handle the complexity so you
              can focus on what you do best.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <BlurFade key={feature.title} delay={0.1 * index} inView>
                <MagicCard
                  className="rounded-2xl border border-[var(--border)]"
                  gradientColor="var(--accent-light)"
                  gradientFrom="var(--accent)"
                  gradientTo="var(--accent-secondary)"
                  gradientOpacity={0.15}
                >
                  <div className="group p-8">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] mb-5 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-[var(--muted)]">{feature.description}</p>
                  </div>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-[var(--surface-elevated)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              From signup to sponsorship
              <br />
              in three steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create your profile",
                description:
                  "Connect your Instagram, showcase your best work, and let our AI analyze your unique value.",
              },
              {
                step: "02",
                title: "Get matched",
                description:
                  "Our algorithm identifies brands that align with your audience, content style, and values.",
              },
              {
                step: "03",
                title: "Close deals",
                description:
                  "Negotiate directly with brands, track campaigns, and grow your sponsorship portfolio.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div
                  className="text-6xl font-bold text-[var(--border)] mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.step}
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>
                <p className="text-[var(--muted)]">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-[var(--border)] to-transparent -translate-x-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Creators and brands
              <br />
              <span className="gradient-text">love NextCollab</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <BlurFade key={testimonial.author} delay={0.1 * index} inView>
                <MagicCard
                  className="rounded-2xl border border-[var(--border)] h-full"
                  gradientColor="var(--accent-light)"
                  gradientOpacity={0.1}
                >
                  <div className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-[var(--accent)]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-lg mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center text-white text-sm font-medium">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {testimonial.author}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {testimonial.role} · {testimonial.followers}
                        </div>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="py-24 md:py-32 bg-[var(--surface-elevated)]"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-[var(--muted)]">
              Start free. Scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <BlurFade key={plan.name} delay={0.1 * index} inView>
                <div
                  className={`relative p-8 rounded-2xl border ${
                    plan.highlighted
                      ? "border-[var(--accent)] bg-[var(--surface)] shadow-xl"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  } hover:shadow-lg transition-shadow h-full flex flex-col`}
                >
                  {plan.highlighted && (
                    <>
                      <ShineBorder
                        shineColor={["var(--accent)", "var(--accent-secondary)"]}
                        borderWidth={2}
                        duration={10}
                      />
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium z-10">
                        Most Popular
                      </div>
                    </>
                  )}
                  <div className="mb-6">
                    <h3
                      className="text-xl font-semibold mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)]">
                      {plan.description}
                    </p>
                  </div>
                  <div className="mb-6">
                    <span
                      className="text-4xl font-bold"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-[var(--muted)]">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm"
                      >
                        <svg
                          className="w-5 h-5 text-[var(--accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--foreground)]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2
            className="text-3xl md:text-5xl font-bold text-[var(--background)] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to transform your
            <br />
            Instagram into a business?
          </h2>
          <p className="text-lg text-[var(--background)] opacity-70 mb-8 max-w-2xl mx-auto">
            Join thousands of creators already using NextCollab to land
            sponsorships that align with their brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ShimmerButton
              className="h-12 px-6 text-base font-medium"
              background="var(--background)"
              shimmerColor="var(--accent)"
              borderRadius="12px"
              onClick={() => window.location.href = "/signup"}
            >
              <span className="text-[var(--foreground)]">Start for Free</span>
              <svg
                className="w-4 h-4 ml-2 text-[var(--foreground)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </ShimmerButton>
            <Button
              variant="ghost"
              size="lg"
              className="border border-[var(--background)]/30 text-[var(--background)] hover:bg-[var(--background)]/10"
              asChild
            >
              <Link href="/demo">Watch Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span
                  className="text-xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  NextCollab
                </span>
              </Link>
              <p className="text-sm text-[var(--muted)] max-w-xs">
                The AI-powered platform connecting Instagram creators with brand
                sponsorships. Built in Europe.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li>
                  <Link href="#features" className="hover:text-[var(--foreground)]">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-[var(--foreground)]">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-[var(--foreground)]">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li>
                  <Link href="/about" className="hover:text-[var(--foreground)]">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-[var(--foreground)]">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-[var(--foreground)]">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--muted)]">
                <li>
                  <Link href="/privacy" className="hover:text-[var(--foreground)]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[var(--foreground)]">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/gdpr" className="hover:text-[var(--foreground)]">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">
              &copy; 2025 NextCollab. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link
                href="https://twitter.com"
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="https://instagram.com"
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link
                href="https://linkedin.com"
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
