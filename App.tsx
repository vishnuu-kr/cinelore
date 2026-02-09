
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { getTrendingShows, getTrendingAnime } from './services/tmdbService';
import { getTrendingManga } from './services/mangaService';
import { AuthProvider } from './components/AuthContext';
import { Show } from './types';

// Pages
import HomePage from './components/pages/HomePage';
import TheoryHubPage from './components/pages/TheoryHubPage';
import CreateTheoryPage from './components/pages/CreateTheoryPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import WarRoomPage from './components/pages/WarRoomPage';
import BrowsePage from './components/pages/BrowsePage';
import SearchPage from './components/pages/SearchPage';
import ProfilePage from './components/pages/ProfilePage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// Header Wrapper to inject navigation
const HeaderWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Header
      onHomeClick={() => navigate('/')}
      onTrendingClick={() => {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById('trending-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }}
      onArchiveClick={() => navigate('/')}
    />
  );
};

const AppContent: React.FC = () => {
  const [trendingShows, setTrendingShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Helper to merge and dedupe
      const mergeShows = (current: Show[], newShows: Show[]) => {
        const unique = new Map(current.map(s => [s.id, s]));
        newShows.forEach(s => unique.set(s.id, s));
        return Array.from(unique.values());
      };

      try {
        // 1. Critical: Get TMDB Trending first (Fastest)
        const trending = await getTrendingShows();
        setTrendingShows(prev => mergeShows(prev, trending));
        setIsLoading(false);

        // 2. Secondary: Fetch Anime & Manga in parallel without blocking UI
        getTrendingAnime().then(anime => {
          setTrendingShows(prev => mergeShows(prev, anime));
        }).catch(err => console.error("Anime fetch error", err));

        getTrendingManga().then(manga => {
          setTrendingShows(prev => mergeShows(prev, manga));
        }).catch(err => console.error("Manga fetch error", err));

      } catch (error) {
        console.error("Failed to load initial trending data", error);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-200 selection:bg-red-500/30 selection:text-white">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <ScrollToTop />
      <HeaderWrapper />

      <main id="main-content" className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 relative z-10 pb-20 page-transition">
        <Routes>
          <Route path="/" element={<HomePage trendingShows={trendingShows} isLoading={isLoading} />} />
          <Route path="/movies" element={<BrowsePage type="movie" title="Movies" />} />
          <Route path="/tv" element={<BrowsePage type="tv" title="TV Series" />} />
          <Route path="/anime" element={<BrowsePage type="anime" title="Anime" />} />
          <Route path="/manga" element={<BrowsePage type="manga" title="Manga" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/trending" element={<BrowsePage type="trending" title="Trending Now" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/hub/:type/:id" element={<TheoryHubPage />} />
          <Route path="/hub/:type/:id/create" element={<CreateTheoryPage />} />
          <Route path="/hub/:type/:id/war-room" element={<WarRoomPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 bg-black/40 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            {/* Logo and brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold tracking-wider text-white">CINELORE</span>
            </div>

            {/* Footer navigation */}
            <nav className="flex flex-wrap gap-6 text-sm">
              <a href="/movies" className="text-zinc-400 hover:text-white transition-colors">Movies</a>
              <a href="/tv" className="text-zinc-400 hover:text-white transition-colors">TV Series</a>
              <a href="/anime" className="text-zinc-400 hover:text-white transition-colors">Anime</a>
              <a href="/manga" className="text-zinc-400 hover:text-white transition-colors">Manga</a>
            </nav>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-6"></div>

          {/* Copyright and version */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
            <p>© {new Date().getFullYear()} CineLore. All rights reserved.</p>
            <p>v4.1.0 — Narrative Intelligence</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
