
import { Show } from '../types';

const MANGADEX_API_BASE = 'https://api.mangadex.org';
const MANGADEX_COVER_BASE = 'https://uploads.mangadex.org/covers';


export async function getTrendingManga(): Promise<Show[]> {
    try {
        const response = await fetch(`${MANGADEX_API_BASE}/manga?limit=20&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive`);
        if (!response.ok) return [];

        const data = await response.json();
        return data.data.map((manga: any) => {
            const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
            const fileName = coverRel?.attributes?.fileName;
            const posterPath = fileName
                ? `${MANGADEX_COVER_BASE}/${manga.id}/${fileName}`
                : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200";

            return {
                id: manga.id,
                title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
                type: 'manga',
                posterPath: posterPath,
                backdropPath: posterPath,
                overview: manga.attributes.description.en || "No description available.",
                themeColor: `hsl(${manga.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 360}, 75%, 65%)`,
                seasons: []
            };
        });
    } catch (err) {
        console.error("MangaDex Trending Error:", err);
        return [];
    }
}

export async function getPopularManga(page: number = 1): Promise<Show[]> {
    try {
        const limit = 20;
        const offset = (page - 1) * limit;
        const response = await fetch(`${MANGADEX_API_BASE}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive`);
        if (!response.ok) return [];

        const data = await response.json();
        return data.data.map((manga: any) => {
            const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
            const fileName = coverRel?.attributes?.fileName;
            const posterPath = fileName
                ? `${MANGADEX_COVER_BASE}/${manga.id}/${fileName}`
                : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200";

            return {
                id: manga.id,
                title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
                type: 'manga',
                posterPath: posterPath,
                backdropPath: posterPath,
                overview: manga.attributes.description.en || "No description available.",
                themeColor: `hsl(${manga.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 360}, 75%, 65%)`,
                seasons: []
            };
        });
    } catch (err) {
        console.error("MangaDex Popular Error:", err);
        return [];
    }
}

export async function searchManga(query: string): Promise<Show[]> {
    try {
        // We include 'cover_art' to get the cover relation in the search results
        const response = await fetch(`${MANGADEX_API_BASE}/manga?title=${encodeURIComponent(query)}&limit=10&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`);
        if (!response.ok) return [];

        const data = await response.json();
        return data.data.map((manga: any) => {
            const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
            const fileName = coverRel?.attributes?.fileName;
            const posterPath = fileName
                ? `${MANGADEX_COVER_BASE}/${manga.id}/${fileName}` // Original quality
                : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=200";

            return {
                id: manga.id,
                title: manga.attributes.title.en || manga.attributes.title[Object.keys(manga.attributes.title)[0]],
                type: 'manga',
                posterPath: posterPath,
                backdropPath: posterPath, // Uses cover as backdrop
                overview: manga.attributes.description.en || "No description available.",
                themeColor: `hsl(${manga.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 360}, 75%, 65%)`,
                seasons: [],
                voteAverage: 0 // MangaDex doesn't provide a simple score in this endpoint
            };
        });
    } catch (err) {
        console.error("MangaDex Search Error:", err);
        return [];
    }
}

export async function getMangaDetails(id: string): Promise<Show | null> {
    try {
        const response = await fetch(`${MANGADEX_API_BASE}/manga/${id}?includes[]=cover_art`);
        if (!response.ok) return null;

        const { data: manga } = await response.json();
        const coverRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');
        const fileName = coverRel?.attributes?.fileName;
        const posterPath = fileName
            ? `${MANGADEX_COVER_BASE}/${manga.id}/${fileName}`
            : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500";

        return {
            id: manga.id,
            title: manga.attributes.title.en || manga.attributes.title[Object.keys(manga.attributes.title)[0]],
            type: 'manga',
            posterPath: posterPath,
            backdropPath: posterPath,
            overview: manga.attributes.description.en || "No description available.",
            themeColor: `hsl(${manga.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 360}, 75%, 65%)`,
            seasons: []
        };
    } catch (err) {
        console.error("MangaDex Details Error:", err);
        return null;
    }
}
