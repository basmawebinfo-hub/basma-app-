#!/usr/bin/env bash
# serve-and-measure.sh <prefix> — boots `next dev` on :3100, runs measure-h.mjs, kills server.
set -e
PREFIX="${1:-before}"
PORT=3100

./node_modules/.bin/next dev -p $PORT > /tmp/next-dev-$PORT.log 2>&1 &
DEV_PID=$!

cleanup() {
  kill $DEV_PID 2>/dev/null || true
  ps -W 2>/dev/null | awk -v pid="$DEV_PID" '$2==pid {print $1}' | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT

for i in $(seq 1 90); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
    break
  fi
  sleep 1
done

cd KIMI_TASKS/tools && node measure-h.mjs "$PREFIX" "http://localhost:$PORT" && cd ../..

echo "done: $PREFIX"
