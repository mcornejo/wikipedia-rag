import { HttpRouter, HttpServerResponse } from "@effect/platform"
import { pipe } from "effect/Function"
import { corsHeaders } from "./constants.js"
import { registerIngestRoutes } from "./ingest.js"
import { registerChatRoutes } from "./chat.js"
import { registerDocumentRoutes } from "./documents.js"

const registerBaseRoutes = <E, R>(router: HttpRouter.HttpRouter<E, R>) =>
  router.pipe(
    HttpRouter.get(
      "/health",
      HttpServerResponse.json({ status: "ok" }, { headers: corsHeaders })
    ),
    HttpRouter.get(
      "/",
      HttpServerResponse.text("Wikipedia RAG backend is running", {
        headers: corsHeaders,
      })
    )
  )

export const createRouter = () =>
  pipe(
    HttpRouter.empty,
    registerBaseRoutes,
    registerIngestRoutes,
    registerChatRoutes,
    registerDocumentRoutes
  )
