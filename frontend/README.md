# Frontend Overview

The frontend is a React 19 + TypeScript application bootstrapped with Vite. It renders the ingest workflow, chat interface, and document history.

## Application Layout

- **`src/pages/HomePage.tsx`**: Main view orchestrating the hero, ingest controls, chat UI, and history sidebar.
- **Components**:
  - `HeroCard`: Introductory hero section.
  - `IngestCard`: URL input + ingestion progress + status messaging.
  - `QuestionCard`: Chat input form.
  - `ChatHistory`: Renders question/answer history with lightweight markdown support.
  - `DocumentHistoryCard`: Lists previously ingested URLs with metadata, enabling quick reload.

Material UI provides layout primitives (Paper, Stack, Typography) and icons from `@mui/icons-material`.

## API Layer

Located in `src/api`:
- `ingest.ts`: wraps ingestion endpoints (`POST /api/ingest`, `GET /api/ingest/status`).
- `chat.ts`: handles chat requests to `/api/chat`.
- `documents.ts`: fetches summaries from `/api/documents`.

Each file reads `import.meta.env.VITE_API_BASE_URL` and throws a descriptive error if missing.

## State Flow

`HomePage` tracks:
- `ingestStatus`: `idle | loading | success | error`.
- `ingestMessage` / `ingestError`: status copy for the UI.
- `chatHistory`: question/answer pairs.
- `documents`: list of summaries for the history column.

Polling uses `setInterval` stored in refs to avoid duplicate timers. Selecting a document either loads stored history or resumes polling based on its status.

## Styling

- Material UI theme lives in `src/main.tsx` (shape, palette, typography).
- Components use MUI’s `sx` prop for responsive spacing and layout.
- The app layout (`src/layout/AppLayout.tsx`) wraps content with global padding and container sizing.

## Development

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in a `.env` file or your shell (e.g., `http://localhost:3001`).

## Production Build

```bash
npm run build
npm run preview
```

## Deployment

- Dockerfile builds the Vite app and serves it via `nginx:alpine`.
- `docker-compose.yml` passes `VITE_API_BASE_URL` as a build arg (defaults to `https://api.rag.murdix.com` but overrideable).

## Testing the UI

1. Start backend locally.
2. Run `npm run dev` in frontend.
3. Set `VITE_API_BASE_URL=http://localhost:3001`.
4. Ingest a Wikipedia URL, observe progress, and ask questions.
5. Confirm history list updates and reloads stored conversations.
