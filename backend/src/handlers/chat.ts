import {
  HttpClient,
  HttpServerRequest,
  HttpServerResponse,
} from "@effect/platform"
import { Effect } from "effect"
import { randomUUID } from "node:crypto"
import { getOpenAIClient } from "../utils/openai.js"
import {
  appendChatEntry,
  getChatHistory,
  getDocument,
} from "../storage/documentStore.js"
import { corsHeaders } from "../routes/constants.js"
import {
  ChatHistoryResponse,
  ChatRequest,
  ChatResponse,
  type ChatRequestData,
} from "../schemas/chat.js"
import { IngestStatusQuery } from "../schemas/ingest.js"

const embeddingModel = "text-embedding-3-small"
const chatModel = "gpt-4o-mini"

export const cosineSimilarity = (a: number[], b: number[]) => {
  const length = Math.min(a.length, b.length)
  let dot = 0
  let magA = 0
  let magB = 0

  for (let index = 0; index < length; index += 1) {
    const av = a[index]
    const bv = b[index]
    dot += av * bv
    magA += av * av
    magB += bv * bv
  }

  if (magA === 0 || magB === 0) {
    return 0
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

const summarizeHistory = (entries: ReturnType<typeof getChatHistory>) =>
  entries
    .map(
      (entry, index) =>
        `Q${index + 1}: ${entry.question}\nA${index + 1}: ${entry.answer}`
    )
    .join("\n\n")

const buildContext = (chunks: { content: string }[]) =>
  chunks
    .map((chunk, index) => `Chunk ${index + 1}:\n${chunk.content}`)
    .join("\n\n")

export const chatHandler = Effect.gen(function* (_) {
  const { url, question } = (yield* _(
    HttpServerRequest.schemaBodyJson(ChatRequest)
  )) as ChatRequestData
  const httpClient = yield* _(HttpClient.HttpClient)

  const document = getDocument(url)

  if (!document || document.status !== "completed" || !document.chunks) {
    return yield* _(
      HttpServerResponse.schemaJson(ChatResponse)(
        {
          answer: "Ingestion has not completed for this URL yet.",
          history: getChatHistory(url),
        },
        {
          status: 409,
          headers: corsHeaders,
        }
      )
    )
  }

  const openai = getOpenAIClient()

  const questionEmbeddingResponse = yield* _(
    Effect.tryPromise({
      try: async () => {
        const embedding = await openai.embeddings.create({
          model: embeddingModel,
          input: question,
        })
        return embedding.data[0]?.embedding ?? []
      },
      catch: (error) => error as Error,
    })
  )

  const scoredChunks = document.chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(questionEmbeddingResponse, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)

  const topChunks = scoredChunks.slice(0, 3).map((entry) => entry.chunk)
  const context = buildContext(topChunks)
  const historyEntries = getChatHistory(url)
  const historyText = summarizeHistory(historyEntries)

  const prompt = `You are an assistant answering questions about a Wikipedia article. Use ONLY the provided context.\n\nContext:\n${context}\n\nPrevious Q&A (optional):\n${historyText || "None"}\n\nQuestion: ${question}\nAnswer:`

  const answer = yield* _(
    Effect.tryPromise({
      try: async () => {
        const response = await openai.responses.create({
          model: chatModel,
          input: prompt,
        })
        return response.output_text?.trim() ?? "I'm sorry, I couldn't find the answer."
      },
      catch: (error) => error as Error,
    })
  )

  const entry = {
    id: randomUUID(),
    question,
    answer,
    createdAt: Date.now(),
  }

  const updatedDocument = appendChatEntry(url, entry)
  const history = updatedDocument?.history ?? [...historyEntries, entry]

  return yield* _(
    HttpServerResponse.schemaJson(ChatResponse)(
      {
        answer,
        history,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  )
})

export const chatHistoryHandler = Effect.gen(function* (_) {
  const { url } = yield* _(
    HttpServerRequest.schemaSearchParams(IngestStatusQuery)
  )
  const history = getChatHistory(url)

  return yield* _(
    HttpServerResponse.schemaJson(ChatHistoryResponse)(
      { history },
      {
        status: 200,
        headers: corsHeaders,
      }
    )
  )
})
