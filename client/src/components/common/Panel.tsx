import styled from 'styled-components';

// REQUIRED container. Every component in the UI renders a <Panel> (or a
// styled(Panel) / <Panel as="..."/>) as its outer element: visible padding,
// border, and rounded corners. No naked components anywhere.
export const Panel = styled.div`
  padding: ${({ theme }) => theme.space(4)};
  border: ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius};
  background: ${({ theme }) => theme.color.surface};
`;

// Tighter variant for nested/list items — same three guarantees.
export const PanelTight = styled(Panel)`
  padding: ${({ theme }) => theme.space(3)};
  border-radius: ${({ theme }) => theme.radiusSmall};
`;
