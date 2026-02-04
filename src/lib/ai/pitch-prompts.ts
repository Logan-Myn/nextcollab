export type ToneType = "professional" | "casual" | "enthusiastic";
export type LengthType = "short" | "medium" | "long";

export interface CreatorData {
  username: string;
  followers: number | null;
  engagementRate: string | null;
  niche: string | null;
  bio?: string | null;
}

export interface BrandData {
  name: string;
  instagramUsername: string | null;
  category: string | null;
  niche: string | null;
  typicalCreatorNiches: string[] | null;
  bio: string | null;
  followers: number | null;
  avgCreatorFollowers?: number | null;
  profilePicture?: string | null;
  isVerifiedAccount?: boolean | null;
}

export interface PitchGenerationParams {
  creator: CreatorData;
  brand: BrandData;
  tone: ToneType;
  length: LengthType;
  customPoints?: string[];
}

const WORD_LIMITS: Record<LengthType, number> = {
  short: 50,
  medium: 75,
  long: 100,
};

export function getWordLimit(length: LengthType): number {
  return WORD_LIMITS[length];
}

export function buildSystemPrompt(params: PitchGenerationParams): string {
  const wordLimit = getWordLimit(params.length);

  return `You are an expert pitch writer for Instagram creators seeking brand sponsorships. Write concise, personalized pitches that highlight mutual value.

Guidelines:
- Keep the body under ${wordLimit} words
- Subject line under 60 characters, compelling and specific
- Focus on creator-brand alignment and value proposition
- Reference specific stats when relevant (followers, engagement, niche overlap)
- Use a ${params.tone} tone throughout
- End with a clear, actionable call-to-action
- Be authentic, not salesy or desperate
- Never use generic phrases like "I love your brand" without specific context

IMPORTANT: You must respond with valid JSON in exactly this format:
{
  "subject": "Your subject line here",
  "body": "Your pitch body here"
}`;
}

export function buildUserPrompt(params: PitchGenerationParams): string {
  const { creator, brand, customPoints } = params;

  const creatorInfo = [
    `@${creator.username}`,
    creator.followers ? `${formatNumber(creator.followers)} followers` : null,
    creator.engagementRate ? `${creator.engagementRate}% engagement rate` : null,
    creator.niche ? `Niche: ${creator.niche}` : null,
    creator.bio ? `Bio: ${creator.bio}` : null,
  ].filter(Boolean).join(", ");

  const brandInfo = [
    brand.name,
    brand.instagramUsername ? `@${brand.instagramUsername}` : null,
    brand.category ? `Category: ${brand.category}` : null,
    brand.niche ? `Niche: ${brand.niche}` : null,
    brand.typicalCreatorNiches?.length ? `Partners with: ${brand.typicalCreatorNiches.join(", ")}` : null,
    brand.followers ? `${formatNumber(brand.followers)} followers` : null,
    brand.avgCreatorFollowers ? `Typical partner size: ${formatNumber(brand.avgCreatorFollowers)} followers` : null,
    brand.bio ? `About: ${brand.bio}` : null,
  ].filter(Boolean).join(", ");

  let prompt = `Generate a pitch email for a creator reaching out to a brand.

CREATOR:
${creatorInfo}

BRAND:
${brandInfo}`;

  if (customPoints?.length) {
    prompt += `\n\nKEY TALKING POINTS TO INCLUDE:
${customPoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}`;
  }

  return prompt;
}

export function buildRefineSystemPrompt(): string {
  return `You are an expert pitch writer helping to refine sponsorship pitches for Instagram creators.

When refining pitches:
- Maintain the core message while improving specific aspects
- Keep changes focused on what the user requested
- Preserve any brand/creator-specific details
- Ensure the pitch remains authentic and personalized
- Subject line should stay under 60 characters
- Body should stay under 100 words unless explicitly asked to expand

IMPORTANT: Always respond with valid JSON in exactly this format:
{
  "subject": "Your refined subject line here",
  "body": "Your refined pitch body here"
}`;
}

export function buildRefineUserPrompt(
  currentSubject: string,
  currentBody: string,
  instruction: string
): string {
  return `Current pitch:

SUBJECT: ${currentSubject}

BODY:
${currentBody}

---

Please refine this pitch based on the following instruction:
${instruction}`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export interface PitchResult {
  subject: string;
  body: string;
}

export function parsePitchResponse(text: string): PitchResult | null {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*"subject"[\s\S]*"body"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.subject === "string" && typeof parsed.body === "string") {
        return {
          subject: parsed.subject.trim(),
          body: parsed.body.trim(),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}
