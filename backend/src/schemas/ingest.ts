import { Schema } from "effect"

export const WikipediaUrl = Schema.NonEmptyTrimmedString.pipe(
  Schema.pattern(/^https?:\/\/.+$/i)
)

export const IngestRequest = Schema.Struct({
  url: WikipediaUrl,
})

export const IngestAccepted = Schema.Struct({
  status: Schema.Literal("accepted"),
  url: Schema.String,
  message: Schema.String,
})

export const IngestCompleted = Schema.Struct({
  status: Schema.Literal("completed"),
  url: Schema.String,
  message: Schema.String,
  chunks: Schema.Number,
})

export const IngestFailure = Schema.Struct({
  status: Schema.Literal("error"),
  message: Schema.String,
})

export const IngestResponse = Schema.Union(
  IngestAccepted,
  IngestCompleted,
  IngestFailure
)

export type IngestRequestData = Schema.Schema.Type<typeof IngestRequest>

export const IngestStatusQuery = Schema.Struct({
  url: WikipediaUrl,
})

export const IngestStatusResponse = Schema.Struct({
  status: Schema.Union(
    Schema.Literal("in_progress"),
    Schema.Literal("completed"),
    Schema.Literal("failed"),
    Schema.Literal("not_found")
  ),
  chunks: Schema.optional(Schema.Number),
})

export type IngestStatusQueryData = Schema.Schema.Type<typeof IngestStatusQuery>
export type IngestStatusResponseData = Schema.Schema.Type<typeof IngestStatusResponse>
