import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Search, Sparkles, X, Send, User } from 'lucide-react';
import { askLoreAssistant, ChatMessage } from '../../services/loreService';
import { Theory } from '../../types';

interface LoreAssistantProps {
    showTitle: string;
    focusedTheory?: Theory | null;
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isTyping?: boolean;
}

const LoreAssistant: React.FC<LoreAssistantProps> = ({ showTitle, focusedTheory, isOpen, onClose, onOpen }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Greeting & Reset
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'init',
                role: 'model',
                text: `Connected to ${showTitle} Intelligence Database. I am ready to analyze theories and cross-reference canon.`
            }]);
        }
    }, [isOpen, showTitle]);

    // Handle Focused Theory
    useEffect(() => {
        if (focusedTheory && isOpen) {
            const theoryMsg = `Analysis Request: "${focusedTheory.title}"`;
            setQuery(theoryMsg);
            // Optional: Auto-send or just prepopulate? Let's prepopulate for user confirmation.
        }
    }, [focusedTheory, isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAsk = async () => {
        if (!query.trim()) return;

        const userMsgText = query;
        const tempId = Date.now().toString();

        // Add User Message
        const userMsg: Message = { id: tempId, role: 'user', text: userMsgText };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsLoading(true);

        try {
            // Call AI with History
            const result = await askLoreAssistant(
                showTitle,
                userMsgText,
                focusedTheory ? { title: focusedTheory.title, content: focusedTheory.content } : undefined,
                chatHistory
            );

            // Add AI Message
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: result.answer };
            setMessages(prev => [...prev, aiMsg]);

            // Update History for next turn
            setChatHistory(prev => [
                ...prev,
                { role: 'user', parts: [{ text: userMsgText }] },
                { role: 'model', parts: [{ text: result.answer }] }
            ]);

        } catch (error) {
            console.error('Lore Chat Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: 'Connection disrupted. Unable to retrieve intelligence.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Assistant Trigger */}
            <button
                onClick={onOpen}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 shadow-2xl ${isOpen
                    ? 'bg-slate-800 text-white shadow-red-500/10'
                    : 'bg-[#1A1F2B] text-slate-200 hover:bg-slate-800'
                    }`}
            >
                <Bot className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Lore Assistant</span>
            </button>

            {/* Chat Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-4 right-0 w-[calc(100vw-2rem)] md:w-[32rem] h-[500px] md:h-[600px] bg-[#111111] border-2 border-slate-700 rounded-2xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] z-[500] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#111111] z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">CineLore Oracle</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Online // V4.2</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'model' ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-800 border border-slate-700'
                                        }`}>
                                        {msg.role === 'model' ? <Bot className="w-4 h-4 text-red-500" /> : <User className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'model'
                                        ? 'bg-white/5 text-slate-300 border border-white/5'
                                        : 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-slate-500 text-xs ml-12">
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75" />
                                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150" />
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#0B0C10] border-t border-white/5">
                            {focusedTheory && (
                                <div className="mb-3 px-3 py-2 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] uppercase font-bold text-red-400 truncate max-w-48">Context: {focusedTheory.title}</span>
                                    <button onClick={() => setQuery('')} className="ml-auto text-red-400 hover:text-white"><X className="w-3 h-3" /></button>
                                </div>
                            )}
                            <div className="relative flex items-center gap-2">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAsk();
                                            }
                                        }}
                                        placeholder="Transmit inquiry to orbital database..."
                                        className="w-full bg-[#1A1F2B] text-white text-sm rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-1 focus:ring-red-500/50 border border-white/5 placeholder:text-slate-600 font-medium"
                                        disabled={isLoading}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-black/40 rounded text-[9px] font-bold text-slate-500 border border-white/5">
                                            <span>CMD</span><span>+</span><span>ENTER</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAsk}
                                    disabled={!query.trim() || isLoading}
                                    className="p-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoreAssistant;
