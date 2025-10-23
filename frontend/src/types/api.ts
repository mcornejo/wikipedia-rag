export interface IngestAcceptedResponse {
  status: "accepted"
  url: string
  message: string
}

export interface IngestCompletedResponse {
  status: "completed"
  url: string
  message: string
  chunks: number
}

export interface IngestErrorResponse {
  status: "error"
  message: string
}

export type IngestResponse =
  | IngestAcceptedResponse
  | IngestCompletedResponse
  | IngestErrorResponse

export interface IngestStatusResponse {
  status: "in_progress" | "completed" | "failed" | "not_found"
  chunks?: number
}

export interface ChatMessage {
  id: string
  question: string
  answer: string
  createdAt: number
}

export interface ChatResponse {
  answer: string
  history: ChatMessage[]
}

export type DocumentStatus = "in_progress" | "completed" | "failed"

export interface DocumentSummary {
  url: string
  status: DocumentStatus
  createdAt: number
  updatedAt: number
  chunkCount: number
  historyCount: number
  lastQuestion?: string
  lastAnswerPreview?: string
}

export interface DocumentListResponse {
  documents: DocumentSummary[]
}
