import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { outreach, brand } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type OutreachStatus =
  | "pitched"
  | "negotiating"
  | "confirmed"
  | "completed"
  | "rejected"
  | "ghosted";

interface UpdateOutreachBody {
  status?: OutreachStatus;
  notes?: string;
  amount?: number;
}

// GET - Get a single outreach record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = getDb();
    const [record] = await db
      .select({
        id: outreach.id,
        brandId: outreach.brandId,
        userId: outreach.userId,
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
      .where(eq(outreach.id, id))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: "Outreach record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("[outreach/[id]] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch outreach record" },
      { status: 500 }
    );
  }
}

// PATCH - Update outreach record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateOutreachBody = await request.json();
    const { status, notes, amount } = body;

    const db = getDb();

    // Check if record exists
    const [existing] = await db
      .select()
      .from(outreach)
      .where(eq(outreach.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Outreach record not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      updateData.status = status;
      // Auto-set timestamps based on status changes
      if (status === "confirmed" && existing.status !== "confirmed") {
        updateData.confirmedAt = new Date();
      }
      if (status === "completed" && existing.status !== "completed") {
        updateData.paidAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (amount !== undefined) {
      updateData.amount = String(amount);
    }

    // Update the record
    const [updated] = await db
      .update(outreach)
      .set(updateData)
      .where(eq(outreach.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[outreach/[id]] PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update outreach record" },
      { status: 500 }
    );
  }
}

// DELETE - Delete outreach record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = getDb();

    const deleted = await db
      .delete(outreach)
      .where(eq(outreach.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Outreach record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error) {
    console.error("[outreach/[id]] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete outreach record" },
      { status: 500 }
    );
  }
}
