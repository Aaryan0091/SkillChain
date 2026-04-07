create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  wallet_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  repo_url text not null,
  repo_name text not null,
  analysis_status text not null default 'pending',
  analysis_version text not null default 'v1',
  github_repo_id bigint,
  default_branch text,
  created_at timestamptz not null default now(),
  last_analyzed_at timestamptz,
  analysis_error text
);

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  analysis_version text not null default 'v1',
  lines_of_code integer default 0,
  files integer default 0,
  commits integer default 0,
  complexity_score numeric(5,2) default 0,
  tech_score numeric(5,2) default 0,
  docs_score numeric(5,2) default 0,
  test_ratio numeric(5,2) default 0,
  raw_metrics_json jsonb default '{}'::jsonb
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  backend_score numeric(5,2) default 0,
  architecture_score numeric(5,2) default 0,
  documentation_score numeric(5,2) default 0,
  confidence_score numeric(5,2) default 0,
  scoring_version text not null default 'v1',
  explanation text,
  score_breakdown_json jsonb default '{}'::jsonb
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  certificate_url text,
  verification_url text,
  qr_code_url text,
  certificate_payload jsonb not null default '{}'::jsonb,
  certificate_payload_version text not null default 'v1',
  certificate_hash text,
  blockchain_tx text,
  contract_address text,
  verification_status text not null default 'pending',
  status text not null default 'pending',
  chain_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  job_type text not null,
  status text not null default 'queued',
  analysis_version text not null default 'v1',
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.metrics enable row level security;
alter table public.scores enable row level security;
alter table public.certificates enable row level security;
alter table public.analysis_jobs enable row level security;

drop policy if exists "Users can read their own profile" on public.users;
create policy "Users can read their own profile"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id);

drop policy if exists "Users can manage their own projects" on public.projects;
create policy "Users can manage their own projects"
on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read metrics for their own projects" on public.metrics;
create policy "Users can read metrics for their own projects"
on public.metrics
for select
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = metrics.project_id
      and public.projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can read scores for their own projects" on public.scores;
create policy "Users can read scores for their own projects"
on public.scores
for select
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = scores.project_id
      and public.projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can read certificates for their own projects" on public.certificates;
create policy "Users can read certificates for their own projects"
on public.certificates
for select
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = certificates.project_id
      and public.projects.user_id = auth.uid()
  )
);

drop policy if exists "Users can read jobs for their own projects" on public.analysis_jobs;
create policy "Users can read jobs for their own projects"
on public.analysis_jobs
for select
using (
  exists (
    select 1
    from public.projects
    where public.projects.id = analysis_jobs.project_id
      and public.projects.user_id = auth.uid()
  )
);
