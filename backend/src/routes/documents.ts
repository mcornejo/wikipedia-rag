import { HttpRouter } from "@effect/platform"
import { listDocumentsHandler } from "../handlers/documents.js"

export const registerDocumentRoutes = <E, R>(
  router: HttpRouter.HttpRouter<E, R>
) =>
  router.pipe(HttpRouter.get("/api/documents", listDocumentsHandler))
