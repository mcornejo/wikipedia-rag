import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform"
import { Effect } from "effect"
import { ingestHandler } from "../handlers/ingest.js"
import { corsHeaders } from "./constants.js"
import {
  IngestStatusQuery,
  IngestStatusResponse,
} from "../schemas/ingest.js"
import { getDocument } from "../storage/documentStore.js"

const ingestStatusHandler = Effect.gen(function* (_) {
  const { url } = yield* _(
    HttpServerRequest.schemaSearchParams(IngestStatusQuery)
  )
  const record = getDocument(url)

  if (!record) {
    return yield* _(
      HttpServerResponse.schemaJson(IngestStatusResponse)(
        { status: "not_found" },
        {
          status: 404,
          headers: corsHeaders,
        }
      )
    )
  }

  const body = {
    status: record.status,
    ...(record.chunks ? { chunks: record.chunks.length } : {}),
  } as const

  const statusCode =
    record.status === "completed"
      ? 200
      : record.status === "failed"
      ? 200
      : 202

  return yield* _(
    HttpServerResponse.schemaJson(IngestStatusResponse)(body, {
      status: statusCode,
      headers: corsHeaders,
    })
  )
})

export const registerIngestRoutes = <E, R>(
  router: HttpRouter.HttpRouter<E, R>
) =>
  router.pipe(
    HttpRouter.post("/api/ingest", ingestHandler),
    HttpRouter.get("/api/ingest/status", ingestStatusHandler),
    HttpRouter.options(
      "/api/ingest",
      HttpServerResponse.empty({
        status: 204,
        headers: corsHeaders,
      })
    )
  )
