
export interface Show {
  id: string;
  title: string;
  posterPath: string;
  backdropPath?: string;
  overview: string;
  seasons: Season[];
  type: 'movie' | 'tv' | 'anime' | 'manga';
  voteAverage?: number;
  releaseDate?: string;
  themeColor?: string; // Hex or CSS color
  status?: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface Episode {
  episodeNumber: number;
  title: string;
  airDate: string;
  overview: string;
  // theories: Theory[]; 
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  xp?: number;
  titles?: string[]; // e.g. "Tech Specialist", "Historian"
  role?: 'user' | 'lore_master' | 'admin';
}

// ... existing code ...

export interface Theory {
  id: string;
  title: string;
  content: string; // Rich text / Markdown
  user_id: string;
  community_id: string;
  show_title?: string;
  show_id?: string; // TMDB ID for navigation
  show_type?: 'movie' | 'tv' | 'anime' | 'manga';
  image_url?: string; // For trending cards

  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at?: string;
  is_published: boolean;

  // Canon Tracker & Gamification
  status?: 'active' | 'confirmed' | 'debunked';
  is_bounty?: boolean;
  bounty_reward?: string; // e.g. "Gold Badge"
  verified_by_expert?: boolean;

  // Relations
  author?: UserProfile;
  comments_count?: number;
  enhancements?: Enhancement[];

  // Universal Search Extensions
  source?: 'reddit' | 'youtube' | 'web' | 'local';
  video_url?: string;
  thumbnail_url?: string;
  url?: string; // External link for articles
}

export interface Enhancement {
  id: string;
  theory_id: string;
  user_id: string; // 'anonymous' or specific user
  content: string;
  created_at: string;
  upvotes: number;
  author_name: string; // Display name
}

export interface Comment {
  id: string;
  theory_id: string;
  user_id: string;
  content: string;
  parent_id?: string; // For nested comments
  created_at: string;
  upvotes: number;

  // Relations
  author?: UserProfile;
}
