import { Theory, Comment } from '../types';

// Mock data for trending theories with diverse content
const mockTheories: Theory[] = [
    {
        id: '1',
        title: 'Severance: The Goats Are Not What You Think',
        content: 'The baby goats in the break room aren\'t random. They represent the "kids" (Egan offspring) being raised in a controlled environment. The numbers being refined are actually sorting emotional states of these clones.',
        show_id: '95396',
        show_title: 'Severance',
        show_type: 'tv',
        user_id: 'user_lumon',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        upvotes: 842,
        downvotes: 12,
        comments_count: 87,
        image_url: 'https://image.tmdb.org/t/p/original/sJHA1IBLEhMpkSTLCWj5iOmvyjn.jpg',
        is_published: true,
        author: {
            id: 'user_lumon',
            username: 'KierEganFan',
            created_at: new Date().toISOString()
        }
    },
    {
        id: '2',
        title: 'Dark: The Original World Was Also a Loop',
        content: 'Even the "Origin World" we see at the end is part of a larger super-determinism cycle. H.G. Tannhaus creating the machine was inevitable because the desire to save his family is a universal constant across all realities.',
        show_id: '70523',
        show_title: 'Dark',
        show_type: 'tv',
        user_id: 'user_sicmundus',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        upvotes: 1205,
        downvotes: 45,
        comments_count: 312,
        image_url: 'https://image.tmdb.org/t/p/original/75HgaphatW0PDI3XIHQWZUpbhn6.jpg',
        is_published: true,
        author: {
            id: 'user_sicmundus',
            username: 'AdamDidNothingWrong',
            created_at: new Date().toISOString()
        }
    },
    {
        id: '3',
        title: 'One Piece: The Red Line is a Dam',
        content: 'The ultimate goal is to destroy the Red Line using the Ancient Weapons. This will merge all four seas into the "All Blue" and physically unite the world (One Piece). The Fishmen will then live on the surface under the sun.',
        show_id: '37854',
        show_title: 'One Piece',
        show_type: 'anime',
        user_id: 'user_joyboy',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        upvotes: 2100,
        downvotes: 15,
        comments_count: 560,
        image_url: 'https://image.tmdb.org/t/p/original/oVfucXvhutTpYExG9k06NJqnpT9.jpg',
        is_published: true,
        author: {
            id: 'user_joyboy',
            username: 'JoyBoyReturned',
            created_at: new Date().toISOString()
        }
    },
    {
        id: '4',
        title: 'Matrix: Zion is Another Matrix',
        content: 'The "Real World" (Zion) is just a second layer of simulation designed for the 1% of humans who reject the first program. Neo\'s powers working in the "Real World" (stopping sentinels) confirms this—he is just accessing higher-level admin privileges.',
        show_id: '603',
        show_title: 'The Matrix',
        show_type: 'movie',
        user_id: 'user_neo',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        upvotes: 3400,
        downvotes: 120,
        comments_count: 890,
        image_url: 'https://image.tmdb.org/t/p/original/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg',
        is_published: true,
        author: {
            id: 'user_neo',
            username: 'RedPillBluePill',
            created_at: new Date().toISOString()
        }
    },
    {
        id: '5',
        title: 'Stranger Things: The Upside Down is Stuck in 1983',
        content: 'The Upside Down is frozen on the day Will went missing because that\'s when Eleven opened the gate. It\'s a psychic snapshot of Hawkins at that exact moment, preserved forever in the hive mind dimension.',
        show_id: '66732',
        show_title: 'Stranger Things',
        show_type: 'tv',
        user_id: 'user_eleven',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        upvotes: 1800,
        downvotes: 32,
        comments_count: 420,
        image_url: 'https://image.tmdb.org/t/p/original/8zbAoryWbtH0DKdev8abFAjdufy.jpg',
        is_published: true,
        author: {
            id: 'user_eleven',
            username: 'EggosLover',
            created_at: new Date().toISOString()
        }
    },
    {
        id: '6',
        title: 'Interstellar: LOVE is a Fifth Dimensional Force',
        content: 'Brand was right. Love isn\'t just an emotion, it\'s an observable, quantifiable force like gravity that can transcend dimensions. It was the only force that could guide Cooper through the tesseract to the exact moment he needed.',
        show_id: '157336',
        show_title: 'Interstellar',
        show_type: 'movie',
        user_id: 'user_cooper',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        upvotes: 2500,
        downvotes: 50,
        comments_count: 600,
        image_url: 'https://image.tmdb.org/t/p/original/5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg',
        is_published: true,
        author: {
            id: 'user_cooper',
            username: 'GhostInTheBookshelf',
            created_at: new Date().toISOString()
        }
    },
    // MANGA THEORIES
    {
        id: '7',
        title: 'Solo Leveling: The Monarchs Are Just System Admins',
        content: 'The entire system Jin-Woo uses is just a debug mode left by the Architect. The Monarchs and Rulers are essentially server admins fighting over root access to Earth\'s mana core.',
        show_id: '32d76d19-8a05-4db0-9c2d-8bb1e1ece696',
        show_title: 'Na Honjaman Level-Up',
        show_type: 'manga',
        user_id: 'user_shadow',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        upvotes: 3500,
        downvotes: 42,
        comments_count: 512,
        image_url: 'https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9c2d-8bb1e1ece696/89b66324-d61b-00b5-206f-5b8b22be696a.jpg',
        is_published: true,
        author: {
            id: 'user_shadow',
            username: 'SungJinWooFan',
            created_at: new Date().toISOString()
        }
    },
    {
        id: '8',
        title: 'Chainsaw Man: Poochita is the Death Devil',
        content: 'The reason Chainsaw Man can erase concepts is because he is the Death Devil\'s "scythe". Fear of chainsaws is minor, but fear of death is primal. He consumes the concept, killing it properly.',
        show_id: 'a77742b1-05fb-4390-92f4-620bcd8de267',
        show_title: 'Chainsaw Man',
        show_type: 'manga',
        user_id: 'user_denji',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        upvotes: 2800,
        downvotes: 156,
        comments_count: 401,
        image_url: 'https://uploads.mangadex.org/covers/a77742b1-05fb-4390-92f4-620bcd8de267/4a675e2f-2d6f-45c1-968e-5783c56360c7.jpg',
        is_published: true,
        author: {
            id: 'user_denji',
            username: 'MakimaSimp',
            created_at: new Date().toISOString()
        }
    },
    {
        id: '9',
        title: 'Berserk: The God Hand Wants to Die',
        content: 'Griffith and the God Hand are trapped in causality. Their ultimate goal isn\'t dominance, but to create a scenario where Guts (the struggler) can actually kill them and end their eternal boredom.',
        show_id: '801513ba-a712-498c-8f57-cae55b38cc92',
        show_title: 'Berserk',
        show_type: 'manga',
        user_id: 'user_guts',
        community_id: 'community1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        upvotes: 5000,
        downvotes: 21,
        comments_count: 1200,
        image_url: 'https://uploads.mangadex.org/covers/801513ba-a712-498c-8f57-cae55b38cc92/2a5df230-6759-4672-8874-9f2db3a0544f.jpg',
        is_published: true,
        author: {
            id: 'user_guts',
            username: 'BlackSwordsman',
            created_at: new Date().toISOString()
        }
    }
];

const mockVotes = new Map<string, Map<string, number>>(); // theoryId -> userId -> vote (-1, 0, 1)
const mockComments = new Map<string, Comment[]>();

class MockForumService {
    async getTrendingTheories(limit: number = 10): Promise<Theory[]> {
        return mockTheories.slice(0, limit);
    }

    async getTheories(showTitle: string): Promise<Theory[]> {
        return mockTheories.filter(t => t.show_title === showTitle);
    }

    async getTheoryById(id: string): Promise<Theory | null> {
        return mockTheories.find(t => t.id === id) || null;
    }

    async getUserVotes(userId: string): Promise<Map<string, number>> {
        return mockVotes.get(userId) || new Map();
    }

    // Authentication Methods
    async login(email: string): Promise<{ user: any | null; error: string | null }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (email.includes('@')) {
            const user = {
                id: 'current-user',
                username: email.split('@')[0],
                email: email,
                avatar_url: `https://www.google.com/s2/favicons?domain=${email.split('@')[1]}`,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { user, error: null };
        }
        return { user: null, error: 'Invalid email format' };
    }

    async signup(email: string, username: string): Promise<{ user: any | null; error: string | null }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (email.includes('@')) {
            const user = {
                id: 'new-user-' + Date.now(),
                username: username,
                email: email,
                avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { user, error: null };
        }
        return { user: null, error: 'Invalid email format' };
    }

    async logout(): Promise<void> {
        localStorage.removeItem('currentUser');
    }

    async getCurrentUser(): Promise<any | null> {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    }

    async voteTheory(theoryId: string, userId: string, vote: number): Promise<void> {
        if (!mockVotes.has(userId)) {
            mockVotes.set(userId, new Map());
        }
        const userVotes = mockVotes.get(userId)!;
        const currentVote = userVotes.get(theoryId) || 0;
        userVotes.set(theoryId, vote);

        const theory = mockTheories.find(t => t.id === theoryId);
        if (theory) {
            // Remove old vote
            if (currentVote > 0) theory.upvotes--;
            else if (currentVote < 0) theory.downvotes--;

            // Add new vote
            if (vote > 0) theory.upvotes++;
            else if (vote < 0) theory.downvotes++;
        }
    }

    async getComments(theoryId: string): Promise<Comment[]> {
        return mockComments.get(theoryId) || [];
    }

    async addComment(comment: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> {
        const newComment: Comment = {
            ...comment,
            id: Date.now().toString(),
            created_at: new Date().toISOString()
        };

        if (!mockComments.has(comment.theory_id)) {
            mockComments.set(comment.theory_id, []);
        }
        mockComments.get(comment.theory_id)!.push(newComment);

        const theory = mockTheories.find(t => t.id === comment.theory_id);
        if (theory && theory.comments_count !== undefined) {
            theory.comments_count++;
        }

        return newComment;
    }

    async createTheory(theory: Omit<Theory, 'id' | 'created_at' | 'upvotes' | 'downvotes' | 'comments_count'>): Promise<Theory> {
        const newTheory: Theory = {
            ...theory,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
            comments_count: 0
        };
        mockTheories.unshift(newTheory);
        return newTheory;
    }

    async addEnhancement(theoryId: string, content: string, userId: string): Promise<{ data: any }> {
        // Mock enhancement object
        const enhancement = {
            id: Date.now().toString(),
            theory_id: theoryId,
            content: content,
            author_name: 'Current Agent', // Mock user name
            user_id: userId,
            created_at: new Date().toISOString(),
            upvotes: 0
        };

        // In a real app, we would push this to a DB. 
        // For now, we return it so the UI can update local state.
        return { data: enhancement };
    }
    async updateProfile(userId: string, updates: Partial<any>): Promise<any> {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            const user = JSON.parse(stored);
            if (user.id === userId || userId === 'current-user') { // Mock logic loose on ID
                const updatedUser = { ...user, ...updates };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                return updatedUser;
            }
        }
        throw new Error("User not found");
    }

    async getUserTheories(userId: string): Promise<Theory[]> {
        // For mock purposes, if userId matches current user's mock ID (often 'current-user' or the one from login), return those.
        // Also simulate finding theories by author.id
        return mockTheories.filter(t => t.user_id === userId || (t.author && t.author.id === userId));
    }
}

export const mockForumService = new MockForumService();
