import { Schema } from "effect"

const DocumentStatusSchema = Schema.Union(
  Schema.Literal("in_progress"),
  Schema.Literal("completed"),
  Schema.Literal("failed")
)

export const DocumentSummary = Schema.Struct({
  url: Schema.String,
  status: DocumentStatusSchema,
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
  chunkCount: Schema.Number,
  historyCount: Schema.Number,
  lastQuestion: Schema.optional(Schema.String),
  lastAnswerPreview: Schema.optional(Schema.String),
})

export const DocumentListResponse = Schema.Struct({
  documents: Schema.Array(DocumentSummary),
})

export type DocumentSummaryData = Schema.Schema.Type<typeof DocumentSummary>
export type DocumentListResponseData = Schema.Schema.Type<typeof DocumentListResponse>
