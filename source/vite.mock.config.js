import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],build:{outDir:'dist-mock'},resolve:{alias:{'@supabase/supabase-js':'/src/mock-supabase.js'}}});
