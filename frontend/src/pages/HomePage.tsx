import { Box, Stack } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import { fetchChatHistory, sendChatMessage } from "../api/chat"
import { fetchDocuments } from "../api/documents"
import { fetchIngestStatus, ingestPage } from "../api/ingest"
import ChatHistory from "../components/ChatHistory"
import DocumentHistoryCard from "../components/DocumentHistoryCard"
import HeroCard from "../components/HeroCard"
import IngestCard from "../components/IngestCard"
import QuestionCard from "../components/QuestionCard"
import type { ChatMessage, DocumentSummary } from "../types/api"

type IngestStatus = "idle" | "loading" | "success" | "error"

const HomePage = () => {
  const [wikipediaUrl, setWikipediaUrl] = useState("")
  const [question, setQuestion] = useState("")
  const [ingestStatus, setIngestStatus] = useState<IngestStatus>("idle")
  const [ingestMessage, setIngestMessage] = useState("")
  const [ingestError, setIngestError] = useState<string | undefined>()
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isAsking, setIsAsking] = useState(false)
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const pollerRef = useRef<number | null>(null)
  const pollingUrlRef = useRef<string | null>(null)

  const refreshDocuments = useCallback(async () => {
    setDocumentsLoading(true)
    try {
      const list = await fetchDocuments()
      setDocuments(list)
    } catch (error) {
      console.error(error)
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

  const loadChatHistory = useCallback(async (url: string) => {
    try {
      const history = await fetchChatHistory(url)
      setChatHistory(history)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollerRef.current !== null) {
      window.clearInterval(pollerRef.current)
      pollerRef.current = null
    }
    pollingUrlRef.current = null
  }, [])

  const checkStatus = useCallback(async () => {
    const urlToCheck = pollingUrlRef.current
    if (!urlToCheck) {
      return
    }

    const status = await fetchIngestStatus(urlToCheck)

    if (status.status === "in_progress" || status.status === "not_found") {
      setIngestStatus("loading")
      setIngestError(undefined)
      setIngestMessage("Fetching and processing URL...")
      return
    }

    if (status.status === "completed") {
      const chunkCount = status.chunks ?? 0
      const message = chunkCount > 0 ? `Processing finished (${chunkCount} chunks cached)` : "Processing finished"
      await loadChatHistory(urlToCheck)
      setIngestStatus("success")
      setIngestMessage(message)
      void refreshDocuments()
      stopPolling()
      return
    }

    if (status.status === "failed") {
      setIngestStatus("error")
      setIngestError("Ingestion failed, please try again.")
      void refreshDocuments()
      stopPolling()
    }
  }, [stopPolling, loadChatHistory, refreshDocuments])

  useEffect(() => stopPolling, [stopPolling])
  useEffect(() => {
    void refreshDocuments()
  }, [refreshDocuments])

  const handleIngest = async () => {
    stopPolling()
    setIngestStatus("loading")
    setIngestMessage("Fetching and processing URL...")
    setIngestError(undefined)
    setChatHistory([])
    setQuestion("")

    const result = await ingestPage(wikipediaUrl)

    if (result.status === "completed") {
      const message = result.chunks > 0 ? `${result.message} (${result.chunks} chunks cached)` : result.message
      await loadChatHistory(wikipediaUrl)
      setIngestStatus("success")
      setIngestMessage(message)
      void refreshDocuments()
      return
    }

    if (result.status === "accepted") {
      pollingUrlRef.current = wikipediaUrl
      await checkStatus()
      pollerRef.current = window.setInterval(() => {
        void checkStatus()
      }, 5000)
      void refreshDocuments()
      return
    }

    setIngestStatus("error")
    setIngestError(result.message)
  }

  const handleSelectDocument = useCallback(
    async (summary: DocumentSummary) => {
      stopPolling()
      setWikipediaUrl(summary.url)
      setQuestion("")
      setIngestError(undefined)

      if (summary.status === "completed") {
        setIngestStatus("loading")
        setIngestMessage("Loading saved conversation...")
        try {
          await loadChatHistory(summary.url)
          setIngestStatus("success")
          const message = summary.historyCount > 0 ? `Loaded conversation (${summary.historyCount} questions)` : "Ingestion completed."
          setIngestMessage(message)
        } catch (error) {
          console.error(error)
          setIngestStatus("error")
          setIngestError("Unable to load conversation. Please try again.")
        }
        return
      }

      if (summary.status === "in_progress") {
        setIngestStatus("loading")
        setIngestMessage("Ingestion is still processing...")
        pollingUrlRef.current = summary.url
        await checkStatus()
        pollerRef.current = window.setInterval(() => {
          void checkStatus()
        }, 5000)
        return
      }

      setIngestStatus("error")
      setIngestError("Ingestion previously failed. Try ingesting the page again.")
    },
    [stopPolling, loadChatHistory, checkStatus]
  )

  const handleAsk = async () => {
    if (!wikipediaUrl.trim() || !question.trim()) {
      return
    }

    setIsAsking(true)
    try {
      const response = await sendChatMessage(wikipediaUrl, question)
      setChatHistory(response.history)
      setQuestion("")
      setIngestError(undefined)
      setIngestMessage("Answer generated.")
    } catch (error) {
      console.error(error)
      setIngestError("Unable to retrieve an answer. Please try again.")
    } finally {
      setIsAsking(false)
    }
  }

  const handleWikipediaUrlChange = (value: string) => {
    stopPolling()
    setWikipediaUrl(value)
    setIngestStatus("idle")
    setIngestMessage("")
    setIngestError(undefined)
    setChatHistory([])
  }

  const canIngest = wikipediaUrl.trim().length > 0
  const canAsk = question.trim().length > 0
  const showStepTwo = ingestStatus === "success"

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 0, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, lg: 4 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 640,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            position: "absolute",
            top: 0,
            left: "calc(100% + 10px)",
            width: 300,
          }}
        >
          <DocumentHistoryCard
            documents={documents}
            loading={documentsLoading}
            onSelect={handleSelectDocument}
            onRefresh={() => void refreshDocuments()}
          />
        </Box>
        <Stack spacing={3} width="100%">
          <HeroCard />
          <IngestCard
            wikipediaUrl={wikipediaUrl}
            onWikipediaUrlChange={handleWikipediaUrlChange}
            onIngest={handleIngest}
          canIngest={canIngest}
          loading={ingestStatus === "loading"}
          helperText={ingestMessage}
          error={ingestError}
        />
          {showStepTwo && (
            <Stack spacing={3}>
              <QuestionCard
                question={question}
                onQuestionChange={setQuestion}
              onAsk={handleAsk}
              onClear={() => setQuestion("")}
              canAsk={canAsk}
              loading={isAsking}
            />
            <ChatHistory history={chatHistory} />
            </Stack>
          )}
        </Stack>
      </Box>
      <Box
        sx={{
          display: { xs: "block", lg: "none" },
          width: "100%",
        }}
      >
        <DocumentHistoryCard
          documents={documents}
          loading={documentsLoading}
          onSelect={handleSelectDocument}
          onRefresh={() => void refreshDocuments()}
        />
      </Box>
    </Box>
  )
}

export default HomePage
