import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { favorite, brand } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";

// GET - List saved brands for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
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

    // Get favorites with joined brand data
    const favorites = await db
      .select({
        id: favorite.id,
        brandId: favorite.brandId,
        createdAt: favorite.createdAt,
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
      .from(favorite)
      .innerJoin(brand, eq(favorite.brandId, brand.id))
      .where(eq(favorite.userId, userId))
      .orderBy(desc(favorite.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const allFavorites = await db
      .select({ id: favorite.id })
      .from(favorite)
      .where(eq(favorite.userId, userId));

    const total = allFavorites.length;

    return NextResponse.json({
      data: favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[favorites] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

// POST - Save a brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, brandId } = body;

    console.log("[favorites] POST request:", { userId, brandId });

    if (!userId || !brandId) {
      console.log("[favorites] POST missing params:", { userId, brandId });
      return NextResponse.json(
        { error: "userId and brandId are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if already saved
    const existing = await db
      .select()
      .from(favorite)
      .where(and(eq(favorite.userId, userId), eq(favorite.brandId, brandId)))
      .limit(1);

    if (existing.length > 0) {
      console.log("[favorites] POST already exists:", existing[0]);
      return NextResponse.json(
        { error: "Brand already saved", existing: existing[0] },
        { status: 409 }
      );
    }

    // Create new favorite
    const [newFavorite] = await db
      .insert(favorite)
      .values({
        userId,
        brandId,
      })
      .returning();

    console.log("[favorites] POST success:", newFavorite);
    return NextResponse.json({ data: newFavorite }, { status: 201 });
  } catch (error) {
    console.error("[favorites] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to save brand", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Unsave a brand
export async function DELETE(request: NextRequest) {
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

    const deleted = await db
      .delete(favorite)
      .where(and(eq(favorite.userId, userId), eq(favorite.brandId, brandId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error) {
    console.error("[favorites] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
