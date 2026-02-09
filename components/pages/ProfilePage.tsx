import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { mockForumService } from '../../services/mockForumService';
import { Theory } from '../../types';
import { motion } from 'framer-motion';
import { Settings, User, BookOpen, Edit2, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { user, signOut, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'theories' | 'settings'>('theories');
    const [userTheories, setUserTheories] = useState<Theory[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setUsername(user.username);
        setAvatarUrl(user.avatar_url || '');

        const loadTheories = async () => {
            const theories = await mockForumService.getUserTheories(user.id);
            setUserTheories(theories);
        };
        loadTheories();
    }, [user, navigate]);

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            await mockForumService.updateProfile(user.id, {
                username,
                avatar_url: avatarUrl
            });
            await refreshUser();
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 container mx-auto max-w-5xl">
            {/* Header / ID Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-12 relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-32 bg-red-600/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black">
                            <img
                                src={avatarUrl || user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-2xl border border-white/20">
                                <Edit2 className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        {isEditing ? (
                            <div className="space-y-4 max-w-sm">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Codename</label>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Avatar URL</label>
                                    <input
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-red-500 transition-colors"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-white/5 hover:bg-white/10 text-slate-300 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                        <h1 className="text-3xl font-black text-white tracking-tight">{user.username}</h1>
                                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Agent Level 1
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm">{user.email}</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold uppercase tracking-widest text-slate-300 transition-colors"
                                    >
                                        <Settings className="w-3 h-3" /> Edit Profile
                                    </button>
                                    <button
                                        onClick={signOut}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold uppercase tracking-widest text-red-400 transition-colors"
                                    >
                                        <LogOut className="w-3 h-3" /> Disconnect
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Stats Widget */}
                    <div className="flex gap-8 bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">{userTheories.length}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Theories</div>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">0</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Reputation</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Tabs */}
            <div className="border-b border-white/10 mb-8 flex gap-8">
                <button
                    onClick={() => setActiveTab('theories')}
                    className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'theories' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> My Theories</span>
                    {activeTab === 'theories' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'settings' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Account</span>
                    {activeTab === 'settings' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />}
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'theories' && (
                    <div className="space-y-4">
                        {userTheories.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-slate-500 mb-4">No theories found in the archives.</p>
                                <button onClick={() => navigate('/')} className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-widest">
                                    Start Investigating
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userTheories.map(theory => (
                                    <div key={theory.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer" onClick={() => navigate(`/hub/${theory.show_type}/${theory.show_id}?theoryId=${theory.id}`)}>
                                        <h3 className="font-bold text-lg text-slate-200 mb-2">{theory.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">{theory.content}</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 font-mono">
                                            <span>{new Date(theory.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="uppercase">{theory.show_title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-2 p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-6">Security Settings</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">Reset Password</div>
                                        <div className="text-xs text-slate-500">Update your access credentials</div>
                                    </div>
                                    <button className="text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-slate-300 transition-colors">Update</button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">Email Notifications</div>
                                        <div className="text-xs text-slate-500">Manage your intelligence briefings</div>
                                    </div>
                                    <div className="w-10 h-6 bg-red-900/40 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-red-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
