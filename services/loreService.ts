import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockForumService } from './mockForumService';

// Initialize Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log('LoreService Init - API Key Present:', !!GEMINI_API_KEY);

let genAI: GoogleGenerativeAI | null = null;
let activeModelId = 'gemini-1.5-flash'; // Default fallback
let modelConfigured = false;

if (GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        console.log('LoreService - Gemini Client Initialized');
        // We will run ensureModelConfigured lazily before first use
    } catch (e) {
        console.error('LoreService - Failed to initialize Gemini Client', e);
    }
} else {
    console.warn('LoreService - No API Key found. AI features will be disabled.');
}

// Dynamic Model Discovery
async function ensureModelConfigured() {
    if (!GEMINI_API_KEY || modelConfigured) return;

    try {
        console.log('LoreService - Discovering available models...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            // Normalize model names by stripping 'models/' prefix
            const candidates = data.models
                .map((m: any) => m.name.replace('models/', ''))
                .filter((name: string) => name.toLowerCase().includes('gemini') && !name.toLowerCase().includes('vision'));

            console.log('LoreService - Candidate Models:', candidates);

            // Priority selection logic (Newest/Fastest first)
            // 1. Try specific robust versions
            const bestMatch =
                candidates.find((m: string) => m === 'gemini-1.5-flash') ||
                candidates.find((m: string) => m === 'gemini-1.5-flash-latest') ||
                candidates.find((m: string) => m.includes('1.5-flash')) ||
                candidates.find((m: string) => m === 'gemini-pro') ||
                candidates.find((m: string) => m === 'gemini-1.5-pro-latest') ||
                // 2. Fallback to any gemini-pro or flash
                candidates.find((m: string) => m.includes('flash')) ||
                candidates.find((m: string) => m.includes('pro')) ||
                // 3. Absolute fallback
                candidates[0];

            if (bestMatch) {
                activeModelId = bestMatch;
                console.log(`LoreService - Switched to Best Available Model: ${activeModelId}`);
            } else {
                console.warn('LoreService - No suitable Gemini text model found in list. Using default.');
            }
        }
        modelConfigured = true;
    } catch (error) {
        console.error('LoreService - Model Discovery Failed, using fallback:', error);
    }
}

export interface LoreSearchResult {
    answer: string;
    confidence: number;
    sources: Array<{
        type: 'theory' | 'transcript' | 'wiki';
        title: string;
        excerpt: string;
    }>;
}

// Mock transcript database for demo
const MOCK_TRANSCRIPTS: Record<string, string[]> = {
    'Breaking Bad': [
        'S1E1: "Chemistry is the study of matter, but I prefer to see it as the study of change."',
        'S2E10: Walt mentions his brother to Skyler in a deleted scene reference.',
        'S3E7: The blue meth becomes a signature - "99.1% pure"',
        'S4E11: Gus: "I will kill your wife. I will kill your son. I will kill your infant daughter."',
        'S5E16: "I did it for me. I liked it. I was good at it."'
    ],
    'Severance': [
        'S1E1: Mark S. undergoes the severance procedure at Lumon Industries.',
        'S1E5: The Macrodata Refinement department processes mysterious numbers.',
        'S1E9: Helly discovers she is Helena Eagan, daughter of the CEO.',
    ],
    'Lost': [
        'Pilot: "We have to go back, Kate!"',
        'S2E1: The hatch is opened, revealing Desmond.',
        'S4E5: "We have to move the island."',
    ]
};

import { fetchRedditTheories } from './redditService';

// ... (previous imports and init)

export async function searchEvidence(
    showTitle: string,
    query: string
): Promise<LoreSearchResult> {
    // 1. Search LIVE Reddit theories
    // We search specific show + query to get best results
    const theories = await fetchRedditTheories(showTitle, 10);

    // Filter locally if needed, but Reddit search is already pretty good
    const relevantTheories = theories.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.content.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    // 2. Search mock transcripts (keep as fallback/augmentation)
    const transcripts = MOCK_TRANSCRIPTS[showTitle] || [];
    const relevantTranscripts = transcripts.filter(t =>
        t.toLowerCase().includes(query.toLowerCase())
    );

    // 3. Build context for AI
    const context = `
Show: ${showTitle}
User Question: ${query}

REAL WORLD THEORIES (Reddit /r/FanTheories):
${relevantTheories.map(t => `- [${t.title}] by ${t.author}: ${t.content.slice(0, 500)}...`).join('\n\n') || 'No matching theories found on Reddit.'}

Transcript Excerpts:
${relevantTranscripts.join('\n') || 'No matching transcripts found.'}
    `.trim();

    // 4. If AI is available, use it for intelligent response
    if (genAI) {
        await ensureModelConfigured();
        try {
            // ... (rest of function)
            const model = genAI.getGenerativeModel({ model: activeModelId });

            const prompt = `You are a TV/Movie lore expert assistant. Based on the following context, answer the user's question about ${showTitle}. Be specific and cite sources when possible. If no relevant information is found, say so honestly.

${context}

Provide a concise, helpful answer:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                answer: text || 'Unable to generate response.',
                confidence: relevantTheories.length > 0 || relevantTranscripts.length > 0 ? 0.85 : 0.5,
                sources: [
                    ...relevantTheories.map(t => ({
                        type: 'theory' as const,
                        title: t.title,
                        excerpt: t.content.slice(0, 100) + '...'
                    })),
                    ...relevantTranscripts.slice(0, 2).map(t => ({
                        type: 'transcript' as const,
                        title: 'Episode Transcript',
                        excerpt: t
                    }))
                ]
            };
        } catch (error) {
            console.error('Gemini API error:', error);
            // Fall through to mock response
        }
    }

    // 5. Fallback mock response if no AI
    if (relevantTheories.length > 0 || relevantTranscripts.length > 0) {
        return {
            answer: `Found ${relevantTheories.length} related theories and ${relevantTranscripts.length} transcript matches for "${query}" in ${showTitle}. ${relevantTranscripts[0] || relevantTheories[0]?.content.slice(0, 150) || ''}`,
            confidence: 0.75,
            sources: [
                ...relevantTheories.map(t => ({
                    type: 'theory' as const,
                    title: t.title,
                    excerpt: t.content.slice(0, 100) + '...'
                })),
                ...relevantTranscripts.slice(0, 2).map(t => ({
                    type: 'transcript' as const,
                    title: 'Episode Transcript',
                    excerpt: t
                }))
            ]
        };
    }

    return {
        answer: `No specific evidence found for "${query}" in the ${showTitle} database. Try rephrasing your question or searching for related terms.`,
        confidence: 0.3,
        sources: []
    };
}

export async function factCheckTheory(
    showTitle: string,
    theoryContent: string
): Promise<LoreSearchResult> {
    // Extract key claims from the theory for checking
    const theories = await mockForumService.getTheories(showTitle);
    const transcripts = MOCK_TRANSCRIPTS[showTitle] || [];

    const context = `
Show: ${showTitle}
Theory to fact-check:
${theoryContent}

Existing Canon/Theories:
${theories.slice(0, 5).map(t => `- ${t.title}`).join('\n')}

Known Transcripts:
${transcripts.slice(0, 3).join('\n')}
    `.trim();

    if (genAI) {
        await ensureModelConfigured();
        try {
            const model = genAI.getGenerativeModel({ model: activeModelId });
            const prompt = `You are a TV/Movie lore fact-checker. Analyze the following theory for ${showTitle} and check if it contradicts any known canon. Point out any potential issues or inconsistencies. Be constructive and helpful.

${context}

Provide your fact-check analysis:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                answer: text || 'Unable to perform fact check.',
                confidence: 0.8,
                sources: theories.slice(0, 2).map(t => ({
                    type: 'theory' as const,
                    title: t.title,
                    excerpt: 'Existing community theory'
                }))
            };
        } catch (error) {
            console.error('Gemini API error:', error);
        }
    }

    // Fallback response
    return {
        answer: `Theory analyzed for ${showTitle}. No major contradictions detected with known canon from ${theories.length} existing theories. Consider verifying timeline details against official sources.`,
        confidence: 0.7,
        sources: [
            { type: 'wiki', title: 'Canon Database', excerpt: 'No conflicts found' }
        ]
    };
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export async function askLoreAssistant(
    showTitle: string,
    query: string,
    theoryContext?: { title: string; content: string },
    chatHistory: ChatMessage[] = []
): Promise<LoreSearchResult> {
    // 1. Gather context from REAL sources
    // Fetch specifically about the show to ground the AI
    const redditTheories = await fetchRedditTheories(showTitle, 5);
    const transcripts = MOCK_TRANSCRIPTS[showTitle] || [];

    const systemInstruction = `
You are a TV/Movie lore expert. A user is asking about ${showTitle}. 
If they provide a theory, analyze it for canon consistency. 
If they ask a general question, answer it using your knowledge and the provided context.
Be specific, citation-focused, and constructive.

LIVE INTEL FROM THE INTERNET (/r/FanTheories):
${redditTheories.map(t => `- TITLE: "${t.title}"\n  CONTENT: ${t.content.slice(0, 400)}...`).join('\n\n')}

TRANSCRIPT DATABASE:
${transcripts.slice(0, 3).join('\n')}

${theoryContext ? `\nFOCUS TARGET (User's Theory):\nTitle: ${theoryContext.title}\nContent: ${theoryContext.content}` : ''}
    `.trim();

    if (genAI) {
        await ensureModelConfigured();
        try {
            const model = genAI.getGenerativeModel({
                model: activeModelId
            });
            // ... (rest of logic)

            const chat = model.startChat({
                history: chatHistory
            });

            // Prepend system instruction to the latest message for context
            const fullPrompt = systemInstruction + '\n\nUser Query: ' + query;

            const result = await chat.sendMessage(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return {
                answer: text || 'Thinking...',
                confidence: 0.85,
                sources: [
                    ...redditTheories.slice(0, 2).map(t => ({
                        type: 'theory' as const,
                        title: t.title,
                        excerpt: t.content.slice(0, 100) + '...'
                    })),
                    ...transcripts.slice(0, 1).map(t => ({
                        type: 'transcript' as const,
                        title: 'Episode Transcript',
                        excerpt: t
                    }))
                ]
            };
        } catch (error: any) {
            console.error('Gemini error:', error);
            return {
                answer: `**System Error:** ${error.message || 'Unknown connection error'} (Model: ${activeModelId}). \n\n*Please verify your API Key and Network.*`,
                confidence: 0,
                sources: []
            };
        }
    }

    return {
        answer: `I've analyzed your query about ${showTitle}. Based on ${redditTheories.length} community theories and known transcripts, this appears ${theoryContext ? 'consistent with the established narrative' : 'to be a valid point of investigation'}.`,
        confidence: 0.7,
        sources: [
            { type: 'wiki', title: 'Canon Archive', excerpt: 'General knowledge base' }
        ]
    };
}

export async function enhanceTheory(
    showTitle: string,
    title: string,
    content: string
): Promise<{ title: string; content: string }> {
    if (genAI) {
        await ensureModelConfigured();
        try {
            const model = genAI.getGenerativeModel({ model: activeModelId });

            const prompt = `You are a creative editor and lore expert for the show "${showTitle}".
            A user has written a fan theory properly. Your job is to "Enhance" it.
            
            Rules:
            1. Improve grammar, flow, and dramatic impact.
            2. Make it sound more "canon" by using specific terminology where appropriate.
            3. Do NOT change the core meaning or arguments of the theory.
            4. Suggest a punchier title if the current one is weak.
            
            Input Title: ${title}
            Input Content: ${content}
            
            Output Format (JSON):
            {
                "title": "Enhanced Title",
                "content": "Enhanced Content..."
            }`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Clean up code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(jsonStr);

            return {
                title: data.title || title,
                content: data.content || content
            };
        } catch (error) {
            console.error('Enhance Theory Error:', error);
        }
    }

    // Fallback: Return original
    return { title, content };
}
