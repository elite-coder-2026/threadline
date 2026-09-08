import styled, { css } from 'styled-components';

type Variant = 'primary' | 'subtle' | 'danger';

export const Button = styled.button<{ $variant?: Variant }>`
  padding: ${({ theme }) => `${theme.space(2)} ${theme.space(4)}`};
  border-radius: 999px;
  border: ${({ theme }) => theme.border};
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ theme, $variant = 'subtle' }) => {
    if ($variant === 'primary') {
      return css`
        background: ${theme.color.primary};
        border-color: ${theme.color.primary};
        color: ${theme.color.primaryText};
      `;
    }
    if ($variant === 'danger') {
      return css`
        background: ${theme.color.surface};
        border-color: ${theme.color.danger};
        color: ${theme.color.danger};
      `;
    }
    return css`
      background: ${theme.color.surface};
      color: ${theme.color.text};
      &:hover:not(:disabled) {
        background: ${theme.color.hover};
      }
    `;
  }}
`;
