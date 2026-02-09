import React, { useState, useEffect } from 'react';
import { Home, Search, Tv, Film, BookOpen, TrendingUp, Menu, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SearchComponent from './Search';

interface HeaderProps {
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick }) => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Tv, label: 'TV', path: '/tv' },
    { icon: Film, label: 'Movies', path: '/movies' },
    { icon: BookOpen, label: 'Manga', path: '/manga' },
    { icon: Video, label: 'Anime', path: '/anime' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
  ];

  const handleNavClick = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-3' : 'py-4'}`}>
        {/* Dynamic Background Blur */}
        <div className={`absolute inset-0 transition-all duration-700 ${isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.05] opacity-100' : 'bg-[#0a0a0a]/80 backdrop-blur-sm'}`} />

        <div className="container mx-auto px-6 h-14 flex items-center justify-between relative z-10">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 cursor-pointer group/logo"
          >
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center hover-scale">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-white block">
              Cine<span className="text-zinc-500">Lore</span>
            </span>
          </div>

          {/* Center Navigation - Icon Bar */}
          <nav className="hidden md:flex items-center glass-panel rounded-xl px-2 py-1.5 space-x-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={index}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${isActive
                    ? 'bg-red-600/20 text-red-500'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider hidden lg:block">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side - Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-xs font-bold text-slate-400 hidden sm:block hover:text-white transition-colors">
                  {user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={signOut}
                  className="text-xs font-black uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors px-2 py-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors z-50"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0B0C10] md:hidden pt-24 px-6 pb-8 overflow-y-auto"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      handleNavClick(item);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all border ${isActive
                      ? 'bg-red-600/10 border-red-600/20 text-red-500'
                      : 'bg-white/5 border-white/5 text-slate-400'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                );
              })}

              <div className="h-px bg-white/10 my-4" />

              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-red-900/10 border border-red-500/20 text-red-400"
                >
                  <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-300 font-bold uppercase tracking-widest text-xs">Login</button>
                  <button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} className="p-4 rounded-2xl bg-red-600 text-white font-bold uppercase tracking-widest text-xs">Join</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  );
};

export default Header;


