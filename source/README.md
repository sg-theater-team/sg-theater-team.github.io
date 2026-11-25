# فريق سان چورج - editable source
React + Vite + Supabase. Members need the owner's approval. Live: https://sg-theater-team.github.io/

## Build and deploy (exact steps)
1. `npm install`
2. Create `.env.production` from `.env.example`: the Supabase project URL and the publishable (anon) key. Never use a secret or service_role key. `.env*` is git-ignored.
3. `npm run build`. vite.config.js sets assetsInlineLimit, so `src/logo.jpg` is inlined into the JS.
4. `python3 build_single.py` (steps 3 and 4 together: `npm run build:single`). This inlines the JS into one self-contained `dist/single/index.html`.
5. Deploy: replace the repo-root `index.html` with `dist/single/index.html` (GitHub web editor "Add file > Upload files", or git push). GitHub Pages serves the root file. Everything under `source/` is not served as the site.
6. Check: fetch https://sg-theater-team.github.io/ and compare it with `dist/single/index.html`.
Rebuilding from the committed source with the same env values reproduces the live file byte for byte.

## Database
`supabase/schema.sql` is the live schema (RLS, the media bucket and its policies). Run it in the Supabase SQL editor on a new project.
Promote the owner by hand only, after the email is confirmed: `update public.profiles set is_admin=true, status='approved' where email='stgoerge448@gmail.com';`
`supabase/rls-test.sql` is a rolled-back privacy test using synthetic .invalid users.

## Behavior notes
- Videos use 300 s signed URLs. Photos use an authenticated download (blob URLs).
- Photos are resized to 1600 px. Videos over 50 MB are rejected.
- Removing a member stops new access at once. It cannot erase photos already saved on a device, and a started video link can last up to 5 minutes.
- Free plan: 1 GB storage, 50 MB per file. Projects can pause after a week of inactivity.
