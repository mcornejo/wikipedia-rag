import { CloudUploadRounded } from "@mui/icons-material"
import { Button, Chip, LinearProgress, Paper, Stack, TextField, Typography } from "@mui/material"
import { type ChangeEvent } from "react"

interface IngestCardProps {
  wikipediaUrl: string
  onWikipediaUrlChange: (value: string) => void
  onIngest: () => void
  canIngest: boolean
  loading?: boolean
  helperText?: string
  error?: string
}

const IngestCard = ({ wikipediaUrl, onWikipediaUrlChange, onIngest, canIngest, loading = false, helperText, error }: IngestCardProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onWikipediaUrlChange(event.target.value)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip label="Step 1" color="secondary" size="small" />
        <Typography variant="h6">Ingest a page</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Paste the Wikipedia article URL to sync it into the retrieval index.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        eg. https://en.wikipedia.org/wiki/Zero-knowledge_proof
      </Typography>
      <TextField
        label="Wikipedia URL"
        value={wikipediaUrl}
        onChange={handleChange}
        placeholder="https://en.wikipedia.org/wiki/Zero-knowledge_proof"
        fullWidth
        error={Boolean(error)}
        helperText={error ?? " "}
      />
      <Button variant="contained" size="large" startIcon={<CloudUploadRounded />} onClick={onIngest} disabled={!canIngest || loading}>
        {loading ? "Ingesting..." : "Ingest page"}
      </Button>
      {(loading || helperText) && (
        <Stack spacing={1}>
          {loading && <LinearProgress />}
          {helperText && !error && (
            <Typography variant="body2" color={loading ? "text.secondary" : "success.main"}>
              {helperText}
            </Typography>
          )}
        </Stack>
      )}
    </Paper>
  )
}

export default IngestCard
