import { HttpRouter, HttpServerResponse } from "@effect/platform"
import { chatHandler, chatHistoryHandler } from "../handlers/chat.js"
import { corsHeaders } from "./constants.js"

export const registerChatRoutes = <E, R>(
  router: HttpRouter.HttpRouter<E, R>
) =>
  router.pipe(
    HttpRouter.post("/api/chat", chatHandler),
    HttpRouter.options(
      "/api/chat",
      HttpServerResponse.empty({ status: 204, headers: corsHeaders })
    ),
    HttpRouter.get("/api/chat/history", chatHistoryHandler),
    HttpRouter.options(
      "/api/chat/history",
      HttpServerResponse.empty({ status: 204, headers: corsHeaders })
    )
  )
