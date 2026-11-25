#!/bin/bash
cd /downloads/sg-theater && npx vite build -c vite.mock.config.js 2>&1 | tail -2
cd dist-mock; python3 -m http.server 4180 >/dev/null 2>&1 &
PID=$!; sleep 1
mkdir -p /downloads/shots
for spec in "390,900,phone" "1280,800,desktop"; do
 IFS=, read W H N <<< "$spec"
 for M in out in; do Q=""; [ $M = in ] && Q="?in"
  google-chrome --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=${W},${H} --virtual-time-budget=4000 --screenshot=/downloads/shots/${N}-${M}.png "http://localhost:4180/${Q}" >/dev/null 2>&1
 done
done
kill $PID; ls -la /downloads/shots
