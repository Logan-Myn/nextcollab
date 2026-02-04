import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { outreach, brand } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export type OutreachStatus =
  | "pitched"
  | "negotiating"
  | "confirmed"
  | "completed"
  | "rejected"
  | "ghosted";

// GET - List outreach records with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as OutreachStatus | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const offset = (page - 1) * limit;

    // Build base condition
    const conditions = [eq(outreach.userId, userId)];
    if (status) {
      conditions.push(eq(outreach.status, status));
    }

    // Get outreach records with brand data
    const records = await db
      .select({
        id: outreach.id,
        brandId: outreach.brandId,
        status: outreach.status,
        notes: outreach.notes,
        pitchSubject: outreach.pitchSubject,
        pitchBody: outreach.pitchBody,
        pitchTone: outreach.pitchTone,
        pitchedAt: outreach.pitchedAt,
        confirmedAt: outreach.confirmedAt,
        paidAt: outreach.paidAt,
        amount: outreach.amount,
        createdAt: outreach.createdAt,
        updatedAt: outreach.updatedAt,
        brand: {
          id: brand.id,
          name: brand.name,
          instagramUsername: brand.instagramUsername,
          category: brand.category,
          niche: brand.niche,
          followers: brand.followers,
          partnershipCount: brand.partnershipCount,
          activityScore: brand.activityScore,
          bio: brand.bio,
          isVerifiedAccount: brand.isVerifiedAccount,
          profilePicture: brand.profilePicture,
        },
      })
      .from(outreach)
      .innerJoin(brand, eq(outreach.brandId, brand.id))
      .where(and(...conditions))
      .orderBy(desc(outreach.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(outreach)
      .where(and(...conditions));
    const total = Number(countResult[0]?.count || 0);

    // Get stats for all statuses
    const statsResult = await db
      .select({
        status: outreach.status,
        count: sql<number>`count(*)`,
      })
      .from(outreach)
      .where(eq(outreach.userId, userId))
      .groupBy(outreach.status);

    const stats: Record<OutreachStatus, number> = {
      pitched: 0,
      negotiating: 0,
      confirmed: 0,
      completed: 0,
      rejected: 0,
      ghosted: 0,
    };

    for (const row of statsResult) {
      if (row.status in stats) {
        stats[row.status as OutreachStatus] = Number(row.count);
      }
    }

    return NextResponse.json({
      data: records,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[outreach] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch outreach records" },
      { status: 500 }
    );
  }
}
