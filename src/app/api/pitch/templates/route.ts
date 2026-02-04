import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pitchTemplate } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// GET - List templates for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const templates = await db
      .select()
      .from(pitchTemplate)
      .where(eq(pitchTemplate.userId, userId))
      .orderBy(desc(pitchTemplate.isFavorite), desc(pitchTemplate.usageCount));

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error("[pitch/templates] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, subject, body: bodyText, tone, category } = body;

    if (!userId || !name || !subject || !bodyText) {
      return NextResponse.json(
        { error: "userId, name, subject, and body are required" },
        { status: 400 }
      );
    }

    // Validation
    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: "Template name must be 3-50 characters" },
        { status: 400 }
      );
    }

    if (subject.length < 5 || subject.length > 60) {
      return NextResponse.json(
        { error: "Subject must be 5-60 characters" },
        { status: 400 }
      );
    }

    if (bodyText.length < 20 || bodyText.length > 500) {
      return NextResponse.json(
        { error: "Body must be 20-500 characters" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [newTemplate] = await db
      .insert(pitchTemplate)
      .values({
        userId,
        name,
        subject,
        body: bodyText,
        tone: tone || "professional",
        category: category || null,
      })
      .returning();

    return NextResponse.json({ data: newTemplate }, { status: 201 });
  } catch (error) {
    console.error("[pitch/templates] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PATCH - Update template (increment usage, toggle favorite, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, incrementUsage, isFavorite } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (incrementUsage) {
      updateData.usageCount = sql`${pitchTemplate.usageCount} + 1`;
    }

    if (typeof isFavorite === "boolean") {
      updateData.isFavorite = isFavorite;
    }

    const [updated] = await db
      .update(pitchTemplate)
      .set(updateData)
      .where(eq(pitchTemplate.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[pitch/templates] PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [deleted] = await db
      .delete(pitchTemplate)
      .where(eq(pitchTemplate.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[pitch/templates] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
