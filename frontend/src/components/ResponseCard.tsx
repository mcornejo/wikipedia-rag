import { Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material"
import { type ReactNode } from "react"

type ResponseStatus = "idle" | "loading" | "success" | "error"

interface ResponseCardProps {
  status: ResponseStatus
  content?: string
  error?: string
}

const ResponseCard = ({ status, content, error }: ResponseCardProps) => {
  const renderBody = (): ReactNode => {
    if (status === "loading") {
      return (
        <Stack direction="row" alignItems="center" spacing={2}>
          <CircularProgress size={20} />
          <Typography color="text.secondary">
            Fetching and processing URL...
          </Typography>
        </Stack>
      )
    }

    if (status === "error") {
      return (
        <Typography color="error.main">
          {error ?? "We hit a snag while fetching the article. Please try again."}
        </Typography>
      )
    }

    if (status === "success") {
      return (
        <Typography color="text.secondary">
          {content ?? "Ingestion started. Background processing is underway."}
        </Typography>
      )
    }

    return (
      <Typography color="text.secondary">
        Responses will appear here once the backend is connected.
      </Typography>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        justifyContent: "center",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip label="Response" color="secondary" size="small" />
        <Typography variant="h6">Conversation transcript</Typography>
      </Stack>
      {renderBody()}
    </Paper>
  )
}

export default ResponseCard
