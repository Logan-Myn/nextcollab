"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Loader2 } from "lucide-react";

interface MonthlyActivity {
  month: string;
  monthLabel: string;
  count: number;
}

interface ActivityData {
  monthlyActivity: MonthlyActivity[];
  currentMonthProgress: number;
  isGoodTimeToContact: boolean;
  contactSignal: "active" | "moderate" | "low";
  lastActiveMonth: string | null;
}

interface ActivityChartProps {
  brandId: string;
}

export function ActivityChart({ brandId }: ActivityChartProps) {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch(`/api/brands/${brandId}/activity`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [brandId]);

  if (loading) {
    return (
      <div className="bg-[var(--surface)] rounded-xl shadow-md p-5 animate-pulse">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-[var(--muted)] animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail - don't show broken state
  }

  const totalCollabs = data.monthlyActivity.reduce((sum, m) => sum + m.count, 0);

  // If no data at all, show empty state
  if (totalCollabs === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-xl shadow-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">Sponsorship Activity</h3>
            <p className="text-xs text-[var(--muted)]">Collaborations over the last 6 months</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-500/10 text-zinc-500 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-current" />
            No recent activity
          </div>
        </div>
        <div className="h-32 flex items-center justify-center text-[var(--muted)] text-sm">
          No collaborations detected in the last 6 months
        </div>
      </div>
    );
  }

  // Status badge config
  const statusConfig = {
    active: {
      label: "Good time to contact!",
      bgClass: "bg-emerald-500/10",
      textClass: "text-emerald-600",
      dotClass: "bg-emerald-500",
    },
    moderate: {
      label: "Moderately active",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-600",
      dotClass: "bg-amber-500",
    },
    low: {
      label: "Low activity",
      bgClass: "bg-zinc-500/10",
      textClass: "text-zinc-500",
      dotClass: "bg-zinc-400",
    },
  };

  const status = statusConfig[data.contactSignal];
  const maxCount = Math.max(...data.monthlyActivity.map((m) => m.count), 1);
  const yAxisMax = Math.ceil(maxCount * 1.2) || 3;

  // Format data for chart - add isCurrentMonth flag
  const chartData = data.monthlyActivity.map((m, i) => ({
    ...m,
    label: m.monthLabel.split(" ")[0], // Just "Jan", "Feb", etc.
    isCurrentMonth: i === data.monthlyActivity.length - 1,
  }));

  return (
    <div className="bg-[var(--surface)] rounded-xl shadow-md hover:shadow-lg transition-shadow p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Sponsorship Activity</h3>
          <p className="text-xs text-[var(--muted)]">
            Collaborations over the last 6 months
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgClass} ${status.textClass} text-xs font-medium`}
        >
          <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
          {status.label}
          {data.contactSignal !== "low" && (
            <span className="text-[10px] opacity-70">
              ({data.currentMonthProgress}% of month)
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--accent)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--accent)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              dy={8}
            />
            <YAxis
              domain={[0, yAxisMax]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
              allowDecimals={false}
              width={30}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as (typeof chartData)[0];
                  return (
                    <div className="bg-[var(--surface-elevated)] px-3 py-2 rounded-lg shadow-lg border border-[var(--border)]">
                      <p className="text-xs text-[var(--muted)]">{item.monthLabel}</p>
                      <p className="font-semibold">
                        {item.count} {item.count === 1 ? "collab" : "collabs"}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#activityGradient)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.isCurrentMonth) {
                  return (
                    <g key={payload.month}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="var(--accent)"
                        stroke="var(--surface)"
                        strokeWidth={2}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="var(--accent)"
                        fillOpacity={0.2}
                      />
                    </g>
                  );
                }
                return (
                  <circle
                    key={payload.month}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="var(--accent)"
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{
                r: 6,
                stroke: "var(--accent)",
                strokeWidth: 2,
                fill: "var(--surface)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
