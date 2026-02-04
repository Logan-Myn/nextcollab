import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import {
  buildSystemPrompt,
  buildUserPrompt,
  type ToneType,
  type LengthType,
  type CreatorData,
  type BrandData,
} from "@/lib/ai/pitch-prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      creator,
      brand,
      tone = "professional",
      length = "medium",
      customPoints = [],
    } = body as {
      creator: CreatorData;
      brand: BrandData;
      tone?: ToneType;
      length?: LengthType;
      customPoints?: string[];
    };

    if (!creator || !brand) {
      return NextResponse.json(
        { error: "Creator and brand data are required" },
        { status: 400 }
      );
    }

    const params = { creator, brand, tone, length, customPoints };
    const systemPrompt = buildSystemPrompt(params);
    const userPrompt = buildUserPrompt(params);

    const result = streamText({
      model: anthropic("claude-3-5-haiku-20241022"),
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      maxOutputTokens: 500,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[pitch/generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate pitch" },
      { status: 500 }
    );
  }
}
