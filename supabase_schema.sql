
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for Theories
create table theories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  user_id uuid references profiles(id) not null,
  community_id text not null, -- Stores the TMDB or Jikan ID
  show_title text, -- Optional, helps with display
  is_published boolean default true,
  upvotes int default 0,
  downvotes int default 0,
  url text -- Optional external link
);

-- RLS for Theories
alter table theories enable row level security;

create policy "Theories are viewable by everyone."
  on theories for select
  using ( true );

create policy "Authenticated users can create theories."
  on theories for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own theories."
  on theories for update
  using ( auth.uid() = user_id );

-- Create a table for Comments
create table comments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  theory_id uuid references theories(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  content text not null,
  parent_id uuid references comments(id), -- For nested comments
  upvotes int default 0
);

-- RLS for Comments
alter table comments enable row level security;

create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Authenticated users can create comments."
  on comments for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own comments."
  on comments for update
  using ( auth.uid() = user_id );

-- Add a helper trigger to creating a profile on signup (Optional, but handled in code for now)
-- The code currently handles profile creation in SignupPage.tsx, so this is not strictly necessary but good practice.
