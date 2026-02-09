
import { searchManga, getMangaDetails } from './services/mangaService.js';

async function verifyMangaDex() {
    console.log("--- Testing MangaDex Search ---");
    const results = await searchManga("Chainsaw Man");
    console.log(`Found ${results.length} results.`);
    if (results.length > 0) {
        const first = results[0];
        console.log(`First Result: ${first.title} (ID: ${first.id})`);
        console.log(`Poster: ${first.posterPath}`);

        console.log("\n--- Testing MangaDex Details ---");
        const details = await getMangaDetails(first.id);
        if (details) {
            console.log(`Details for ${details.title}:`);
            console.log(`Overview: ${details.overview.substring(0, 100)}...`);
            console.log(`Poster: ${details.posterPath}`);
        } else {
            console.log("Failed to fetch details.");
        }
    }
}

verifyMangaDex();
