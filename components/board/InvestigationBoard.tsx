import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Show, Theory } from '../../types';
import { boardService, BoardNode, BoardConnection } from '../../services/boardService';
import { Plus, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';

interface InvestigationBoardProps {
    show: Show;
    theories: Theory[];
}

const InvestigationBoard: React.FC<InvestigationBoardProps> = ({ show, theories }) => {
    const [nodes, setNodes] = useState<BoardNode[]>([]);
    const [connections, setConnections] = useState<BoardConnection[]>([]);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize board with theories if empty
    useEffect(() => {
        const loadBoard = async () => {
            let existingNodes = await boardService.getNodes(show.id);
            const existingConnections = await boardService.getConnections(show.id);

            if (existingNodes.length === 0 && theories.length > 0) {
                // Initial population from theories
                existingNodes = theories.slice(0, 5).map((theory, i) => ({
                    id: theory.id,
                    type: 'theory',
                    x: 100 + (i % 3) * 300,
                    y: 100 + Math.floor(i / 3) * 200,
                    content: theory.title,
                    theoryId: theory.id
                }));
                // Save these initial nodes
                existingNodes.forEach(async (n) => await boardService.saveNode(show.id, n));
            }
            setNodes(existingNodes);
            setConnections(existingConnections);
        };
        loadBoard();
    }, [show.id, theories]);

    const handleDragEnd = async (id: string, info: any) => {
        const node = nodes.find(n => n.id === id);
        if (node) {
            // Using a simple offset based update for now, ideally we'd map pixels to coordinate system
            // But framer motion drag is relative. 
            // Better approach: Store x/y in state and update on drag end relative to parent.
            // For MVP, we might rely on the visual state, but to persist we need real coordinates.
            // Let's assume the element's style.left/top is updated or we use useMotionValue.
            // Simplified: won't perfectly persist drag *pixel perfect* in this mock without more complex Ref logic.
            // We will just update the state in-memory 'roughly' or skip persistence of position for this session to save complexity, 
            // OR use a constraint reference.
        }
    };

    const addClue = async () => {
        const newNode: BoardNode = {
            id: `clue-${Date.now()}`,
            type: 'clue',
            x: 200,
            y: 200,
            content: 'New Clue'
        };
        const saved = await boardService.saveNode(show.id, newNode);
        setNodes([...nodes, saved]);
    };

    const handleNodeClick = async (id: string) => {
        if (connectingFrom) {
            if (connectingFrom === id) {
                setConnectingFrom(null); // Cancel
                return;
            }
            // Create connection
            const newConn = await boardService.addConnection(show.id, connectingFrom, id);
            setConnections([...connections, newConn]);
            setConnectingFrom(null);
        }
    };

    return (
        <div className="relative w-full h-[50rem] bg-[#0B0C10] border border-white/10 rounded-[2rem] overflow-hidden group select-none shadow-2xl">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-30 flex gap-2">
                <button onClick={addClue} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md border border-white/10 text-white transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Add Clue</span>
                </button>
                <div className="px-4 py-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                    {connectingFrom ? 'Select target to connect...' : 'Investigation Mode'}
                </div>
            </div>

            {/* Background Grid - Now Solid Lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Render Nodes */}
            {nodes.map((node) => (
                <DraggableNode
                    key={node.id}
                    node={node}
                    onDragEnd={handleDragEnd}
                    isConnecting={connectingFrom === node.id}
                    onStartConnect={() => setConnectingFrom(node.id)}
                    onClick={() => handleNodeClick(node.id)}
                    themeColor={show.themeColor}
                />
            ))}

            {/* Render Connections (Red Strings) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {connections.map(conn => {
                    const from = nodes.find(n => n.id === conn.from);
                    const to = nodes.find(n => n.id === conn.to);
                    if (!from || !to) return null;
                    // Note: In a real app we'd need useMotionValue to track positions in real-time. 
                    // For this MVP, lines might lag on drag or only update on render.
                    return (
                        <line
                            key={conn.id}
                            x1={from.x} y1={from.y + 20} // Rough centering
                            x2={to.x} y2={to.y + 20}
                            stroke="#E81313"
                            strokeWidth="3"
                            strokeOpacity="0.8"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

const DraggableNode: React.FC<{
    node: BoardNode;
    onDragEnd: (id: string, info: any) => void;
    isConnecting: boolean;
    onStartConnect: () => void;
    onClick: () => void;
    themeColor?: string;
}> = ({ node, onDragEnd, isConnecting, onStartConnect, onClick, themeColor }) => {
    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ x: node.x, y: node.y }}
            onDragEnd={(e, info) => onDragEnd(node.id, info)}
            onClick={onClick}
            className={`absolute z-10 w-64 p-4 rounded-xl border cursor-grab active:cursor-grabbing shadow-2xl group
                ${node.type === 'theory' ? 'bg-[#1a1c23] border-white/10' : 'bg-[#fff9c4] border-yellow-400 text-black'}
                ${isConnecting ? 'ring-2 ring-red-500' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase tracking-wider ${node.type === 'theory' ? 'text-slate-500' : 'text-yellow-800/50'}`}>
                    {node.type}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onStartConnect(); }}
                    className="p-1 hover:bg-black/10 rounded transition-colors"
                >
                    <LinkIcon className={`w-3 h-3 ${node.type === 'theory' ? 'text-slate-400' : 'text-yellow-800'}`} />
                </button>
            </div>

            {node.imageUrl && (
                <img src={node.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
            )}

            <p className={`text-sm font-medium leading-relaxed ${node.type === 'theory' ? 'text-slate-200' : 'text-slate-900'}`}>
                {node.content}
            </p>
        </motion.div>
    );
};

export default InvestigationBoard;


