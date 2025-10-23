import type { DocumentSummary, DocumentListResponse } from "../types/api"

const apiBase = import.meta.env.VITE_API_BASE_URL?.trim()

if (!apiBase) {
  throw new Error("VITE_API_BASE_URL is not defined. Did you forget to set it in .env?")
}

export const fetchDocuments = async (): Promise<DocumentSummary[]> => {
  const response = await fetch(`${apiBase}/api/documents`)

  if (!response.ok) {
    throw new Error(`Failed to fetch documents (status ${response.status})`)
  }

  const payload = (await response.json()) as DocumentListResponse
  return payload.documents
}
