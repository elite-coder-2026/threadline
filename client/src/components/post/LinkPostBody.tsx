import styled from 'styled-components';
import { PanelTight } from '../common/Panel';
import type { LinkMetadata } from '../../types/models';

interface LinkPostBodyProps {
  metadata: LinkMetadata;
}

// Its own bordered, rounded container — satisfies the "no naked component" rule.
export const LinkPostBody = ({ metadata }: LinkPostBodyProps): JSX.Element => {
  const enriched = metadata.enrichmentStatus === 'ok' && metadata.title !== null;

  return (
    <Card as="a" href={metadata.url} target="_blank" rel="noreferrer">
      {enriched && metadata.image && (
        <Thumb src={metadata.image} alt="" loading="lazy" />
      )}
      <Text>
        {enriched ? (
          <>
            <Title>{metadata.title}</Title>
            {metadata.description && <Desc>{metadata.description}</Desc>}
          </>
        ) : (
          <Title>{metadata.url}</Title>
        )}
        <Domain>{metadata.domain}</Domain>
      </Text>
    </Card>
  );
};

const Card = styled(PanelTight)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
  text-decoration: none;
  color: inherit;
  background: ${({ theme }) => theme.color.bg};
  overflow: hidden;

  &:hover {
    background: ${({ theme }) => theme.color.hover};
  }
`;

const Thumb = styled.img`
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radiusSmall};
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(1)};
`;

const Title = styled.span`
  font-weight: 700;
  word-break: break-word;
`;

const Desc = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.9em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Domain = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.8em;
  text-transform: lowercase;
`;
