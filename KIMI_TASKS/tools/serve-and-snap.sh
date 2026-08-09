#!/usr/bin/env bash
# serve-and-snap.sh <prefix> — boots `next dev` on :3100, snapshots, kills server.
set -e
PREFIX="${1:-shot}"
PORT=3100
LANG_ARG="${2:-}"

./node_modules/.bin/next dev -p $PORT > /tmp/next-dev-$PORT.log 2>&1 &
DEV_PID=$!

cleanup() {
  kill $DEV_PID 2>/dev/null || true
  # kill any child node processes of the dev server
  ps -W 2>/dev/null | awk -v pid="$DEV_PID" '$2==pid {print $1}' | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT

# wait for server
for i in $(seq 1 90); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
    break
  fi
  sleep 1
done

cd KIMI_TASKS/tools && node snap.mjs "$PREFIX" "http://localhost:$PORT" "$LANG_ARG" && cd ../..

echo "done: $PREFIX"
