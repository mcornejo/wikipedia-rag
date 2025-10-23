import { Chip, Paper, Typography } from "@mui/material"

const HeroCard = () => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 3, md: 4 },
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <Chip
      label="Wikipedia RAG"
      color="secondary"
      variant="outlined"
      sx={{
        alignSelf: "flex-start",
        borderRadius: 999,
        fontWeight: 600,
        letterSpacing: "0.08em",
      }}
    />
    <Typography variant="h3" component="h1">
      Wikipedia RAG Explorer
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
      Retrieve, augment, and chat with knowledge pulled directly from Wikipedia pages. Ingest an article, then ask focused questions with
      grounded answers.
    </Typography>
  </Paper>
)

export default HeroCard
