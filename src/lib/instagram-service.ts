const BACKEND_URL = process.env.BACKEND_URL;
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;

function cleanBioText(bio: string): string {
  return bio
    .replace(/\\n/g, "\n")
    .replace(/\\u[\dA-Fa-f]{4}/g, (match) =>
      String.fromCodePoint(parseInt(match.replace("\\u", ""), 16))
    );
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  profilePicture: string;
  isVerified: boolean;
  engagementRate: number | null;
  niche: string | null;
  recentHashtags: string[];
}

export async function fetchInstagramProfile(
  username: string
): Promise<InstagramProfile | null> {
  if (!BACKEND_URL || !BACKEND_API_KEY) {
    throw new Error("BACKEND_URL or BACKEND_API_KEY is not configured");
  }

  const res = await fetch(
    `${BACKEND_URL}/profile/${encodeURIComponent(username)}`,
    {
      headers: { "x-api-key": BACKEND_API_KEY },
      signal: AbortSignal.timeout(60000), // 60s - backend does profile + posts + analysis
    }
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Backend service error (${res.status}): ${body}`);
  }

  const json = await res.json();
  const profile = json.data as InstagramProfile;
  if (profile.bio) {
    profile.bio = cleanBioText(profile.bio);
  }
  return profile;
}
