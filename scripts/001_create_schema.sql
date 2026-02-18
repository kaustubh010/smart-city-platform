-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Create issues table
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  location text,
  status text default 'open',
  latitude numeric,
  longitude numeric,
  image_url text,
  ai_classification text,
  ai_confidence numeric,
  upvotes integer default 0,
  downvotes integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.issues enable row level security;

create policy "issues_select_all" on public.issues for select using (true);
create policy "issues_insert_own" on public.issues for insert with check (auth.uid() = user_id);
create policy "issues_update_own" on public.issues for update using (auth.uid() = user_id);
create policy "issues_delete_own" on public.issues for delete using (auth.uid() = user_id);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.comments enable row level security;

create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_auth" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- Create votes table
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote_type text not null,
  created_at timestamp with time zone default now(),
  unique(issue_id, user_id)
);

alter table public.votes enable row level security;

create policy "votes_select_all" on public.votes for select using (true);
create policy "votes_insert_own" on public.votes for insert with check (auth.uid() = user_id);
create policy "votes_update_own" on public.votes for update using (auth.uid() = user_id);
create policy "votes_delete_own" on public.votes for delete using (auth.uid() = user_id);

-- Indexes for better query performance
create index if not exists idx_issues_user_id on public.issues(user_id);
create index if not exists idx_issues_location on public.issues(latitude, longitude);
create index if not exists idx_issues_status on public.issues(status);
create index if not exists idx_issues_created_at on public.issues(created_at desc);
create index if not exists idx_comments_issue_id on public.comments(issue_id);
create index if not exists idx_votes_issue_id on public.votes(issue_id);
