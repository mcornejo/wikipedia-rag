import {
  HttpClient,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform";
import { Effect, ParseResult } from "effect";
import { runIngestPipeline } from "../pipeline/ingestPipeline.js";
import { corsHeaders } from "../routes/constants.js";
import {
  IngestRequest,
  IngestResponse,
  type IngestRequestData,
} from "../schemas/ingest.js";
import {
  getDocument,
  markDocumentInProgress,
} from "../storage/documentStore.js";

const handler = Effect.gen(function* (_) {
  const { url } = (yield *
    _(HttpServerRequest.schemaBodyJson(IngestRequest))) as IngestRequestData;
  const client = yield * _(HttpClient.HttpClient);

  const existing = getDocument(url);

  if (existing?.status === "in_progress") {
    return yield * _(
      HttpServerResponse.schemaJson(IngestResponse)(
        {
          status: "accepted",
          url,
          message: "Ingestion already in progress",
        },
        {
          status: 202,
          headers: corsHeaders,
        }
      )
    );
  }

  if (existing?.status === "completed") {
    const chunkCount = existing.chunks?.length ?? 0;
    return yield * _(
      HttpServerResponse.schemaJson(IngestResponse)(
        {
          status: "completed",
          url,
          message: `Ingestion already completed (${chunkCount} chunks cached)`,
          chunks: chunkCount,
        },
        {
          status: 200,
          headers: corsHeaders,
        }
      )
    );
  }

  const startedMessage =
    existing?.status === "failed"
      ? "Retrying ingestion after a previous failure"
      : "Ingestion started";

  markDocumentInProgress(url);

  yield * _(Effect.forkDaemon(runIngestPipeline(url, client)));

  return yield * _(
    HttpServerResponse.schemaJson(IngestResponse)(
      {
        status: "accepted",
        url,
        message: startedMessage,
      },
      {
        status: 202,
        headers: corsHeaders,
      }
    )
  );
});

export const ingestHandler = handler.pipe(
  Effect.catchAll((error) => {
    const isParseError = ParseResult.isParseError(error);
    const message = isParseError
      ? ParseResult.TreeFormatter.formatErrorSync(error)
      : error instanceof Error
      ? error.message
      : "Unexpected error";

    const status = isParseError ? 400 : 500;

    return HttpServerResponse.schemaJson(IngestResponse)(
      {
        status: "error",
        message,
      },
      {
        status,
        headers: corsHeaders,
      }
    );
  })
);
