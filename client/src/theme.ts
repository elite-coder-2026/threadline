// Design tokens. Consumed via styled-components ThemeProvider.
export const theme = {
  space: (n: number): string => `${n * 4}px`,
  radius: '14px',
  radiusSmall: '10px',
  border: '1px solid #d9dde3',
  color: {
    bg: '#f6f8fa',
    surface: '#ffffff',
    text: '#14181f',
    textMuted: '#5b6675',
    primary: '#1d9bf0',
    primaryText: '#ffffff',
    danger: '#d7263d',
    likeActive: '#e0245e',
    hover: '#f0f3f6',
  },
  font: {
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
} as const;

export type AppTheme = typeof theme;
