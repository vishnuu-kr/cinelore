
import React, { useState, useEffect } from 'react';
import { mockForumService } from '../../services/mockForumService';
import { useAuth } from '../AuthContext';
import { Comment } from '../../types';
import { Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
    theoryId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ theoryId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = React.useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [theoryId]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const fetchComments = async () => {
        const data = await mockForumService.getComments(theoryId);
        setComments(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        setLoading(true);
        try {
            const addedComment = await mockForumService.addComment({
                theory_id: theoryId,
                user_id: user.id || 'guest',
                content: newComment,
                author: user,
                upvotes: 0
            });

            if (addedComment) {
                setNewComment('');
                fetchComments();
            }
        } catch (err) {
            console.error('Error posting comment:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Discourse Stream ({comments.length})
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 && (
                    <div className="text-center py-8 text-slate-600 font-light text-sm italic">
                        No signals detected yet.
                    </div>
                )}
                {comments.map((comment) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={comment.id}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex-1 bg-slate-800/50 rounded-2xl rounded-tl-none p-3 border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-red-400">
                                    {comment.author?.username || 'Unknown Operator'}
                                </span>
                                <span className="text-[10px] text-slate-600">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
                        </div>
                    </motion.div>
                ))}
                <div ref={commentsEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Inject intelligence..." : "Authentication required to comment"}
                    disabled={!user || loading}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={!user || !newComment.trim() || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-red-600 rounded-lg text-white disabled:opacity-0 transition-all hover:bg-red-500 active:scale-95 shadow-lg"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default CommentSection;

