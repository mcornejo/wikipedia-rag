#!/usr/bin/env bash
set -euo pipefail

# Run docker compose locally with the right env configuration.

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "ERROR: OPENAI_API_KEY must be set before running deploy_local.sh." >&2
  exit 1
fi

VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:3001}

# Ensure the shared Traefik network exists even when running locally.
if ! docker network inspect tcc_backend >/dev/null 2>&1; then
  echo "Creating docker network 'tcc_backend'..."
  docker network create tcc_backend
fi

echo "Starting local stack..."
OPENAI_API_KEY="${OPENAI_API_KEY}" \
  VITE_API_BASE_URL="${VITE_API_BASE_URL}" \
  docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build

echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
