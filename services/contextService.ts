import { Theory } from "../types";

interface ContextProfile {
    showTitle: string;
    keywords: string[]; // Characters, Actors, Themes
}

export const contextService = {
    /**
     * Calculates a "Relevance Score" (0-100) for a theory based on the show's context profile.
     * Prevents cross-contamination (e.g. Fantastic Four theories in Doomsday).
     */
    validateRelevance: (theory: Theory, profile: ContextProfile): { score: number; flags: string[] } => {
        const content = (theory.title + " " + theory.content).toLowerCase();
        const flags: string[] = [];
        let score = 0;

        // 1. Title Match (High Confidence)
        // We normalize title to handle colons/subtitles broadly.
        // USE STRICT REGEX for title match to avoid "Dark vs darker"
        const normalizedShowTitle = profile.showTitle.toLowerCase().replace(/:/g, '').trim();
        const escapedTitle = normalizedShowTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const titleRegex = new RegExp(`\\b${escapedTitle}\\b`, 'i');

        if (titleRegex.test(content)) {
            // Keep strong score for title match
            score += 60;
            flags.push("Matches Show Title");
        }

        // Remove loose TV Context Boost as it causes leakage for short titles.

        // 2. Keyword/Character Match
        // We look for characters (e.g. "Reed Richards", "Doom")
        let matchCount = 0;
        const uniqueMatches = new Set<string>();
        // Blacklist common words that might appear in credits or keywords but are too generic
        const blacklist = new Set(["the", "man", "woman", "boy", "girl", "self", "other", "hero", "villain", "voice", "uncredited", "himself", "herself", "action", "comedy", "drama"]);

        profile.keywords.forEach(keyword => {
            const k = keyword.toLowerCase().trim();
            // Skip blacklisted or too short keywords
            if (k.length <= 3 || blacklist.has(k)) return;

            // Use Word Boundary Regex for exact word/phrase match
            // Escape special regex chars in keyword
            const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedK}\\b`, 'i');

            if (regex.test(content)) {
                matchCount++;
                uniqueMatches.add(k);
            }
        });

        if (matchCount > 0) {
            score += Math.min(matchCount * 15, 45); // Cap at 45 points from keywords
            flags.push(`Matches ${matchCount} Context Keywords`);
        }

        // NEW: Density Bonus (finding multiple UNIQUE characters is stronger evidence)
        if (uniqueMatches.size >= 2) {
            score += 20;
            flags.push("High Entity Density");
        }

        // 3. Exclusion Logic & Quality Control

        // NEW: Length Penalty (Too short = likely spam or low effort)
        // REMOVED: Length Penalty. Short theories can be valid (especially Reddit one-liners or image captions).

        // 4. Fallback for "Same Universe" (MCU)
        // If it's an MCU movie, broader terms like "Marvel" or "MCU" give small points
        const universeTerms = ["marvel", "mcu", "star wars", "jedi", "sith", "dc", "dceu"];
        const foundUniverse = universeTerms.find(t => content.includes(t) && profile.keywords.some(k => k.toLowerCase().includes(t)));
        if (foundUniverse) {
            score += 15;
            flags.push(`Universe Match: ${foundUniverse}`);
        }

        return { score: Math.min(score, 100), flags };
    }
};
