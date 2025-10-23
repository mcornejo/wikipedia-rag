import { Box, Container, Stack } from "@mui/material"
import { type ReactNode } from "react"

export interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => (
  <Box sx={{ minHeight: "100vh", py: { xs: 6, md: 8 } }}>
    <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 4 } }}>
      <Stack spacing={5}>{children}</Stack>
    </Container>
  </Box>
)

export default AppLayout
