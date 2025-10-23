import { describe, expect, it, vi, beforeEach } from "vitest"
import { Effect } from "effect"
import type { HttpClient } from "@effect/platform"

vi.mock("../storage/documentStore.js", () => ({
  markDocumentCompleted: vi.fn(),
  markDocumentFailed: vi.fn(),
  setDocumentData: vi.fn(),
}))

vi.mock("../utils/openai.js", () => ({
  getOpenAIClient: vi.fn(() => ({
    embeddings: {
      create: vi.fn(async ({ input }: { input: string[] | string }) => {
        const array = Array.isArray(input) ? input : [input]
        return {
          data: array.map(() => ({ embedding: [1, 0, 0] })),
        }
      }),
    },
  })),
}))

import {
  buildWikipediaExtractUrl,
  normalizeExtract,
  chunkContent,
  runIngestPipeline,
} from "./ingestPipeline.js"
import {
  markDocumentCompleted,
  markDocumentFailed,
  setDocumentData,
} from "../storage/documentStore.js"
import { getOpenAIClient } from "../utils/openai.js"

const makeHttpClient = (response: { status: number; payload: unknown }) => {
  const client: Partial<HttpClient.HttpClient> = {
    get: vi.fn(() =>
      Effect.succeed({
        status: response.status,
        json: Effect.succeed(response.payload),
      })
    ),
  }

  return client as HttpClient.HttpClient
}

describe("ingestPipeline helpers", () => {
  it("builds Wikipedia API URL", () => {
    const url = buildWikipediaExtractUrl(
      "https://en.wikipedia.org/wiki/Artificial_intelligence"
    )
    expect(url).toContain("https://en.wikipedia.org/w/api.php")
    expect(url).toContain("titles=Artificial_intelligence")
    expect(url).toContain("origin=%2A")
  })

  it("normalizes mobile host for API URL", () => {
    const url = buildWikipediaExtractUrl("https://fr.m.wikipedia.org/wiki/Paris")
    expect(url).toContain("https://fr.wikipedia.org/w/api.php")
  })

  it("throws for invalid URLs", () => {
    expect(() => buildWikipediaExtractUrl("https://example.com/foo"))
      .toThrowError()
  })

  it("normalizes extract text", () => {
    const text = "Hello   world [1]\n\n(Listen)"
    expect(normalizeExtract(text)).toBe("Hello world")
  })

  it("chunks text respecting limit", () => {
    const source = [
      "Paragraph one",
      "Paragraph two",
      "Paragraph three",
    ].join("\n\n")
    const result = chunkContent(source, 20)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe("Paragraph one")
  })
})

describe("runIngestPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const url = "https://en.wikipedia.org/wiki/Test"

  it("persists document data on success", async () => {
    const client = makeHttpClient({
      status: 200,
      payload: {
        query: {
          pages: {
            1: {
              extract: "First paragraph.\n\nSecond paragraph.",
            },
          },
        },
      },
    })

    await Effect.runPromise(runIngestPipeline(url, client))

    expect(client.get).toHaveBeenCalled()
    const setDataMock = vi.mocked(setDocumentData)
    expect(setDataMock).toHaveBeenCalledTimes(1)
    const [calledUrl, payload] = setDataMock.mock.calls[0]
    expect(calledUrl).toBe(url)
    expect(payload.rawText).toContain("First paragraph")
    expect(payload.chunks).toHaveLength(2)
    expect(markDocumentCompleted).toHaveBeenCalled()
    expect(markDocumentFailed).not.toHaveBeenCalled()
    expect(getOpenAIClient).toHaveBeenCalled()
  })

  it("marks document as failed on fetch error", async () => {
    const client = makeHttpClient({ status: 500, payload: {} })

    await Effect.runPromise(runIngestPipeline(url, client))

    expect(markDocumentFailed).toHaveBeenCalled()
    expect(setDocumentData).not.toHaveBeenCalled()
    expect(markDocumentCompleted).not.toHaveBeenCalled()
  })
})
