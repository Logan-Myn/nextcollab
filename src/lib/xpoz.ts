const XPOZ_SERVICE_URL = process.env.XPOZ_SERVICE_URL;
const XPOZ_SERVICE_KEY = process.env.XPOZ_SERVICE_KEY;

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
  if (!XPOZ_SERVICE_URL || !XPOZ_SERVICE_KEY) {
    throw new Error("XPOZ_SERVICE_URL or XPOZ_SERVICE_KEY is not configured");
  }

  const res = await fetch(
    `${XPOZ_SERVICE_URL}/profile/${encodeURIComponent(username)}`,
    {
      headers: { "x-api-key": XPOZ_SERVICE_KEY },
      signal: AbortSignal.timeout(30000),
    }
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Xpoz service error (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.data as InstagramProfile;
}
