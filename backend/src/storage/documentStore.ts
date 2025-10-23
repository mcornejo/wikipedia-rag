// NOTE: This module intentionally keeps everything in memory. It works great for the
// early prototype phase—no external dependencies and instant lookups—but nothing is
// persisted between restarts. When we need durability or larger datasets, we can swap
// this out for a lightweight cache (e.g. an LRU library) or move to a real vector store.
//
// Because Node caches ES modules, the "documents" map below behaves like a singleton:
// the first import creates it, and every subsequent import shares the same instance for
// the lifetime of the server process.

export type DocumentStatus = "in_progress" | "completed" | "failed"

export interface StoredChunk {
  id: string
  content: string
  embedding: number[]
}

export interface ChatEntry {
  id: string
  question: string
  answer: string
  createdAt: number
}

export interface StoredDocument {
  url: string
  status: DocumentStatus
  createdAt: number
  updatedAt: number
  rawText?: string
  chunks?: StoredChunk[]
  history?: ChatEntry[]
}

const documents = new Map<string, StoredDocument>()

export const getDocument = (url: string) => documents.get(url)

export const listDocuments = () => Array.from(documents.values())

const withDefaults = (
  existing: StoredDocument | undefined,
  overrides: Partial<StoredDocument>
): StoredDocument => ({
  url: overrides.url ?? existing?.url ?? "",
  status: overrides.status ?? existing?.status ?? "in_progress",
  createdAt: overrides.createdAt ?? existing?.createdAt ?? Date.now(),
  updatedAt: overrides.updatedAt ?? Date.now(),
  rawText: overrides.rawText ?? existing?.rawText,
  chunks: overrides.chunks ?? existing?.chunks,
  history: overrides.history ?? existing?.history ?? [],
})

export const markDocumentInProgress = (url: string) => {
  const existing = documents.get(url)
  const record = withDefaults(existing, {
    url,
    status: "in_progress",
    updatedAt: Date.now(),
    rawText: undefined,
    chunks: undefined,
  })
  documents.set(url, record)
  return record
}

export const setDocumentData = (url: string, data: {
  rawText: string
  chunks: StoredChunk[]
}) => {
  const existing = documents.get(url)
  const record = withDefaults(existing, {
    url,
    rawText: data.rawText,
    chunks: data.chunks,
    updatedAt: Date.now(),
  })
  documents.set(url, record)
  return record
}

export const markDocumentCompleted = (url: string) => {
  const existing = documents.get(url)
  const record = withDefaults(existing, {
    url,
    status: "completed",
    updatedAt: Date.now(),
  })
  documents.set(url, record)
  return record
}

export const markDocumentFailed = (url: string) => {
  const existing = documents.get(url)
  const record = withDefaults(existing, {
    url,
    status: "failed",
    updatedAt: Date.now(),
  })
  documents.set(url, record)
  return record
}

export const getChatHistory = (url: string) =>
  documents.get(url)?.history ?? []

export const appendChatEntry = (url: string, entry: ChatEntry) => {
  const existing = documents.get(url)
  if (!existing) {
    return undefined
  }
  const record: StoredDocument = {
    ...existing,
    history: [...(existing.history ?? []), entry],
    updatedAt: Date.now(),
  }
  documents.set(url, record)
  return record
}
