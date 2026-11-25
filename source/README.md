# فريق سان چورج - editable source
React + Vite + Supabase. Members need the owner's approval.
- Setup: `npm install`, copy `.env.example` to `.env.production` with the project URL and publishable key, then `npm run build`.
- Deploy: copy the built `dist/index.html` (single file) to the repo root. The root index.html is what GitHub Pages serves.
- Database: `supabase/schema.sql` is the live schema. `supabase/rls-test.sql` is a rolled-back privacy test with synthetic .invalid users.
- Videos use 300 s signed URLs. Photos are fetched with an authenticated download.
- Never put a secret or service_role key in the frontend.
