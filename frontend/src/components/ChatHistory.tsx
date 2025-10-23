import { Paper, Stack, Typography } from "@mui/material"
import type { ChatMessage } from "../types/api"

interface ChatHistoryProps {
  history: ChatMessage[]
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const renderMarkdown = (value: string) => {
  let html = escapeHtml(value)

  html = html.replace(/```([\s\S]*?)```/g, (_, code: string) => {
    const trimmed = code.trimEnd()
    return `<pre><code>${trimmed}</code></pre>`
  })

  html = html.replace(/`([^`]+)`/g, (_, code: string) => `<code>${code}</code>`)

  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    (_, text: string) => `<strong>${text}</strong>`
  )

  html = html.replace(
    /\*([^*]+)\*/g,
    (_, text: string) => `<em>${text}</em>`
  )

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match: string, label: string, url: string) =>
      `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`
  )

  const listItems: string[] = []
  html = html
    .split(/\n+/)
    .map((line) => {
      if (/^\s*-\s+/.test(line)) {
        const content = line.replace(/^\s*-\s+/, "")
        listItems.push(`<li>${content}</li>`)
        return ""
      }
      if (listItems.length > 0) {
        const listHtml = `<ul>${listItems.join("")}</ul>`
        listItems.length = 0
        return `${listHtml}<p>${line}</p>`
      }
      return `<p>${line}</p>`
    })
    .join("")

  if (listItems.length > 0) {
    html += `<ul>${listItems.join("")}</ul>`
  }

  return html
}

const ChatHistory = ({ history }: ChatHistoryProps) => {
  if (history.length === 0) {
    return null
  }

  const orderedHistory = [...history].sort(
    (a, b) => b.createdAt - a.createdAt
  )

  return (
    <Stack spacing={2}>
      {orderedHistory.map((entry) => (
        <Paper
          key={entry.id}
          variant="outlined"
          sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle2" color="text.secondary">
              You asked
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(entry.createdAt).toLocaleString()}
            </Typography>
          </Stack>
          <Typography>{entry.question}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Assistant
          </Typography>
          <Typography
            color="text.secondary"
            component="div"
            sx={{
              "& p": { m: 0, "& + p": { mt: 1 } },
              "& ul": { pl: 3 },
              "& code": {
                backgroundColor: "rgba(148, 163, 184, 0.16)",
                borderRadius: 1,
                px: 0.5,
                py: 0.25,
                fontSize: "0.9em",
              },
              "& pre": {
                backgroundColor: "rgba(148, 163, 184, 0.16)",
                borderRadius: 2,
                p: 1.5,
                overflowX: "auto",
                fontSize: "0.9em",
              },
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(entry.answer) }}
          />
        </Paper>
      ))}
    </Stack>
  )
}

export default ChatHistory
