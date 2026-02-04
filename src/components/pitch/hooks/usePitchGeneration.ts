"use client";

import { useState, useCallback } from "react";
import { useCompletion } from "@ai-sdk/react";
import {
  parsePitchResponse,
  type ToneType,
  type LengthType,
  type CreatorData,
  type BrandData,
} from "@/lib/ai/pitch-prompts";

interface UsePitchGenerationOptions {
  creator: CreatorData | null;
  brand: BrandData | null;
}

export function usePitchGeneration({ creator, brand }: UsePitchGenerationOptions) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");
  const [length, setLength] = useState<LengthType>("medium");
  const [customPoints, setCustomPoints] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { complete, isLoading } = useCompletion({
    api: "/api/pitch/generate",
    onFinish: (prompt, completion) => {
      const parsed = parsePitchResponse(completion);
      if (parsed) {
        setSubject(parsed.subject);
        setBody(parsed.body);
        setError(null);
      } else {
        setError("Failed to parse AI response. Please try again.");
      }
    },
    onError: (err) => {
      setError(err.message || "Failed to generate pitch");
    },
  });

  const generate = useCallback(async () => {
    if (!creator || !brand) {
      setError("Creator and brand data are required");
      return;
    }

    setError(null);
    setSubject("");
    setBody("");

    await complete("", {
      body: {
        creator,
        brand,
        tone,
        length,
        customPoints: customPoints.filter((p) => p.trim().length > 0),
      },
    });
  }, [creator, brand, tone, length, customPoints, complete]);

  const addCustomPoint = useCallback((point: string) => {
    if (point.trim() && customPoints.length < 5) {
      setCustomPoints((prev) => [...prev, point.trim()]);
    }
  }, [customPoints.length]);

  const removeCustomPoint = useCallback((index: number) => {
    setCustomPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setSubject("");
    setBody("");
    setTone("professional");
    setLength("medium");
    setCustomPoints([]);
    setError(null);
  }, []);

  return {
    subject,
    setSubject,
    body,
    setBody,
    tone,
    setTone,
    length,
    setLength,
    customPoints,
    addCustomPoint,
    removeCustomPoint,
    generate,
    isGenerating: isLoading,
    error,
    reset,
  };
}
