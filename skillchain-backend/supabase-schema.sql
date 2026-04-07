-- 1. Create a table for public profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Function to automatically create a profile for every new user
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Projects table (for GitHub repos submitted for analysis)
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  repo_url text not null,
  repo_name text not null,
  status text default 'Pending', -- Pending, Analyzing, Completed, Failed
  score integer,
  analysis_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for projects
alter table projects enable row level security;
create policy "Users can view their own projects." on projects for select using (auth.uid() = user_id);
create policy "Users can insert their own projects." on projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects." on projects for update using (auth.uid() = user_id);

-- 3. Certificates table (for the minted Polygon proof)
create table certificates (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) not null,
  user_id uuid references public.profiles(id) not null,
  polygon_tx_hash text not null,
  ipfs_hash text,
  metrics_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for certificates
alter table certificates enable row level security;
create policy "Certificates are publicly viewable." on certificates for select using (true);
