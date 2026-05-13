# Description 2

Wikipedia RAG is a minimal retrieval-augmented generation prototype. The app lets you ingest any Wikipedia article, chunk and embed its content with OpenAI embeddings, and chat against the stored context. The frontend provides a simple two-step flow (ingest + chat) while the backend orchestrates the pipeline and keeps conversations in memory.

# Tech

- **Frontend**: React 19, TypeScript, Vite, Material UI.
- **Backend**: Effect-based HTTP server running on Node 20.
- **Embeddings & LLM**: OpenAI SDK (text-embedding-3-small + chat completions).
- **Experimental Runtime**: Effect gives us structured concurrency, typed environments, and ergonomics for async workflows.

# Development

Prerequisites: Node 20, npm 10.

1. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Start the dev servers:
   ```bash
   cd frontend && npm run dev
   cd ../backend && npm run dev
   ```
3. Provide env vars:
   - Frontend: `VITE_API_BASE_URL` (e.g., http://localhost:3001).
   - Backend: `OPENAI_API_KEY` and optional `PORT`.
4. Test ingestion by pasting a Wikipedia URL and watching logs on the backend.

## Tests

- Backend unit tests (Vitest):
  ```bash
  cd backend
  npm install
  npm run test
  ```
  The suite covers ingestion helpers, pipeline happy-path / failure scenarios, and cosine similarity math.

# Deployment

## Local containers

1. Export `OPENAI_API_KEY`.
2. Run `./deploy_local.sh` to build and start docker compose with published ports (frontend on 3000, backend on 3001).
3. Visit http://localhost:3000.

## Remote

1. Set `OPENAI_API_KEY` and optionally `VITE_API_BASE_URL` in your environment.
2. Run `./deploy.sh` to sync files via rsync and run `docker compose up -d --build` on the remote host.
3. Traefik labels route frontend (rag.murdix.com) and API (api.rag.murdix.com).

## Archived
