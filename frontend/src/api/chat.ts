import type { ChatMessage, ChatResponse } from "../types/api"

const apiBase = import.meta.env.VITE_API_BASE_URL?.trim()

if (!apiBase) {
  throw new Error("VITE_API_BASE_URL is not defined. Did you forget to set it in .env?")
}

const chatEndpoint = `${apiBase}/api/chat`
const chatHistoryEndpoint = `${apiBase}/api/chat/history`

export const sendChatMessage = async (
  url: string,
  question: string
): Promise<ChatResponse> => {
  const response = await fetch(chatEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ url, question }),
  })

  if (!response.ok) {
    let message = `Chat request failed with status ${response.status}`
    try {
      const payload = (await response.json()) as Partial<ChatResponse>
      if (payload?.answer) {
        message = payload.answer
      }
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(message)
  }

  return (await response.json()) as ChatResponse
}

export const fetchChatHistory = async (
  url: string
): Promise<ChatMessage[]> => {
  const response = await fetch(
    `${chatHistoryEndpoint}?url=${encodeURIComponent(url)}`
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch chat history (${response.status})`)
  }

  const payload = (await response.json()) as { history: ChatMessage[] }
  return payload.history
}
