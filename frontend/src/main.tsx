import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import App from './App.tsx'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3a4be0',
    },
    secondary: {
      main: '#22bfa2',
    },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1c1f',
      secondary: '#5c6069',
    },
    divider: 'rgba(26, 28, 31, 0.12)',
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f6fa',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(58, 75, 224, 0.08) 0, transparent 40%), radial-gradient(circle at 85% 10%, rgba(34, 191, 162, 0.08) 0, transparent 35%)',
          color: '#1a1c1f',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingBottom: '4rem',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          fontWeight: 600,
          textTransform: 'none',
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3),
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 28,
          border: '1px solid rgba(26, 28, 31, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 18,
          backgroundColor: alpha(theme.palette.common.black, 0.02),
          transition: theme.transitions.create([
            'border-color',
            'box-shadow',
            'background-color',
          ]),
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.common.black, 0.3),
          },
          '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.common.black, 0.04),
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}`,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        }),
        notchedOutline: {
          borderColor: alpha('#1a1c1f', 0.12),
        },
        input: {
          padding: '14px 18px',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
)
