import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const maxDuration = 120;

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;

interface PhaseData {
  phase: string;
  progress: number;
  data: Record<string, unknown>;
}

async function savePhaseToDb(userId: string, phase: PhaseData) {
  const db = getDb();
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (phase.phase === "profile") {
    updateData.followers = phase.data.followers as number;
    updateData.bio = phase.data.bio as string | null;
    updateData.profilePicture = phase.data.profilePicture as string | null;
  } else if (phase.phase === "metrics") {
    updateData.engagementRate = phase.data.engagementRate?.toString() || null;
    updateData.avgViews = phase.data.avgViews as number | null;
    updateData.avgLikes = phase.data.avgLikes as number | null;
    updateData.avgComments = phase.data.avgComments as number | null;
    updateData.postFrequency = phase.data.postFrequency?.toString() || null;
    updateData.viewToFollowerRatio = phase.data.viewToFollowerRatio?.toString() || null;
    updateData.postTypeMix = phase.data.postTypeMix ? JSON.stringify(phase.data.postTypeMix) : null;
    updateData.postsAnalyzed = phase.data.postsAnalyzed as number | null;
  } else if (phase.phase === "ai") {
    const contentThemes = phase.data.contentThemes as string[] | null;
    updateData.contentThemes = contentThemes ? JSON.stringify(contentThemes) : null;
    updateData.subNiches = phase.data.subNiches ? JSON.stringify(phase.data.subNiches as string[]) : null;
    updateData.primaryLanguage = phase.data.primaryLanguage as string | null;
    updateData.locationDisplay = phase.data.locationDisplay as string | null;
    updateData.countryCode = phase.data.countryCode as string | null;
    updateData.enrichedAt = new Date();
    updateData.enrichmentVersion = 1;
    if (contentThemes && contentThemes.length > 0) {
      updateData.niche = contentThemes[0];
    }
  }

  await db
    .update(creatorProfile)
    .set(updateData)
    .where(eq(creatorProfile.userId, userId));
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  const userId = request.nextUrl.searchParams.get("userId");

  if (!username || !userId) {
    return new Response(JSON.stringify({ error: "username and userId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers: Record<string, string> = {};
  if (BACKEND_API_KEY) {
    headers["x-api-key"] = BACKEND_API_KEY;
  }

  const backendUrl = `${BACKEND_URL}/profile/${encodeURIComponent(username)}/enrich-stream`;

  try {
    const backendResponse = await fetch(backendUrl, {
      headers,
      signal: AbortSignal.timeout(110000),
    });

    if (!backendResponse.ok || !backendResponse.body) {
      return new Response(JSON.stringify({ error: "Backend enrichment failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const backendBody = backendResponse.body;
    const reader = backendBody.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages from buffer
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            let currentEvent = "";
            let currentData = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                currentEvent = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                currentData = line.slice(6).trim();
              } else if (line === "" && currentEvent && currentData) {
                // Forward the event to the client
                controller.enqueue(encoder.encode(`event: ${currentEvent}\ndata: ${currentData}\n\n`));

                // Save phase data to DB
                if (currentEvent === "phase") {
                  try {
                    const parsed = JSON.parse(currentData) as PhaseData;
                    await savePhaseToDb(userId, parsed);
                  } catch (e) {
                    console.error("[enrich-stream] Failed to save phase to DB:", e);
                  }
                }

                currentEvent = "";
                currentData = "";
              }
            }
          }
        } catch (error) {
          console.error("[enrich-stream] Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[enrich-stream] Error connecting to backend:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to enrichment service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
