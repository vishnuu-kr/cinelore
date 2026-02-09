
import { Theory } from "../types";

export async function fetchRedditTheories(showTitle: string, limit: number = 25, season?: number, episode?: number, type?: string): Promise<Theory[]> {
  // Create a base query that is more flexible
  const cleanTitle = showTitle.replace(/^(The\s|A\s|An\s)/i, '').trim();
  const variations = [
    `"${showTitle}"`,
    `"${cleanTitle}"`
  ];

  // For Manga and Anime, we broaden the search to the entire site or specific subreddits 
  let subredditRestriction = 'subreddit:FanTheories';
  if (type === 'manga' || type === 'anime') {
    subredditRestriction = ''; // Search all of Reddit, rely on title + keywords
  }

  // precise title matching to avoid irrelevant results (e.g. "Severance" appearing in a Harry Potter theory body)
  const query = `title:${cleanTitle} ${subredditRestriction} (theory OR analysis OR discussion) self:yes`;

  // Use local proxy to bypass CORS
  // If searching globally (manga/anime), we use the general search endpoint and disable subreddit restriction
  const isGlobalSearch = type === 'manga' || type === 'anime';
  const endpoint = isGlobalSearch ? '/reddit-proxy/search.json' : '/reddit-proxy/r/FanTheories/search.json';
  const restrictSr = isGlobalSearch ? 'off' : 'on';

  const url = `${endpoint}?q=${encodeURIComponent(query)}&restrict_sr=${restrictSr}&sort=relevance&limit=${limit}&t=all&raw_json=1`;

  console.log(`[FTF] Fetching Reddit Intel (via Proxy): ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[FTF] Reddit Proxy Error: ${response.status} ${response.statusText}`);
      throw new Error(`Reddit API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[FTF] Reddit Response:`, data);

    if (!data.data || !data.data.children || data.data.children.length === 0) {
      console.warn("[FTF] No theories found for query:", query);
      return [];
    }

    return data.data.children.map((child: any) => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        author: post.author,
        content: post.selftext || "No content available.",
        url: `https://reddit.com${post.permalink}`,
        upvotes: post.ups,
        downvotes: post.downs || 0,
        isRead: false,
        season: season || 0,
        episode: episode || 0
      };
    });
  } catch (error) {
    console.error("[FTF] Reddit Fetch Failed:", error);
    return [];
  }
}

export async function fetchHotTheories(): Promise<Theory[]> {
  const url = `/reddit-proxy/r/FanTheories/hot.json?limit=15&raw_json=1`;
  try {
    console.log("[FTF] Fetching Hot Theories (via Proxy)...");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Hot fetch failed");

    const data = await response.json();
    return data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      content: child.data.selftext || "",
      url: `https://reddit.com${child.data.permalink}`,
      upvotes: child.data.ups,
      isRead: false
    }));
  } catch (e) {
    console.error("[FTF] Hot fetch error:", e);
    return [];
  }
}
