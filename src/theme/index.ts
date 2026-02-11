import { createTheme, ThemeOptions } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

// Premium luxury color palette
const modernColors = {
  light: {
    primary: {
      main: '#1a3a5c', // Deep navy
      light: '#2d5f8a',
      dark: '#0e2440',
      gradient: 'linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 50%, #1a3a5c 100%)',
    },
    secondary: {
      main: '#c9a54e', // Rich gold
      light: '#dbb96a',
      dark: '#a88832',
      gradient: 'linear-gradient(135deg, #c9a54e 0%, #e4c76e 50%, #c9a54e 100%)',
    },
    success: {
      main: '#0d9668',
      light: '#2cbf8b',
      dark: '#087a54',
      gradient: 'linear-gradient(135deg, #0d9668 0%, #2cbf8b 100%)',
    },
    warning: {
      main: '#e8870f',
      light: '#f5a623',
      dark: '#c2700a',
      gradient: 'linear-gradient(135deg, #e8870f 0%, #f5a623 100%)',
    },
    error: {
      main: '#d64545',
      light: '#e76f6f',
      dark: '#b83232',
      gradient: 'linear-gradient(135deg, #d64545 0%, #e76f6f 100%)',
    },
    info: {
      main: '#2a7de1',
      light: '#5a9ef5',
      dark: '#1a5fb8',
      gradient: 'linear-gradient(135deg, #2a7de1 0%, #5a9ef5 100%)',
    },
    background: {
      default: '#f4f6f9',
      paper: '#ffffff',
      glass: 'rgba(255, 255, 255, 0.75)',
      gradient: 'linear-gradient(160deg, #f4f6f9 0%, #e8ecf4 100%)',
    },
    text: {
      primary: '#1a2332',
      secondary: '#5a6a7e',
    },
  },
  dark: {
    primary: {
      main: '#5a8fc4', // Soft ocean blue
      light: '#7db3e8',
      dark: '#3d6fa0',
      gradient: 'linear-gradient(135deg, #5a8fc4 0%, #7db3e8 50%, #5a8fc4 100%)',
    },
    secondary: {
      main: '#d4af5a', // Warm gold
      light: '#e8c878',
      dark: '#b89340',
      gradient: 'linear-gradient(135deg, #d4af5a 0%, #e8c878 50%, #d4af5a 100%)',
    },
    success: {
      main: '#2cbf8b',
      light: '#5ddeb0',
      dark: '#0d9668',
      gradient: 'linear-gradient(135deg, #2cbf8b 0%, #5ddeb0 100%)',
    },
    warning: {
      main: '#f5a623',
      light: '#ffc247',
      dark: '#e8870f',
      gradient: 'linear-gradient(135deg, #f5a623 0%, #ffc247 100%)',
    },
    error: {
      main: '#e76f6f',
      light: '#f59a9a',
      dark: '#d64545',
      gradient: 'linear-gradient(135deg, #e76f6f 0%, #f59a9a 100%)',
    },
    info: {
      main: '#5a9ef5',
      light: '#8dc0ff',
      dark: '#2a7de1',
      gradient: 'linear-gradient(135deg, #5a9ef5 0%, #8dc0ff 100%)',
    },
    background: {
      default: '#0c1524',
      paper: '#162032',
      glass: 'rgba(22, 32, 50, 0.8)',
      gradient: 'linear-gradient(160deg, #0c1524 0%, #162032 100%)',
    },
    text: {
      primary: '#e8edf5',
      secondary: '#8fa3be',
    },
  },
};

export const createAppTheme = (mode: ThemeMode) => {
  const colors = mode === 'light' ? modernColors.light : modernColors.dark;
  
  const getDesignTokens = (mode: ThemeMode): ThemeOptions => ({
    direction: 'rtl',
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      error: colors.error,
      warning: colors.warning,
      success: colors.success,
      info: colors.info,
      background: colors.background,
      text: colors.text,
    },
    typography: {
      fontFamily: [
        'Cairo',
        'Inter',
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
      h2: {
        fontWeight: 800,
        letterSpacing: '-0.02em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 700,
        letterSpacing: '0.02em',
      },
    },
    shape: {
      borderRadius: 14,
    },
    shadows: [
      'none',
      '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      '0 2px 6px 0 rgba(0, 0, 0, 0.06)',
      '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      '0 8px 20px -4px rgba(0, 0, 0, 0.1)',
      '0 12px 28px -6px rgba(0, 0, 0, 0.12)',
      '0 16px 36px -8px rgba(0, 0, 0, 0.14)',
      '0 20px 40px -8px rgba(0, 0, 0, 0.16)',
      '0 24px 48px -8px rgba(0, 0, 0, 0.18)',
      '0 28px 52px -8px rgba(0, 0, 0, 0.2)',
      '0 32px 56px -8px rgba(0, 0, 0, 0.22)',
      '0 36px 60px -8px rgba(0, 0, 0, 0.24)',
      '0 40px 64px -8px rgba(0, 0, 0, 0.26)',
      '0 44px 68px -8px rgba(0, 0, 0, 0.28)',
      '0 48px 72px -8px rgba(0, 0, 0, 0.3)',
      '0 52px 76px -8px rgba(0, 0, 0, 0.32)',
      '0 56px 80px -8px rgba(0, 0, 0, 0.34)',
      '0 60px 84px -8px rgba(0, 0, 0, 0.36)',
      '0 64px 88px -8px rgba(0, 0, 0, 0.38)',
      '0 68px 92px -8px rgba(0, 0, 0, 0.4)',
      '0 72px 96px -8px rgba(0, 0, 0, 0.42)',
      '0 76px 100px -8px rgba(0, 0, 0, 0.44)',
      '0 80px 104px -8px rgba(0, 0, 0, 0.46)',
      '0 84px 108px -8px rgba(0, 0, 0, 0.48)',
      '0 88px 112px -8px rgba(0, 0, 0, 0.5)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#eef1f6' : '#0c1524',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' 
                ? 'linear-gradient(180deg, #b0bec5, #90a4ae)' 
                : 'linear-gradient(180deg, #2d4a6a, #3d6590)',
              borderRadius: '4px',
              '&:hover': {
                background: mode === 'light' 
                  ? 'linear-gradient(180deg, #90a4ae, #78909c)'
                  : 'linear-gradient(180deg, #3d6590, #5a8fc4)',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative' as const,
            overflow: 'hidden' as const,
            '& .MuiButton-startIcon': {
              marginInlineEnd: '8px',
              marginInlineStart: 0,
            },
            '& .MuiButton-endIcon': {
              marginInlineStart: '8px',
              marginInlineEnd: 0,
            },
          },
          contained: {
            boxShadow: mode === 'light' 
              ? '0 4px 14px -3px rgba(26, 58, 92, 0.35)'
              : '0 4px 14px -3px rgba(90, 143, 196, 0.35)',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 8px 22px -4px rgba(26, 58, 92, 0.4)'
                : '0 8px 22px -4px rgba(90, 143, 196, 0.4)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.98)',
              boxShadow: mode === 'light'
                ? '0 2px 8px -2px rgba(26, 58, 92, 0.3)'
                : '0 2px 8px -2px rgba(90, 143, 196, 0.3)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              transform: 'translateY(-1px)',
              backgroundColor: mode === 'light' ? 'rgba(26, 58, 92, 0.04)' : 'rgba(90, 143, 196, 0.06)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(26, 58, 92, 0.06)' : 'rgba(90, 143, 196, 0.08)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: '10px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(26, 58, 92, 0.06)' : 'rgba(90, 143, 196, 0.08)',
              transform: 'scale(1.08)',
            },
            '&:active': {
              transform: 'scale(0.94)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: mode === 'light'
              ? '0 2px 12px -2px rgba(26, 58, 92, 0.08), 0 1px 4px rgba(0,0,0,0.04)'
              : '0 4px 20px -4px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: mode === 'dark' ? '1px solid rgba(90, 143, 196, 0.1)' : '1px solid rgba(26, 58, 92, 0.06)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: mode === 'light'
                ? '0 12px 32px -6px rgba(26, 58, 92, 0.12), 0 4px 12px rgba(0,0,0,0.06)'
                : '0 16px 40px -8px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(0,0,0,0.25)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          },
          elevation2: {
            boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
          },
          elevation3: {
            boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.primary.main,
                  borderWidth: '1.5px',
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                },
                boxShadow: mode === 'light' 
                  ? `0 0 0 3px rgba(26, 58, 92, 0.08)`
                  : `0 0 0 3px rgba(90, 143, 196, 0.12)`,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.03)',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: mode === 'dark' 
              ? 'linear-gradient(195deg, #162032 0%, #0c1524 100%)'
              : 'linear-gradient(195deg, #ffffff 0%, #f4f6f9 100%)',
            borderLeft: mode === 'dark' ? '1px solid rgba(90, 143, 196, 0.08)' : 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: mode === 'dark'
              ? 'linear-gradient(135deg, #162032 0%, #1a3050 100%)'
              : colors.primary.gradient,
            boxShadow: mode === 'light' 
              ? '0 4px 20px -4px rgba(26, 58, 92, 0.2)'
              : '0 4px 20px -4px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 22,
            boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.8rem',
            padding: '8px 14px',
            backgroundColor: mode === 'light' ? '#1a2332' : '#e8edf5',
            color: mode === 'light' ? '#e8edf5' : '#1a2332',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            height: 6,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: '0 6px 20px -4px rgba(26, 58, 92, 0.35)',
            '&:hover': {
              boxShadow: '0 10px 28px -6px rgba(26, 58, 92, 0.45)',
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? 'rgba(26, 58, 92, 0.08)' : 'rgba(90, 143, 196, 0.1)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  return createTheme(getDesignTokens(mode));
};
