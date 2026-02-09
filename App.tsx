
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
    window.scrollTo(0, 0);
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

        // 2. Secondary: Fetch Anime & Manga in parallel without blocking UI
        getTrendingAnime().then(anime => {
          setTrendingShows(prev => mergeShows(prev, anime));
        }).catch(err => console.error("Anime fetch error", err));

        getTrendingManga().then(manga => {
          setTrendingShows(prev => mergeShows(prev, manga));
        }).catch(err => console.error("Manga fetch error", err));

      } catch (error) {
        console.error("Failed to load initial trending data", error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-slate-200 selection:bg-red-500/30">
      <ScrollToTop />
      <HeaderWrapper />

      <main className="container mx-auto px-6 pt-4 relative z-10 pb-20">
        <Routes>
          <Route path="/" element={<HomePage trendingShows={trendingShows} />} />
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

      <footer className="border-t border-white/5 py-12 text-center">
        <div className="flex flex-col items-center space-y-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="text-sm font-bold tracking-[0.5em] text-white">CINELORE CORE v4.1.0</div>
          <p className="text-xs font-medium">DECENTRALIZED NARRATIVE ANALYSIS</p>
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
