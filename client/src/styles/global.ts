import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: ${({ theme }) => theme.font.body};
    background: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.text};
    line-height: 1.4;
  }
  button { font: inherit; }
`;
