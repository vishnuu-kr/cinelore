import { Theory } from '../types';

export interface BoardNode {
    id: string;
    type: 'theory' | 'clue' | 'image';
    x: number;
    y: number;
    content: string;
    theoryId?: string; // If linked to a specific theory
    imageUrl?: string;
}

export interface BoardConnection {
    id: string;
    from: string;
    to: string;
}

export interface TimelineEvent {
    id: string;
    timestamp: string; // e.g. "12:04"
    description: string;
    verifiedCount: number;
    debunkedCount: number;
    author: string;
}

// Mock storage keys
const STORAGE_KEYS = {
    NODES: 'cinelore_board_nodes',
    CONNECTIONS: 'cinelore_board_connections',
    TIMELINE: 'cinelore_board_timeline'
};

// Helper helpers
const getStorage = <T>(key: string): Record<string, T[]> => {
    try {
        return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
        return {};
    }
};

const setStorage = <T>(key: string, data: Record<string, T[]>) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const boardService = {
    getNodes: async (showId: string): Promise<BoardNode[]> => {
        const boardNodes = getStorage<BoardNode>(STORAGE_KEYS.NODES);
        return boardNodes[showId] || [];
    },

    saveNode: async (showId: string, node: BoardNode) => {
        const boardNodes = getStorage<BoardNode>(STORAGE_KEYS.NODES);
        if (!boardNodes[showId]) boardNodes[showId] = [];

        const index = boardNodes[showId].findIndex(n => n.id === node.id);
        if (index >= 0) {
            boardNodes[showId][index] = node;
        } else {
            boardNodes[showId].push(node);
        }
        setStorage(STORAGE_KEYS.NODES, boardNodes);
        return node;
    },

    getConnections: async (showId: string): Promise<BoardConnection[]> => {
        const boardConnections = getStorage<BoardConnection>(STORAGE_KEYS.CONNECTIONS);
        return boardConnections[showId] || [];
    },

    addConnection: async (showId: string, fromId: string, toId: string) => {
        const boardConnections = getStorage<BoardConnection>(STORAGE_KEYS.CONNECTIONS);
        if (!boardConnections[showId]) boardConnections[showId] = [];

        const newConnection = { id: `conn-${Date.now()}`, from: fromId, to: toId };
        boardConnections[showId].push(newConnection);
        setStorage(STORAGE_KEYS.CONNECTIONS, boardConnections);
        return newConnection;
    },

    getTimelineEvents: async (showId: string): Promise<TimelineEvent[]> => {
        const timelineEvents = getStorage<TimelineEvent>(STORAGE_KEYS.TIMELINE);
        return timelineEvents[showId] || [];
    },

    addTimelineEvent: async (showId: string, event: Omit<TimelineEvent, 'id' | 'verifiedCount' | 'debunkedCount'>) => {
        const timelineEvents = getStorage<TimelineEvent>(STORAGE_KEYS.TIMELINE);
        if (!timelineEvents[showId]) timelineEvents[showId] = [];

        const newEvent: TimelineEvent = {
            ...event,
            id: `evt-${Date.now()}`,
            verifiedCount: 0,
            debunkedCount: 0
        };
        timelineEvents[showId].push(newEvent);
        // Sort by timestamp
        timelineEvents[showId].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        setStorage(STORAGE_KEYS.TIMELINE, timelineEvents);
        return newEvent;
    },

    voteTimelineEvent: async (showId: string, eventId: string, type: 'verify' | 'debunk') => {
        const timelineEvents = getStorage<TimelineEvent>(STORAGE_KEYS.TIMELINE);
        const events = timelineEvents[showId];
        if (!events) return;

        const event = events.find(e => e.id === eventId);
        if (event) {
            if (type === 'verify') event.verifiedCount++;
            else event.debunkedCount++;
            setStorage(STORAGE_KEYS.TIMELINE, timelineEvents);
        }
    }
};
