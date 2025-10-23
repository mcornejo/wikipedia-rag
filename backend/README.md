# Backend Overview

The backend is an Effect-powered HTTP service that coordinates ingestion and retrieval for Wikipedia documents. It relies on the Effect runtime for structured concurrency, typed environments, and managed resource lifecycles.

## Architecture

- **Routes**: Defined under `src/routes`. There are entry points for ingestion, chat, document listing, and health.
- **Pipeline**: `src/pipeline/ingestPipeline.ts` orchestrates fetch → clean → chunk → embed → store.
- **Storage**: `src/storage/documentStore.ts` keeps documents and chat history in-memory with helper functions to mutate state.
- **Handlers**: `src/handlers` implement route logic using Effect constructs for async control.
- **Schemas**: `src/schemas` validates incoming requests and outgoing responses using `effect/Schema`.

## Key Concepts

### Effect Runtime

Effect's runtime introduces typed effects and cooperative multitasking.
- **Concurrency**: `Effect.forkDaemon` launches background tasks (e.g., ingest pipeline) without blocking HTTP responses.
- **Resource safety**: Provides deterministic cleanup via scopes. Even though this app runs mostly stateless operations, the pattern scales to more complex pipelines.

### Ingestion Pipeline

Located at `src/pipeline/ingestPipeline.ts`.

1. **URL parsing**: Extracts the page title, normalizes host (supports locale-specific Wikipedia domains).
2. **Fetch extract**: Uses Effect's `HttpClient` to call the Wikipedia API. The request is pure and typed.
3. **Normalization**: Collapses whitespace, strips citations, etc.
4. **Chunking**: Splits article into ~1,200 character segments to keep embeddings compact.
5. **Embeddings**: Calls OpenAI `text-embedding-3-small` for each chunk.
6. **Storage**: Saves raw text, chunks, and embeddings in the document store.
7. **Completion**: Marks status and logs.

### Parallelism

When embedding, the OpenAI client batches chunks in a single request. For fetches, we rely on Effect's capability to fork tasks (e.g., ingestion continues after returning `202 Accepted`). Further parallel enhancements could include running chunk embedding in parallel by splitting the array and using `Effect.forEachPar` — the current parallelism comes from OpenAI's multi-input embedding call and the asynchronous pipeline.

### Similarity Search

`src/storage/documentStore.ts` currently stores embeddings and performs cosine similarity in `src/handlers/chat.ts` during retrieval:
- Normalize embeddings.
- Compute dot product to rank chunks.
- Select the top matches to provide context for the completion model.

### Models

`text-embedding-3-small`: efficient embedding model used for chunk vectors.
`gpt-4o-mini` (configurable): used for chat completion to answer queries.

## Routes & Schemas

- **`POST /api/ingest`**: Validated via `schemas/ingest.ts`. Returns `accepted`, `completed`, or `error` responses. Launches ingestion asynchronously.
- **`GET /api/ingest/status`**: Poll ingestion state; includes chunk counts.
- **`POST /api/chat`**: Validated via `schemas/chat.ts`. Runs similarity search and streams results.
- **`GET /api/documents`**: Lists known documents with metadata.
- **`GET /health`**: Basic readiness check.

## Local Development

```bash
cd backend
npm install
npm run dev
```

Set environment variables:
- `OPENAI_API_KEY`: required.
- `PORT`: optional (default 3001).

### Tests

Run the Vitest suite:

```bash
npm run test
```

This exercises URL building, extract normalization/chunking, pipeline success + failure paths, and cosine similarity calculations.

## Testing the Pipeline

1. Start the backend.
2. POST to `/api/ingest` with `{ "url": "https://en.wikipedia.org/wiki/Artificial_intelligence" }`.
3. Watch logs for ingestion progress.
4. Poll `/api/ingest/status?url=...` or wait for `completed`.
5. POST to `/api/chat` with a question.

## Deployment Notes

- Dockerfile builds a production bundle with `npm ci` + `npm run build`.
- `docker-compose.yml` expects `OPENAI_API_KEY` and shared `tcc_backend` network for Traefik.
- `deploy.sh` syncs via rsync and runs compose on remote host.
