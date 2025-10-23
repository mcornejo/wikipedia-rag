import { QuestionAnswerRounded, RestartAltRounded } from "@mui/icons-material"
import { Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material"
import { type ChangeEvent } from "react"

interface QuestionCardProps {
  question: string
  onQuestionChange: (value: string) => void
  onAsk: () => void
  onClear: () => void
  canAsk: boolean
  loading?: boolean
}

const QuestionCard = ({ question, onQuestionChange, onAsk, onClear, canAsk, loading = false }: QuestionCardProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQuestionChange(event.target.value)
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
        <Chip label="Step 2" color="secondary" size="small" />
        <Typography variant="h6">Ask a question</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Ask about facts, summaries, or comparisons—answers will be grounded in the ingested content.
      </Typography>
      <TextField
        label="What would you like to know?"
        value={question}
        onChange={handleChange}
        multiline
        minRows={3}
        placeholder="Summarize the article in three bullet points."
        fullWidth
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<QuestionAnswerRounded />}
          onClick={onAsk}
          disabled={!canAsk || loading}
          sx={{ flexBasis: { sm: "60%" } }}
        >
          {loading ? "Asking..." : "Ask"}
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<RestartAltRounded />}
          onClick={onClear}
          disabled={!canAsk || loading}
          sx={{ flexBasis: { sm: "40%" } }}
        >
          Clear
        </Button>
      </Stack>
    </Paper>
  )
}

export default QuestionCard
