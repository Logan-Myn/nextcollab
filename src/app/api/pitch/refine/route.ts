import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import {
  buildRefineSystemPrompt,
  type CreatorData,
  type BrandData,
} from "@/lib/ai/pitch-prompts";

type CoreMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

interface UIMessagePart {
  type: string;
  text?: string;
}

interface IncomingMessage {
  role: "user" | "assistant";
  content?: string;
  parts?: UIMessagePart[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, creator, brand } = body as {
      messages: IncomingMessage[];
      creator?: CreatorData;
      brand?: BrandData;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Convert UIMessage format (with parts) to CoreMessage format (with content)
    const coreMessages: CoreMessage[] = messages.map((msg) => {
      let content: string;

      if (msg.content) {
        // Already has content string
        content = msg.content;
      } else if (msg.parts) {
        // Extract text from parts array
        content = msg.parts
          .filter((part) => part.type === "text" && part.text)
          .map((part) => part.text!)
          .join("");
      } else {
        content = "";
      }

      return {
        role: msg.role,
        content,
      };
    });

    // Build context-aware system prompt
    let systemPrompt = buildRefineSystemPrompt();

    // Add creator/brand context if provided
    if (creator || brand) {
      systemPrompt += `\n\nContext for reference:`;
      if (creator) {
        systemPrompt += `\nCreator: @${creator.username}`;
        if (creator.followers) systemPrompt += `, ${creator.followers} followers`;
        if (creator.niche) systemPrompt += `, ${creator.niche} niche`;
      }
      if (brand) {
        systemPrompt += `\nBrand: ${brand.name}`;
        if (brand.category) systemPrompt += `, ${brand.category}`;
      }
    }

    const result = streamText({
      model: anthropic("claude-3-5-haiku-20241022"),
      system: systemPrompt,
      messages: coreMessages,
      maxOutputTokens: 500,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[pitch/refine] Error:", error);
    return NextResponse.json(
      { error: "Failed to refine pitch" },
      { status: 500 }
    );
  }
}
