import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { notificationSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const db = getDb();
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    if (!settings) {
      return NextResponse.json({
        data: {
          emailDigest: "weekly",
          matchAlerts: true,
          outreachReminders: true,
          productUpdates: true,
        },
      });
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("[api/settings/notifications] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, emailDigest, matchAlerts, outreachReminders, productUpdates } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const db = getDb();

    const [existing] = await db
      .select({ id: notificationSettings.id })
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId))
      .limit(1);

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (emailDigest !== undefined) updates.emailDigest = emailDigest;
    if (matchAlerts !== undefined) updates.matchAlerts = matchAlerts;
    if (outreachReminders !== undefined) updates.outreachReminders = outreachReminders;
    if (productUpdates !== undefined) updates.productUpdates = productUpdates;

    let result;
    if (existing) {
      [result] = await db
        .update(notificationSettings)
        .set(updates)
        .where(eq(notificationSettings.userId, userId))
        .returning();
    } else {
      [result] = await db
        .insert(notificationSettings)
        .values({
          userId,
          emailDigest: emailDigest ?? "weekly",
          matchAlerts: matchAlerts ?? true,
          outreachReminders: outreachReminders ?? true,
          productUpdates: productUpdates ?? true,
        })
        .returning();
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[api/settings/notifications] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}
