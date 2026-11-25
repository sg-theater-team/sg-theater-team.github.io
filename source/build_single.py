#!/usr/bin/env python3
"""Run after `npm run build`. Inlines dist/assets/index-*.js into one self-contained dist/single/index.html (the file GitHub Pages serves)."""
import glob, os
js = open(glob.glob('dist/assets/index-*.js', recursive=False)[0], encoding='utf8').read().replace('</script', '<\\/script')
html = ('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>'
        '<title>فريق سان چورج</title>  \n</head><body><div id="root"></div><script type="module">' + js + '\n</script></body></html>\n')
os.makedirs('dist/single', exist_ok=True)
open('dist/single/index.html', 'w', encoding='utf8').write(html)
print('wrote dist/single/index.html', len(html.encode('utf8')), 'bytes')
