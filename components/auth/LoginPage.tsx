
import React, { useState } from 'react';
import { mockForumService } from '../../services/mockForumService';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Password ignored in demo mode
        const { user, error } = await mockForumService.login(email);

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            await refreshUser();
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-6 md:p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-xl"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">Access Node</h2>
                    <p className="text-xs text-slate-600 font-mono mt-2 uppercase tracking-widest group-hover:text-red-900 transition-colors cursor-default">[ DEMO MODE ACTIVE ]</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                            placeholder="operator@cinelore.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                            placeholder="Any password works"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Authenticating...' : 'Initialize Session'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        New operator?{' '}
                        <Link to="/signup" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                            Request access
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

