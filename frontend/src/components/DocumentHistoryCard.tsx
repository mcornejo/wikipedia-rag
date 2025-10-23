import {
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material"
import { HistoryRounded, RefreshRounded } from "@mui/icons-material"
import type { DocumentSummary } from "../types/api"

interface DocumentHistoryCardProps {
  documents: DocumentSummary[]
  loading?: boolean
  onSelect: (summary: DocumentSummary) => void
  onRefresh?: () => void
  sx?: SxProps<Theme>
}

const statusChipColor: Record<DocumentSummary["status"], "default" | "error" | "success" | "warning"> = {
  completed: "success",
  failed: "error",
  in_progress: "warning",
}

const statusLabel: Record<DocumentSummary["status"], string> = {
  completed: "Completed",
  failed: "Failed",
  in_progress: "In progress",
}

const DocumentHistoryCard = ({ documents, loading = false, onSelect, onRefresh, sx }: DocumentHistoryCardProps) => (
  <Paper
    elevation={0}
    sx={[
      {
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      },
      ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    ]}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={2} alignItems="center">
        <HistoryRounded color="secondary" fontSize="small" />
        <Typography variant="h6">Recent pages</Typography>
      </Stack>
      {onRefresh && (
        <Tooltip title="Refresh">
          <span>
            <IconButton onClick={onRefresh} disabled={loading} size="small">
              <RefreshRounded fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Stack>
    {loading && <LinearProgress />}
    {documents.length === 0 && !loading ? (
      <Typography variant="body2" color="text.secondary">
        No pages have been ingested yet. They will appear here once processed.
      </Typography>
    ) : (
      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {documents.map((doc) => {
          const updatedAt = new Date(doc.updatedAt).toLocaleString()
          return (
            <ListItemButton
              key={doc.url}
              onClick={() => onSelect(doc)}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                alignItems: "flex-start",
                px: 2,
                py: 1.5,
              }}
            >
              <ListItemText
                primary={
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
                        {doc.url}
                      </Typography>
                      <Chip
                        label={statusLabel[doc.status]}
                        color={statusChipColor[doc.status]}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Updated {updatedAt} · {doc.chunkCount} chunks · {doc.historyCount} questions
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Stack spacing={0.5} mt={1}>
                    {doc.lastQuestion ? (
                      <Typography variant="body2" color="text.primary">
                        Last question: {doc.lastQuestion}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No questions asked yet.
                      </Typography>
                    )}
                    {doc.lastAnswerPreview && (
                      <Typography variant="body2" color="text.secondary">
                        {doc.lastAnswerPreview}
                      </Typography>
                    )}
                  </Stack>
                }
                primaryTypographyProps={{ component: "div" }}
                secondaryTypographyProps={{ component: "div" }}
              />
            </ListItemButton>
          )
        })}
      </List>
    )}
  </Paper>
)

export default DocumentHistoryCard
