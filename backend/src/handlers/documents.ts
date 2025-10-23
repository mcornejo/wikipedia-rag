import { HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { corsHeaders } from "../routes/constants.js"
import { DocumentListResponse } from "../schemas/documents.js"
import { listDocuments } from "../storage/documentStore.js"

const truncate = (value: string, max = 160) =>
  value.length > max ? `${value.slice(0, max - 3)}...` : value

export const listDocumentsHandler = Effect.gen(function* (_) {
  const documents = listDocuments()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((doc) => {
      const history = doc.history ?? []
      const latest = history[history.length - 1]

      return {
        url: doc.url,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        chunkCount: doc.chunks?.length ?? 0,
        historyCount: history.length,
        lastQuestion: latest?.question,
        lastAnswerPreview: latest ? truncate(latest.answer) : undefined,
      }
    })

  return yield* _(
    HttpServerResponse.schemaJson(DocumentListResponse)(
      { documents },
      { headers: corsHeaders }
    )
  )
})
