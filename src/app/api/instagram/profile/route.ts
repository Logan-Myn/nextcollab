import { NextRequest, NextResponse } from "next/server";
import { fetchInstagramProfile } from "@/lib/xpoz";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");

  if (!username || username.length < 2) {
    return NextResponse.json(
      { error: "Invalid username" },
      { status: 400 }
    );
  }

  try {
    const profile = await fetchInstagramProfile(username.replace(/^@/, ""));

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("[api/instagram/profile] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
