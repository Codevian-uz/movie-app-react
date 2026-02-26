#!/bin/bash
set -euo pipefail

# prepare-e2e.sh
#
# Prepares the environment for E2E tests by:
# 1. Cloning the Go backend repo (cached by ref)
# 2. Starting the backend (which starts its own infra: Postgres, Redis, etc.)
# 3. Waiting for the backend to be healthy
#
# Environment variables:
#   BACKEND_REF  - Git ref to checkout (default: main)
#   BACKEND_URL  - Backend URL (default: http://localhost:9876)
#
# Prerequisites:
#   - Docker running (for backend infrastructure)
#   - Git installed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BACKEND_REF="${BACKEND_REF:-master}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8081}" # should be consistent with backends config
BACKEND_DIR="$PROJECT_ROOT/tmp/backend"
BACKEND_REPO="https://github.com/Codevian-uz/movie-app-go.git"
HEALTH_TIMEOUT=30

echo "=== React Enterprise Blueprint: Prepare E2E ==="
echo "Backend ref: $BACKEND_REF"

# Clone or update backend
if [ -d "$BACKEND_DIR/.git" ]; then
	CURRENT_REF=$(cd "$BACKEND_DIR" && git rev-parse HEAD)
	TARGET_REF=$(git ls-remote "$BACKEND_REPO" "$BACKEND_REF" | cut -f1)

	if [ "$CURRENT_REF" = "$TARGET_REF" ]; then
		echo "Backend already at $BACKEND_REF ($CURRENT_REF), skipping clone"
	else
		echo "Backend ref changed, re-cloning..."
		rm -rf "$BACKEND_DIR"
		git clone --depth 1 --branch "$BACKEND_REF" "$BACKEND_REPO" "$BACKEND_DIR"
	fi
else
	echo "Cloning backend at $BACKEND_REF..."
	mkdir -p "$PROJECT_ROOT/tmp"
	git clone --depth 1 --branch "$BACKEND_REF" "$BACKEND_REPO" "$BACKEND_DIR"
fi

# Start the backend
echo "Starting Go backend..."
(cd "$BACKEND_DIR" && ./scripts/prepare-system-test.sh)

# Wait for backend health
echo "Waiting for Go backend at $BACKEND_URL/health..."
elapsed=0
until curl -sf "$BACKEND_URL/health" >/dev/null 2>&1; do
	if [ $elapsed -ge $HEALTH_TIMEOUT ]; then
		echo "ERROR: Backend did not become healthy within ${HEALTH_TIMEOUT}s"
		exit 1
	fi
	sleep 1
	elapsed=$((elapsed + 1))
done
echo "Go backend is healthy (${elapsed}s)"

echo "=== E2E environment ready ==="
echo ""
echo "Run E2E tests with:"
echo "  pnpm test:e2e"
