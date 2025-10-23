import { HttpClient } from "@effect/platform";
import { Effect } from "effect";
import { randomUUID } from "node:crypto";
import {
  markDocumentCompleted,
  markDocumentFailed,
  setDocumentData,
} from "../storage/documentStore.js";
import { getOpenAIClient } from "../utils/openai.js";

const openAIModel = "text-embedding-3-small";

// Build the Wikipedia API endpoint that returns a clean plaintext extract for the page.
export const buildWikipediaExtractUrl = (url: string) => {
  const parsed = new URL(url);
  const match = parsed.pathname.match(/\/wiki\/(.+)$/);
  if (!match) {
    throw new Error("Invalid Wikipedia URL");
  }
  const title = match[1];
  const normalizedOrigin = parsed.origin.replace(
    /\.m\.wikipedia\.org$/,
    ".wikipedia.org"
  );
  const apiUrl = new URL("/w/api.php", normalizedOrigin);
  apiUrl.searchParams.set("action", "query");
  apiUrl.searchParams.set("prop", "extracts");
  apiUrl.searchParams.set("format", "json");
  apiUrl.searchParams.set("explaintext", "true");
  apiUrl.searchParams.set("redirects", "1");
  apiUrl.searchParams.set("titles", decodeURIComponent(title));
  apiUrl.searchParams.set("origin", "*");
  return apiUrl.toString();
};

// Call the Wikipedia API via the shared HttpClient and return the raw extract text.
const fetchWikipediaExtract = (client: HttpClient.HttpClient, url: string) =>
  Effect.gen(function* (_) {
    const apiUrl = buildWikipediaExtractUrl(url);
    const response = yield* _(
      client.get(apiUrl, {
        headers: {
          "user-agent":
            "WikipediaRAG/1.0 (+https://github.com/mcornejo/wikipedia-rag)",
          accept: "application/json",
        },
      })
    );

    if (response.status >= 400) {
      return yield* Effect.fail(
        new Error(`Wikipedia API request failed (${response.status})`)
      );
    }

    const payload = (yield* _(response.json)) as any;
    const pages = payload?.query?.pages;
    const page = pages
      ? (Object.values(pages)[0] as { extract?: unknown })
      : undefined;
    const extract =
      typeof page?.extract === "string" ? page.extract : undefined;

    if (!extract || extract.trim().length === 0) {
      return yield* Effect.fail(new Error("Wikipedia extract not available"));
    }

    return extract as string;
  });

// Remove noise like excess whitespace, citation markers, and other fluff from the extract.
export const normalizeExtract = (extract: string) =>
  extract
    .replace(/\s+/g, " ")
    .replace(/\[\d+\]/g, "")
    .replace(/\(listen\)/gi, "")
    .trim();
 
/*
Break the cleaned article into manageable chunks that fit within embedding limits.

We take the raw Wikipedia extract, split it on blank lines (text.split(/\n{2,}/)), 
strip each paragraph, and greedily accumulate them into chunks until adding another paragraph would exceed ~1,200 characters. 
That keeps each chunk small enough to embed efficiently while preserving a few sentences of context.
*/
export const chunkContent = (text: string, maxChars = 1200) => {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if ((current + "\n\n" + trimmed).length > maxChars && current) {
      chunks.push(current.trim());
      current = trimmed;
    } else {
      current = current ? `${current}\n\n${trimmed}` : trimmed;
    }
  }

  if (current) {
    chunks.push(current.trim());
  }

  return chunks;
};

// Ask OpenAI for embeddings for each chunk and return the resulting vector list.
const embedChunks = (chunks: string[]) =>
  Effect.tryPromise({
    try: async () => {
      const client = getOpenAIClient();
      const result = await client.embeddings.create({
        model: openAIModel,
        input: chunks,
      });
      return result.data.map((item) => item.embedding);
    },
    catch: (error) => error as Error,
  });

// Orchestrate the full ingestion flow: fetch, clean, chunk, embed, and persist.
export const runIngestPipeline = (url: string, client: HttpClient.HttpClient) =>
  Effect.gen(function* (_) {
    const rawExtract = yield* _(fetchWikipediaExtract(client, url));
    const cleaned = normalizeExtract(rawExtract);
    const chunks = chunkContent(cleaned);

    if (chunks.length === 0) {
      markDocumentFailed(url);
      yield* Effect.logWarning(`No content chunks generated for ${url}`);
      return;
    }

    const embeddings = yield* _(embedChunks(chunks));

    if (embeddings.length !== chunks.length) {
      return (
        yield * Effect.fail(new Error("Embedding response length mismatch"))
      );
    }

    const chunkRecords = chunks.map((content, index) => ({
      id: randomUUID(),
      content,
      embedding: embeddings[index],
    }));

    setDocumentData(url, {
      rawText: cleaned,
      chunks: chunkRecords,
    });
    markDocumentCompleted(url);

    yield * Effect.logInfo(`Ingested ${chunkRecords.length} chunks for ${url}`);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.sync(() => {
        markDocumentFailed(url);
      }).pipe(
        Effect.zipRight(
          Effect.logError(
            `Ingestion pipeline failed for ${url}: ${String(error)}`
          )
        )
      )
    )
  );
