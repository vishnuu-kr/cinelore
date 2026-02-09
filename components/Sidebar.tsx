import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Search,
    Tv,
    Film,
    BookOpen,
    Gamepad2,
    Dribbble,
    LayoutGrid,
    Camera,
    Smile,
    MonitorPlay,
    Menu,
    Settings,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
    icon: React.ElementType;
    label: string;
    path?: string;
    action?: () => void;
}

interface SidebarProps {
    onSearch?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSearch }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const navItems: NavItem[] = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', action: onSearch },
        { icon: Tv, label: 'TV Shows', path: '/?filter=tv' },
        { icon: Film, label: 'Movies', path: '/?filter=movie' },
        { icon: BookOpen, label: 'Manga', path: '/?filter=manga' },
        { icon: Gamepad2, label: 'Games', path: '/?filter=games' },
        { icon: Dribbble, label: 'Sports', path: '/?filter=sports' },
        { icon: LayoutGrid, label: 'Categories', path: '/?filter=all' },
        { icon: Camera, label: 'Screenshots', path: '/screenshots' },
        { icon: Smile, label: 'Memes', path: '/memes' },
        { icon: MonitorPlay, label: 'Streaming', path: '/streaming' },
        { icon: TrendingUp, label: 'Trending', path: '/#trending-section' },
        { icon: Sparkles, label: 'AI Lore', path: '/ai-assistant' },
    ];

    const bottomItems: NavItem[] = [
        { icon: Menu, label: 'Menu', action: () => { } },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleClick = (item: NavItem) => {
        if (item.action) {
            item.action();
        } else if (item.path) {
            navigate(item.path);
        }
    };

    const isActive = (item: NavItem) => {
        if (!item.path) return false;
        return location.pathname === item.path || location.pathname + location.search === item.path;
    };

    return (
        <motion.div
            initial={{ x: -60 }}
            animate={{ x: 0 }}
            className="fixed left-0 top-0 h-screen w-16 bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-4 z-[200]"
        >
            {/* Logo */}
            <div className="mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-black" />
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto scrollbar-hide">
                {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item);

                    return (
                        <div
                            key={index}
                            className="relative"
                            onMouseEnter={() => setHoveredItem(item.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <button
                                onClick={() => handleClick(item)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group active:scale-95 ${active
                                    ? 'bg-white/10 text-white border border-white/10'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                                    }`}
                            >
                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                            </button>

                            {/* Tooltip */}
                            {hoveredItem === item.label && (
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap z-50 border border-white/5"
                                >
                                    {item.label}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Divider */}
            <div className="w-8 h-px bg-white/10 my-4" />

            {/* Bottom Items */}
            <div className="flex flex-col items-center gap-1">
                {bottomItems.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={index}
                            className="relative"
                            onMouseEnter={() => setHoveredItem(item.label)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <button
                                onClick={() => handleClick(item)}
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 active:scale-95"
                            >
                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                            </button>

                            {/* Tooltip */}
                            {hoveredItem === item.label && (
                                <motion.div
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md whitespace-nowrap z-50 border border-white/5"
                                >
                                    {item.label}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default Sidebar;
