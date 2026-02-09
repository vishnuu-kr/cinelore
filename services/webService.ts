import { Theory } from '../types.ts';

import { GoogleGenerativeAI } from '@google/generative-ai';

// YouTube Data API v3
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Using Google News RSS proxy
const RSS_API = '/rss-proxy';

// AI-powered "Deep Search" for theories
async function fetchAITheories(query: string, type: string = 'general'): Promise<Theory[]> {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key missing, skipping AI search.');
        return [];
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
        You are a dedicated Archives Officer for the "CineLore" institute.
        Perform a deep data retrieval for fan theories regarding "${query}" (${type}).
        
        Task:
        1. Retrieve 4-5 DISTINCT, high-quality, and specific fan theories found on the internet (Reddit, Forums, YouTube).
        2. For each theory, write a DETAILED, MULTI-PARAGRAPH analysis (approx. 150-250 words each). Do NOT just summarize. Explain the evidence, the logic, and the implications.
        3. Write as if you are a user posting on a forum (passionate, detailed).
        4. Assign a specific source platform (e.g., "r/FanTheories", "Tumblr", "YouTube").

        Output format: JSON Array of objects with keys: 
        - title (catchy, specific)
        - content (the full detailed analysis)
        - source_platform
        - author_name
        
        Strict JSON only.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const theories = JSON.parse(jsonStr);

        return theories.map((t: any) => ({
            id: crypto.randomUUID(),
            title: t.title,
            content: t.content,
            source: 'web',
            url: `https://www.google.com/search?q=${encodeURIComponent(query + ' ' + t.title + ' theory')}`,
            author: {
                id: 'ai-archivist',
                username: `${t.source_platform} Archive`,
                avatar_url: '',
                created_at: new Date().toISOString()
            },
            user_id: 'ai-agent',
            community_id: 'global',
            upvotes: Math.floor(Math.random() * 500) + 50,
            downvotes: 0,
            created_at: new Date().toISOString(),
            show_title: query,
            is_published: true,
            status: 'active'
        }));

    } catch (error) {
        console.error("AI Theory Search Error:", error);
        return [];
    }
}

export async function fetchYoutubeTheories(query: string): Promise<Theory[]> {
    try {
        if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
            console.warn('YouTube API key not configured. Skipping YouTube search.');
            return [];
        }

        const searchUrl = `${YOUTUBE_API}/search?part=snippet&q=${encodeURIComponent(query + " theory")}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            console.error(`YouTube Fetch Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return [];
        }

        return data.items.map((video: any) => ({
            id: video.id.videoId || crypto.randomUUID(),
            title: video.snippet.title,
            content: video.snippet.description || "Video analysis.",
            source: 'youtube',
            video_url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            thumbnail_url: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
            author: {
                id: video.snippet.channelId,
                username: video.snippet.channelTitle,
                avatar_url: '',
                created_at: new Date().toISOString()
            },
            user_id: 'youtube-source',
            community_id: 'global',
            upvotes: 0,
            downvotes: 0,
            created_at: video.snippet.publishedAt,
            show_title: query,
            is_published: true,
            status: 'active'
        }));
    } catch (err) {
        console.error("YouTube Fetch Error:", err);
        return [];
    }
}

export async function fetchWebTheories(query: string): Promise<Theory[]> {
    try {
        const response = await fetch(`${RSS_API}/rss/search?q=${encodeURIComponent(query + " fan theory")}&hl=en-US&gl=US&ceid=US:en`);
        const text = await response.text();

        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const items = Array.from(xml.querySelectorAll("item"));

        return items.slice(0, 10).map(item => {
            const title = item.querySelector("title")?.textContent || "Unknown Article";
            const link = item.querySelector("link")?.textContent || "";
            const pubDate = item.querySelector("pubDate")?.textContent || "";
            const source = item.querySelector("source")?.textContent || "Web";

            // Try to get description, strip HTML tags
            const rawDesc = item.querySelector("description")?.textContent || "";
            const cleanDesc = rawDesc
                .replace(/<[^>]*>?/gm, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&#8217;/g, "'")
                .replace(/&#8220;/g, '"')
                .replace(/&#8221;/g, '"')
                .replace(/&amp;/g, '&')
                .trim();

            return {
                id: crypto.randomUUID(),
                title: title,
                content: cleanDesc.length > 50 ? cleanDesc : `Analysis from ${source}.`,
                source: 'web',
                url: link,
                author: {
                    id: 'web-source',
                    username: source,
                    avatar_url: `https://www.google.com/s2/favicons?domain=${new URL(link).hostname}`,
                    created_at: new Date().toISOString()
                },
                user_id: 'web-source',
                community_id: 'global',
                upvotes: 0,
                downvotes: 0,
                created_at: pubDate,
                show_title: query,
                is_published: true,
                status: 'active'
            };
        });
    } catch (err) {
        console.error("Web Fetch Error:", err);
        return [];
    }
}

export async function fetchFullArticleContent(url: string): Promise<string | null> {
    try {
        // Use the Jina Reader API via our local proxy
        const targetUrl = `/reader-proxy/${encodeURIComponent(url)}`;
        const response = await fetch(targetUrl);

        if (!response.ok) {
            console.error(`Reader API Error: ${response.status}`);
            return null;
        }

        const text = await response.text();
        return text;
    } catch (error) {
        console.error("Failed to fetch full article:", error);
        return null;
    }
}

export async function fetchUniversalTheories(query: string, type: string = 'media'): Promise<Theory[]> {
    const [videos, articles, aiTheories] = await Promise.all([
        fetchYoutubeTheories(query),
        fetchWebTheories(query),
        fetchAITheories(query, type)
    ]);

    // AI Expansion for Articles: If article content is too short, ask AI to elaborate slightly
    // (Skipping for now to avoid latency, but the updated AI theories will key the experience)

    return [...aiTheories, ...videos, ...articles];
}
