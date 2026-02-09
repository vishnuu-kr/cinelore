
import { Show } from "../types";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
export const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";
// ⬇️ PASTE YOUR API KEY BELOW ⬇️
const TMDB_API_KEY = "ef3b466d84aeb49c5d79191aa6638a80";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Simple in-memory cache
const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Real data with valid TMDB poster paths
const THEME_COLORS: Record<string, string> = {
  "1396": "#00FF41", // Breaking Bad (Acid Green)
  "95396": "#0099FF", // Severance (Luminal Blue)
  "4607": "#FFD700", // Lost (Golden Sun)
  "70523": "#FF0000", // Dark (Red Cave)
  "603": "#22B14C", // Matrix (Code Green)
  "27205": "#6C63FF", // Inception (Subconscious Blue)
  "157336": "#FFFFFF", // Interstellar (Void White)
  "62560": "#E31837", // Mr. Robot (Fsociety Red)
  "63247": "#FFA500", // Westworld (Desert Orange)
};

// Real data with valid TMDB poster paths

export function getFullPosterUrl(path: string | null): string {
  if (!path) return "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500"; // Fallback
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${TMDB_IMAGE_BASE}/${path}`;
  return `${TMDB_IMAGE_BASE}${path}`;
}

export function getFullBackdropUrl(path: string | null): string {
  if (!path) return "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1200"; // Fallback
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${TMDB_BACKDROP_BASE}/${path}`;
  return `${TMDB_BACKDROP_BASE}${path}`;
}

async function fetchFromTMDB(endpoint: string) {
  if (!TMDB_API_KEY || (TMDB_API_KEY as string) === "YOUR_TMDB_API_KEY_HERE") {
    console.warn("TMDB API Key missing. Using mock data.");
    return null;
  }

  // Check cache
  const cacheKey = endpoint;
  const cached = apiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }

  try {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}&api_key=${TMDB_API_KEY}`);
    if (!response.ok) throw new Error("TMDB API Error");
    const data = await response.json();

    // Set cache
    apiCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}
function mapResultToShow(item: any, forcedType?: 'movie' | 'tv' | 'anime'): Show {
  const id = item.id.toString();
  // Use forcedType if provided, otherwise trust media_type, otherwise default to 'tv' (risky but existing behavior) — BUT for specific endpoints we must force it.
  const type = forcedType || (item.media_type === 'movie' ? 'movie' : 'tv');

  return {
    id,
    title: item.title || item.name,
    type,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path || item.poster_path,
    overview: item.overview,
    themeColor: THEME_COLORS[id] || `hsl(${[...id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360}, 85%, 65%)`,
    status: item.status,
    seasons: []
  };
}

export async function getTVShowDetails(id: string): Promise<Show | null> {
  // ... existing implementation ...
  const data = await fetchFromTMDB(`/tv/${id}?`);
  if (!data) return null;

  const seasonPromises = data.seasons.map((s: any) =>
    fetchFromTMDB(`/tv/${id}/season/${s.season_number}?`)
  );

  const seasonsData = await Promise.all(seasonPromises);

  return {
    id: data.id.toString(),
    title: data.name,
    type: 'tv',
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path || data.poster_path,
    overview: data.overview,
    status: data.status,
    themeColor: THEME_COLORS[data.id.toString()] || `hsl(${Math.abs(data.id % 360)}, 70%, 60%)`,
    seasons: seasonsData.filter(s => s !== null).map((s: any) => ({
      seasonNumber: s.season_number,
      episodes: s.episodes.map((e: any) => ({
        episodeNumber: e.episode_number,
        title: e.name,
        airDate: e.air_date,
        overview: e.overview,
        theories: []
      }))
    }))
  };
}

export async function getMovieDetails(id: string): Promise<Show | null> {
  const data = await fetchFromTMDB(`/movie/${id}?`);
  if (!data) return null;

  return {
    id: data.id.toString(),
    title: data.title,
    type: 'movie',
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path || data.poster_path,
    overview: data.overview,
    status: data.status,
    themeColor: THEME_COLORS[data.id.toString()] || `hsl(${Math.abs(data.id % 360)}, 70%, 60%)`,
    seasons: []
  };
}

export async function searchShows(query: string, page: number = 1): Promise<{ results: Show[], totalPages: number }> {
  if (!query) return { results: [], totalPages: 0 };

  const data = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);

  if (data && data.results) {
    const results = data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => mapResultToShow(item));
    return { results, totalPages: data.total_pages };
  }

  return { results: [], totalPages: 0 };
}

export async function getShowById(id: string, type: 'movie' | 'tv'): Promise<Show | undefined> {
  // Try real API 
  if (type === 'tv') {
    const details = await getTVShowDetails(id);
    return details || undefined;
  } else {
    const details = await getMovieDetails(id);
    return details || undefined;
  }
}

export async function getTrendingShows(): Promise<Show[]> {
  const data = await fetchFromTMDB(`/trending/all/week?`);
  if (data && data.results) {
    return data.results.map((item: any) => mapResultToShow(item)).slice(0, 12);
  }
  return [];
}

export async function getTrendingAnime(): Promise<Show[]> {
  const data = await fetchFromTMDB(`/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`);
  if (data && data.results) {
    return data.results.map((item: any) => mapResultToShow(item, 'anime')).slice(0, 12);
  }
  return [];
}

export async function getPopularMovies(page: number = 1): Promise<Show[]> {
  const data = await fetchFromTMDB(`/movie/popular?page=${page}`);
  if (data && data.results) {
    return data.results.map((item: any) => mapResultToShow(item, 'movie'));
  }
  return [];
}

export async function getPopularTV(page: number = 1): Promise<Show[]> {
  const data = await fetchFromTMDB(`/tv/popular?page=${page}`);
  if (data && data.results) {
    return data.results.map((item: any) => mapResultToShow(item, 'tv'));
  }
  return [];
}

export async function getUpcomingShows(): Promise<Show[]> {
  const [movieData, tvData] = await Promise.all([
    fetchFromTMDB(`/movie/upcoming?`),
    fetchFromTMDB(`/tv/on_the_air?`)
  ]);

  const movies = movieData?.results.map((item: any) => mapResultToShow(item, 'movie')).slice(0, 6) || [];
  const tv = tvData?.results.map((item: any) => mapResultToShow(item, 'tv')).slice(0, 6) || [];

  return [...movies, ...tv];
}

// ... existing code ...

export async function getShowVideos(id: string, type: 'movie' | 'tv'): Promise<string | null> {
  const data = await fetchFromTMDB(`/${type}/${id}/videos?`);
  if (data && data.results) {
    // Find the first official trailer on YouTube
    const trailer = data.results.find((video: any) =>
      video.site === 'YouTube' &&
      video.type === 'Trailer' &&
      video.official
    );
    // Fallback to any YouTube video if no official trailer
    const video = trailer || data.results.find((v: any) => v.site === 'YouTube');

    return video ? `https://www.youtube.com/watch?v=${video.key}` : null;
  }
  return null;
}

export async function getShowKeywords(id: string, type: 'movie' | 'tv' | 'anime'): Promise<string[]> {
  // Normalize type: Anime is technically TV in TMDB land usually, or strictly mapped before.
  // But if 'anime' is passed here, force it to 'tv' for the API call to avoid 404s.
  const apiType = type === 'movie' ? 'movie' : 'tv';

  // Fetch keywords and credits to build a "Context Profile"
  const [keywordsData, creditsData] = await Promise.all([
    fetchFromTMDB(`/${apiType}/${id}/${apiType === 'tv' ? 'keywords' : 'keywords'}?`),
    fetchFromTMDB(`/${apiType}/${id}/credits?`)
  ]);

  const keywords = apiType === 'movie'
    ? (keywordsData?.keywords?.map((k: any) => k.name).slice(0, 25) || [])
    : (keywordsData?.results?.map((k: any) => k.name).slice(0, 25) || []);

  const cast = creditsData?.cast?.slice(0, 15).map((c: any) => c.character.replace(/ \(voice\)/i, '').trim()) || []; // Full character names, remove (voice) suffix
  const actors = creditsData?.cast?.slice(0, 5).map((c: any) => c.name) || [];

  // Remove generic words if any, but mostly reliant on specific entities
  return [...new Set([...keywords, ...cast, ...actors])];
}
