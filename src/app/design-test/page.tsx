"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Layers, Zap } from "lucide-react";

const designs = [
  {
    id: "bento-grid",
    name: "Bento Grid",
    description: "Apple-inspired modular design with clean cards, subtle shadows, and asymmetric layouts. Minimal, professional, and highly readable.",
    style: "Minimalist / Apple-style",
    colors: ["#F5F5F7", "#1D1D1F", "#0071E3"],
    icon: Layers,
    features: [
      "Rounded corners (16-24px)",
      "Soft shadows",
      "Grid-based layout",
      "Neutral color palette",
    ],
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description: "Modern frosted glass effect with vibrant gradient backgrounds, translucent cards, and a premium feel. Perfect for a contemporary aesthetic.",
    style: "Glass / Translucent",
    colors: ["#7C3AED", "#EC4899", "#06B6D4"],
    icon: Sparkles,
    features: [
      "Backdrop blur effects",
      "Gradient backgrounds",
      "Translucent cards",
      "Animated elements",
    ],
  },
  {
    id: "neubrutalism",
    name: "Neubrutalism",
    description: "Bold, playful Gen-Z aesthetic with hard shadows, thick borders, and vibrant primary colors. Memorable and distinctive.",
    style: "Bold / Playful",
    colors: ["#FF6B6B", "#FFD93D", "#4ECDC4"],
    icon: Zap,
    features: [
      "Hard offset shadows",
      "Thick borders (3px)",
      "High saturation colors",
      "Bold typography",
    ],
  },
];

export default function DesignTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            Design Exploration
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Brand Discovery Page
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three distinct design approaches for the brand discovery experience.
            Each offers a unique aesthetic while maintaining full functionality.
          </p>
        </header>

        {/* Design Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {designs.map((design) => {
            const Icon = design.icon;
            return (
              <Link
                key={design.id}
                href={`/design-test/${design.id}`}
                className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-gray-700" />
                </div>

                {/* Title & Style */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {design.name}
                </h2>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium mb-4">
                  {design.style}
                </span>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {design.description}
                </p>

                {/* Color Palette */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm text-gray-500 mr-2">Colors:</span>
                  {design.colors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-lg border border-gray-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-8">
                  {design.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
                  View Design
                  <ArrowRight className="w-5 h-5" />
                </div>

                {/* Hover Gradient */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all pointer-events-none" />
              </Link>
            );
          })}
        </div>

        {/* Comparison Notes */}
        <div className="mt-16 p-8 bg-white rounded-3xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Design Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 pr-6 font-semibold text-gray-900">Aspect</th>
                  <th className="py-4 px-6 font-semibold text-gray-900">Bento Grid</th>
                  <th className="py-4 px-6 font-semibold text-gray-900">Glassmorphism</th>
                  <th className="py-4 pl-6 font-semibold text-gray-900">Neubrutalism</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-4 pr-6 font-medium">Target Audience</td>
                  <td className="py-4 px-6">Professional, Corporate</td>
                  <td className="py-4 px-6">Trendy, Premium</td>
                  <td className="py-4 pl-6">Gen Z, Creative</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 pr-6 font-medium">Visual Density</td>
                  <td className="py-4 px-6">Medium</td>
                  <td className="py-4 px-6">Low-Medium</td>
                  <td className="py-4 pl-6">High</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 pr-6 font-medium">Performance</td>
                  <td className="py-4 px-6">Excellent</td>
                  <td className="py-4 px-6">Good (blur effects)</td>
                  <td className="py-4 pl-6">Excellent</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 pr-6 font-medium">Accessibility</td>
                  <td className="py-4 px-6">WCAG AA</td>
                  <td className="py-4 px-6">Needs contrast check</td>
                  <td className="py-4 pl-6">WCAG AAA</td>
                </tr>
                <tr>
                  <td className="py-4 pr-6 font-medium">Memorability</td>
                  <td className="py-4 px-6">Familiar</td>
                  <td className="py-4 px-6">Modern</td>
                  <td className="py-4 pl-6">Distinctive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/brand"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Current Design
          </Link>
        </div>
      </div>
    </div>
  );
}
