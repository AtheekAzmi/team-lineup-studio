create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'Untitled Match',
  subtitle text not null default '',
  team_a_name text not null default 'Team A',
  team_a_players jsonb not null default '[]'::jsonb,
  team_a_color text not null default '#facc15',
  team_b_name text not null default 'Team B',
  team_b_players jsonb not null default '[]'::jsonb,
  team_b_color text not null default '#facc15',
  bg_from text not null default '#1e1b4b',
  bg_to text not null default '#7f1d1d',
  animation_style text not null default 'rise',
  animation_speed numeric not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "Users can view their own matches" on public.matches
  for select using (auth.uid() = user_id);
create policy "Users can insert their own matches" on public.matches
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own matches" on public.matches
  for update using (auth.uid() = user_id);
create policy "Users can delete their own matches" on public.matches
  for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger matches_set_updated_at before update on public.matches
  for each row execute function public.set_updated_at();