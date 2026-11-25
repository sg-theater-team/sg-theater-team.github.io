-- Photo albums (added 2026-11-25). Run once in the Supabase SQL editor.
-- Files live in the private team-media bucket under '<album id>/<file>'. Existing storage policies cover them.
create table public.albums (id bigint generated always as identity primary key, name text not null check (char_length(name) between 1 and 80), created_at timestamptz default now());
alter table public.albums enable row level security;
create policy "members read albums" on public.albums for select to authenticated using (public.is_approved());
create policy "admin write albums" on public.albums for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select, insert, update, delete on public.albums to authenticated;
