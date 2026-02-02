import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { partnership } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

interface MonthlyActivity {
  month: string;
  monthLabel: string;
  count: number;
}

function calculateContactSignal(monthlyActivity: MonthlyActivity[]) {
  const totalCount = monthlyActivity.reduce((sum, m) => sum + m.count, 0);
  const lastThreeMonths = monthlyActivity.slice(-3);
  const recentCount = lastThreeMonths.reduce((sum, m) => sum + m.count, 0);

  // Active: 2+ collabs in last 3 months
  if (recentCount >= 2) return { signal: "active" as const, isGood: true };

  // Moderate: 1 collab in last 3 months OR 3+ total in 6 months
  if (recentCount >= 1 || totalCount >= 3) return { signal: "moderate" as const, isGood: true };

  // Low: No recent activity
  return { signal: "low" as const, isGood: false };
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id: brandId } = await params;

    // Calculate 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Query monthly partnership counts
    const rawActivity = await db
      .select({
        month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${partnership.detectedAt}), 'YYYY-MM')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(partnership)
      .where(
        and(
          eq(partnership.brandId, brandId),
          gte(partnership.detectedAt, sixMonthsAgo)
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${partnership.detectedAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${partnership.detectedAt}) ASC`);

    // Create a map of existing data
    const activityMap = new Map(rawActivity.map((r) => [r.month, r.count]));

    // Generate all 6 months (fill gaps with 0)
    const monthlyActivity: MonthlyActivity[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = getMonthKey(date);
      monthlyActivity.push({
        month: monthKey,
        monthLabel: getMonthLabel(date),
        count: activityMap.get(monthKey) || 0,
      });
    }

    // Calculate current month progress (percentage of month elapsed)
    const today = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentMonthProgress = Math.round((today / daysInMonth) * 100);

    // Calculate contact signal
    const { signal, isGood } = calculateContactSignal(monthlyActivity);

    // Find last active month
    let lastActiveMonth: string | null = null;
    for (let i = monthlyActivity.length - 1; i >= 0; i--) {
      if (monthlyActivity[i].count > 0) {
        lastActiveMonth = monthlyActivity[i].monthLabel;
        break;
      }
    }

    return NextResponse.json({
      data: {
        monthlyActivity,
        currentMonthProgress,
        isGoodTimeToContact: isGood,
        contactSignal: signal,
        lastActiveMonth,
      },
    });
  } catch (error) {
    console.error("[brands/activity] Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand activity" },
      { status: 500 }
    );
  }
}
