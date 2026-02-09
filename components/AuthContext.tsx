
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { mockForumService } from '../services/mockForumService';

// Adapting Supabase User type to our simpler Profile type for Demo
interface User extends UserProfile {
    email?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => { }, refreshUser: async () => { } });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        const currentUser = await mockForumService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const signOut = async () => {
        await mockForumService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
