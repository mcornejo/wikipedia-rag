#!/usr/bin/env bash
set -euo pipefail

# Dead-simple deploy script
# - Rsync project to remote
# - Build and (re)start docker-compose

HOST=${HOST:-rag.murdix.com}
# Use a path relative to the remote user's home by default to avoid local tilde expansion
REMOTE_DIR=${REMOTE_DIR:-rag}
VITE_API_BASE_URL=${VITE_API_BASE_URL:-https://api.rag.murdix.com}

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "ERROR: OPENAI_API_KEY must be set in your local environment before deploying." >&2
  exit 1
fi

escaped_openai_key=$(printf '%q' "$OPENAI_API_KEY")
escaped_vite_api_base=$(printf '%q' "$VITE_API_BASE_URL")

echo "Deploying to ${HOST}:~/${REMOTE_DIR}"

# Create remote dir
ssh "$HOST" "mkdir -p '${REMOTE_DIR}'"

# Rsync files (exclude heavy/dev artifacts)
rsync -az --delete \
  --exclude ".git/" \
  --exclude "node_modules/" \
  --exclude "**/node_modules/" \
  --exclude "**/dist/" \
  --exclude ".DS_Store" \
  --exclude "**/.idea/" \
  --exclude "**/.vscode/" \
  ./ "$HOST":"${REMOTE_DIR}/"

# Build and update services
ssh "$HOST" "cd ${REMOTE_DIR} && OPENAI_API_KEY=${escaped_openai_key} VITE_API_BASE_URL=${escaped_vite_api_base} docker compose up -d --build"

echo "Done. Services should be reachable at:"
echo "  Frontend: https://rag.murdix.com"
echo "  Backend:  https://api.rag.murdix.com"
