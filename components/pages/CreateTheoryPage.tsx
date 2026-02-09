import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockForumService } from '../../services/mockForumService';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import LoreAssistant from '../lore/LoreAssistant';

const CreateTheoryPage: React.FC = () => {
    // We might accept showId via params or search
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!user) {
            setError("You must be logged in to post.");
            setLoading(false);
            return;
        }

        try {
            await mockForumService.createTheory({
                title,
                content,
                user_id: user.id,
                community_id: id,
                show_title: "Unknown", // Ideally we fetch this details, irrelevant for mock
                author: user, // Pass full user object for mock display
                is_published: true, // Default to published
            });

            // If we reached here, success
            // if (error) throw new Error(error);

            navigate(-1); // Go back
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 container mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-slate-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-md relative"
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-white">Propagate Theory</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-slate-400 text-xs uppercase tracking-widest font-bold">Hypothesis Title</label>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!title && !content) return;
                                    setLoading(true);
                                    try {
                                        const { enhanceTheory } = await import('../../services/loreService');
                                        const result = await enhanceTheory(id || 'Unknown', title, content);
                                        setTitle(result.title);
                                        setContent(result.content);
                                    } catch (e) {
                                        console.error(e);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                disabled={loading}
                                className="flex items-center gap-2 text-[10px] uppercase font-bold text-red-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <LoreAssistant showTitle={id || 'Show'} currentTheoryContent={content} />
                                {/* Hidden LoreAssistant for the button usage, we will replace this with a direct button */}
                            </button>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                            placeholder="e.g., The outcome was determined from the start..."
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-slate-400 text-xs uppercase tracking-widest font-bold">Evidence & Analysis</label>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!content) return;
                                    setLoading(true);
                                    try {
                                        const { enhanceTheory } = await import('../../services/loreService');
                                        const result = await enhanceTheory(id || 'Unknown', title, content);
                                        setTitle(result.title);
                                        setContent(result.content);
                                    } catch (e) {
                                        console.error(e);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                                disabled={loading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                AI Enhance
                            </button>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-64 bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                            placeholder="Detailed breakdown..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-sm"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all transform hover:scale-105"
                        >
                            {loading ? 'Transmitting...' : 'Pubish Theory'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateTheoryPage;

