import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Theory } from '../types';
import { Network, User, MessageSquare, ArrowUp } from 'lucide-react';

interface NarrativeMapProps {
    theories: Theory[];
    onSelectTheory: (theory: Theory) => void;
    showTitle: string;
}

const NarrativeMap: React.FC<NarrativeMapProps> = ({ theories, onSelectTheory, showTitle }) => {
    // Generate random stable positions for nodes
    const nodes = useMemo(() => {
        return theories.slice(0, 15).map((theory, i) => ({
            ...theory,
            x: Math.random() * 80 + 10, // 10% to 90%
            y: Math.random() * 70 + 15, // 15% to 85%
            size: Math.random() * 20 + 40, // 40px to 60px
            delay: Math.random() * 2,
            duration: 3 + Math.random() * 2,
        }));
    }, [theories]);

    // Generate some random connections between nearby nodes
    const connections = useMemo(() => {
        const lines: Array<{ x1: number; y1: number; x2: number; y2: number; id: string }> = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
                );
                if (dist < 25 && lines.length < 20) {
                    lines.push({
                        x1: nodes[i].x,
                        y1: nodes[i].y,
                        x2: nodes[j].x,
                        y2: nodes[j].y,
                        id: `line-${i}-${j}`
                    });
                }
            }
        }
        return lines;
    }, [nodes]);

    return (
        <div className="relative w-full h-[60vh] md:h-[44rem] bg-[#0B0C10]/50 border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden group">
            {/* Background Grid/Stars Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full">
                    <defs>
                        <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    {Array.from({ length: 50 }).map((_, i) => (
                        <circle
                            key={i}
                            cx={Math.random() * 100 + "%"}
                            cy={Math.random() * 100 + "%"}
                            r={Math.random() * 1}
                            fill="white"
                        />
                    ))}
                </svg>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((line) => (
                    <motion.line
                        key={line.id}
                        x1={`${line.x1}%`}
                        y1={`${line.y1}%`}
                        x2={`${line.x2}%`}
                        y2={`${line.y2}%`}
                        stroke="rgba(129, 140, 248, 0.15)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                    />
                ))}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => (
                <motion.div
                    key={node.id}
                    className="absolute cursor-pointer z-20"
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        y: [0, -10, 0],
                    }}
                    transition={{
                        scale: { duration: 0.5, delay: node.delay },
                        opacity: { duration: 0.5, delay: node.delay },
                        y: {
                            duration: node.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: node.delay,
                        },
                    }}
                    whileHover={{ scale: 1.2, zIndex: 30 }}
                    onClick={() => onSelectTheory(node)}
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-all">
                            <MessageSquare className="w-5 h-5 text-red-400" />
                        </div>

                        {/* Tooltip-like label */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <div className="bg-[#0B0C10] border border-white/10 px-3 py-1.5 rounded-lg shadow-2xl">
                                <p className="text-[10px] font-bold text-white uppercase tracking-wider max-w-40 truncate">
                                    {node.title}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-[8px] text-slate-500">u/{node.author}</span>
                                    <span className="text-[8px] text-emerald-400 flex items-center">
                                        <ArrowUp className="w-2 h-2 mr-0.5" />
                                        {node.upvotes}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {/* Central Identity Overlay */}
            <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl flex items-center space-x-4 shadow-2xl">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                        <Network className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-0.5">Neural Narrative Map</div>
                        <div className="text-sm font-medium text-white">{showTitle} Theory Cluster</div>
                    </div>
                    <div className="w-px h-8 bg-white/10 mx-2" />
                    <div className="text-xs text-red-400/80 font-mono">
                        {nodes.length} Active Nodes
                    </div>
                </div>
            </div>

            {/* Map Hint */}
            <div className="absolute top-8 left-8 text-slate-500/40 text-[10px] uppercase font-bold tracking-[0.3em] font-mono pointer-events-none">
                Semantic Environment Beta v0.4
            </div>
        </div>
    );
};

export default NarrativeMap;

