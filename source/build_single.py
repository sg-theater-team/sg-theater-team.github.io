#!/usr/bin/env python3
"""Run after `npm run build`. Inlines dist/assets/index-*.js into one self-contained dist/single/index.html (the file GitHub Pages serves)."""
import glob, os, re, sys
EXPECTED_URL = 'https://hvdhxaycwwweesnamskj.supabase.co'  # the live Supabase project; change only if the project changes

def fail(m):
    sys.exit('BUILD CHECK FAILED: ' + m)

env = {}
for line in open('.env.production', encoding='utf8'):
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.strip().split('=', 1); env[k] = v
url, key = env.get('VITE_SUPABASE_URL', ''), env.get('VITE_SUPABASE_ANON_KEY', '')
if url != EXPECTED_URL: fail('VITE_SUPABASE_URL is not the intended project ' + EXPECTED_URL)
if re.fullmatch(r'sb_publishable_[A-Za-z0-9_-]{20,}', key) is None and re.fullmatch(r'eyJ[\w-]+\.[\w-]+\.[\w-]{20,}', key) is None:
    fail('VITE_SUPABASE_ANON_KEY is missing, truncated or not a publishable/anon key (a bare "sb_publishable_" prefix is a library string, not a key)')
if 'service_role' in key or key.startswith('sb_secret_'): fail('never put a secret or service_role key in the frontend')
js = open(glob.glob('dist/assets/index-*.js', recursive=False)[0], encoding='utf8').read().replace('</script', '<\\/script')
html = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>'
        '<title>فريق سان چورج</title>  \n</head><body><div id="root"></div><script type="module">' + js + '\n</script></body></html>\n')
if js.count(key) != 1 or js.count(url) < 1: fail('built JS does not contain exactly the configured key/URL')
os.makedirs('dist/single', exist_ok=True)
open('dist/single/index.html', 'w', encoding='utf8').write(html)
print('wrote dist/single/index.html', len(html.encode('utf8')), 'bytes')
