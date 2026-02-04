import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { outreach } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

// POST - Mark a pitch as sent (creates outreach record)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      brandId,
      pitchSubject,
      pitchBody,
      pitchTone,
      templateId,
    } = body;

    if (!userId || !brandId) {
      return NextResponse.json(
        { error: "userId and brandId are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if already pitched
    const existing = await db
      .select()
      .from(outreach)
      .where(and(eq(outreach.userId, userId), eq(outreach.brandId, brandId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Already pitched this brand", existingOutreach: existing[0] },
        { status: 409 }
      );
    }

    // Create new outreach record
    const [newOutreach] = await db
      .insert(outreach)
      .values({
        userId,
        brandId,
        status: "pitched",
        pitchSubject: pitchSubject || null,
        pitchBody: pitchBody || null,
        pitchTone: pitchTone || null,
        templateId: templateId || null,
        pitchedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ data: newOutreach }, { status: 201 });
  } catch (error) {
    console.error("[pitch/mark-sent] Error:", error);
    return NextResponse.json(
      { error: "Failed to mark pitch as sent" },
      { status: 500 }
    );
  }
}

// GET - Check if a brand has been pitched
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const brandId = searchParams.get("brandId");

    if (!userId || !brandId) {
      return NextResponse.json(
        { error: "userId and brandId are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [existing] = await db
      .select()
      .from(outreach)
      .where(and(eq(outreach.userId, userId), eq(outreach.brandId, brandId)))
      .limit(1);

    return NextResponse.json({
      pitched: !!existing,
      outreach: existing || null,
    });
  } catch (error) {
    console.error("[pitch/mark-sent] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to check pitch status" },
      { status: 500 }
    );
  }
}
