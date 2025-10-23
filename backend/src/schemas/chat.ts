import { Schema } from "effect"
import { WikipediaUrl } from "./ingest.js"

export const ChatRequest = Schema.Struct({
  url: WikipediaUrl,
  question: Schema.NonEmptyTrimmedString,
})

export const ChatMessage = Schema.Struct({
  id: Schema.String,
  question: Schema.String,
  answer: Schema.String,
  createdAt: Schema.Number,
})

export const ChatResponse = Schema.Struct({
  answer: Schema.String,
  history: Schema.Array(ChatMessage),
})

export const ChatHistoryResponse = Schema.Struct({
  history: Schema.Array(ChatMessage),
})

export type ChatRequestData = Schema.Schema.Type<typeof ChatRequest>
export type ChatMessageData = Schema.Schema.Type<typeof ChatMessage>
export type ChatResponseData = Schema.Schema.Type<typeof ChatResponse>
export type ChatHistoryResponseData = Schema.Schema.Type<typeof ChatHistoryResponse>
