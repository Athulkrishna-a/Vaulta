import { createTheme, ThemeOptions } from '@mui/material/styles';
import { lightPalette, darkPalette } from './colors';

declare module '@mui/material/styles' {
  interface TypeBackground {
    glass: string;
    glassBorder: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;
  }

  interface Palette {
    income: {
      main: string;
      contrastText: string;
      container: string;
      onContainer: string;
    };
    expense: {
      main: string;
      contrastText: string;
      container: string;
      onContainer: string;
    };
    transfer: {
      main: string;
      contrastText: string;
      container: string;
      onContainer: string;
    };
  }

  interface PaletteOptions {
    income?: {
      main: string;
      contrastText: string;
      container: string;
      onContainer: string;
    };
    expense?: {
      main: string;
      contrastText: string;
      container: string;
      onContainer: string;
    };
    transfer?: {
      main: string;
      contrastText: string;
      container: string;
      onContainer: string;
    };
  }
}

const getBaseOptions = (palette: typeof lightPalette | typeof darkPalette): ThemeOptions => ({
  palette: {
    mode: palette.mode,
    primary: palette.primary,
    secondary: palette.secondary,
    error: palette.error,
    income: palette.income,
    expense: palette.expense,
    transfer: palette.transfer,
    background: palette.background,
    text: palette.text,
    divider: palette.divider,
  },
  typography: {
    fontFamily: [
      'Space Grotesk',
      'Geist',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 700 },
    h6: { fontSize: '1rem', fontWeight: 700 },
    subtitle1: { fontSize: '1rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
    button: { textTransform: 'none', fontWeight: 700, borderRadius: '20px' },
  },
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          backgroundColor: palette.background.default,
          color: palette.text.primary,
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
        '*': {
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
        '*::-webkit-scrollbar': {
          display: 'none',
          width: '0px !important',
          height: '0px !important',
          background: 'transparent !important',
        },
        '::-webkit-scrollbar': {
          display: 'none',
          width: '0px !important',
          height: '0px !important',
          background: 'transparent !important',
        },
        '.recharts-wrapper *:focus, .recharts-surface *:focus, .recharts-sector:focus, .recharts-pie-sector:focus, .recharts-bar-rectangle:focus, .recharts-rectangle:focus, .recharts-active-shape, .recharts-tooltip-cursor, svg *:focus': {
          outline: 'none !important',
          boxShadow: 'none !important',
          WebkitTapHighlightColor: 'transparent !important',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundImage: 'none',
          backgroundColor: palette.background.paper,
          boxShadow: palette.mode === 'light'
            ? '0px 4px 20px rgba(0, 0, 0, 0.04)'
            : '0px 4px 20px rgba(0, 0, 0, 0.25)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          padding: '10px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          '&:hover': {
            backgroundColor: palette.primary.main,
            boxShadow: '0 4px 12px rgba(108, 92, 231, 0.25)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 24,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
          padding: '8px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          '&.MuiInputLabel-shrink': {
            backgroundColor: palette.mode === 'dark' ? '#0F1420' : '#FFFFFF',
            padding: '0 6px',
            borderRadius: '4px',
            zIndex: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        notchedOutline: {
          borderColor: palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.MuiInputLabel-shrink': {
            backgroundColor: palette.mode === 'dark' ? '#0F1420' : '#FFFFFF',
            padding: '0 6px',
            borderRadius: '4px',
            zIndex: 1,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode: 'light' | 'dark') => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  return createTheme(getBaseOptions(palette));
};
