-- Live schema of the San George theater team site (Supabase project hvdhxaycwwweesnamskj), as audited 2026-11-25.
create table public.profiles (id uuid primary key references auth.users on delete cascade, email text not null, full_name text, status text not null default 'pending' check (status in ('pending','approved','rejected')), is_admin boolean not null default false, created_at timestamptz default now());
alter table public.profiles enable row level security;
create or replace function public.is_admin() returns boolean language sql security definer set search_path=public stable as $$ select coalesce((select is_admin and status='approved' from profiles where id = auth.uid()),false) $$;
create or replace function public.is_approved() returns boolean language sql security definer set search_path=public stable as $$ select coalesce((select status='approved' from profiles where id = auth.uid()),false) $$;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email,full_name) values (new.id,new.email,new.raw_user_meta_data->>'full_name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create table public.posts (id bigint generated always as identity primary key, kind text not null check (kind in ('rehearsal','script','role','note')), title text not null, body text, event_date timestamptz, created_at timestamptz default now());
alter table public.posts enable row level security;
create policy "members read" on public.posts for select to authenticated using (public.is_approved());
create policy "admin write" on public.posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (status) on public.profiles to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- Media bucket: private, 50 MB per file, images and videos only (Free plan: 1 GB total).
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('team-media','team-media',false,52428800,array['image/*','video/*']);
create policy "media members read" on storage.objects for select to authenticated using (bucket_id='team-media' and public.is_approved());
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id='team-media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id='team-media' and public.is_admin());
-- The owner is promoted by hand after confirming the email. Never by trigger or signup metadata:
-- update public.profiles set is_admin=true, status='approved' where email='stgoerge448@gmail.com';
