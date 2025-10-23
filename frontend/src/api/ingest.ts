import type { IngestResponse, IngestStatusResponse } from "../types/api"

const apiBase = import.meta.env.VITE_API_BASE_URL?.trim()

if (!apiBase) {
  throw new Error("VITE_API_BASE_URL is not defined. Did you forget to set it in .env?")
}

const ingestEndpoint = `${apiBase}/api/ingest`
const ingestStatusEndpoint = `${apiBase}/api/ingest/status`

export const ingestPage = async (url: string): Promise<IngestResponse> => {
  try {
    const response = await fetch(ingestEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    const payload = (await response.json()) as IngestResponse

    if (!response.ok && payload.status !== "error") {
      return {
        status: "error",
        message: `Failed to fetch URL (status ${response.status})`,
      }
    }

    return payload
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to reach the ingestion service.",
    }
  }
}

export const fetchIngestStatus = async (url: string): Promise<IngestStatusResponse> => {
  try {
    const response = await fetch(
      `${ingestStatusEndpoint}?url=${encodeURIComponent(url)}`
    )

    if (response.status === 404) {
      return { status: "not_found" }
    }

    if (!response.ok) {
      return { status: "failed" }
    }

    return (await response.json()) as IngestStatusResponse
  } catch (error) {
    console.error(error)
    return { status: "failed" }
  }
}
