import styled from 'styled-components';
import { PanelTight } from '../common/Panel';
import type { GithubMetadata } from '../../types/models';

interface GithubPostBodyProps {
  metadata: GithubMetadata;
}

const formatStars = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n);

export const GithubPostBody = ({ metadata }: GithubPostBodyProps): JSX.Element => (
  <Card>
    {metadata.image && <Thumb src={metadata.image} alt="" loading="lazy" />}

    <RepoLine>
      <span aria-hidden>📦</span>
      <Repo>
        {metadata.owner}/<strong>{metadata.repo}</strong>
      </Repo>
    </RepoLine>

    {metadata.description && <Desc>{metadata.description}</Desc>}

    <Meta>
      {metadata.stars !== null && (
        <MetaItem aria-label={`${metadata.stars} stars`}>
          <span aria-hidden>★</span> {formatStars(metadata.stars)}
        </MetaItem>
      )}
      {metadata.language && (
        <MetaItem>
          <Dot aria-hidden /> {metadata.language}
        </MetaItem>
      )}
      {metadata.enrichmentStatus === 'failed' && <MetaItem>details unavailable</MetaItem>}
    </Meta>

    <Action href={metadata.url} target="_blank" rel="noreferrer">
      View on GitHub →
    </Action>
  </Card>
);

const Card = styled(PanelTight)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(2)};
  background: ${({ theme }) => theme.color.bg};
`;

const Thumb = styled.img`
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radiusSmall};
`;

const RepoLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(2)};
`;

const Repo = styled.span`
  color: ${({ theme }) => theme.color.textMuted};
  word-break: break-all;

  strong {
    color: ${({ theme }) => theme.color.text};
  }
`;

const Desc = styled.p`
  margin: 0;
  font-size: 0.9em;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(3)};
  color: ${({ theme }) => theme.color.textMuted};
  font-size: 0.85em;
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(1)};
  font-variant-numeric: tabular-nums;
`;

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.color.primary};
  display: inline-block;
`;

const Action = styled.a`
  align-self: flex-start;
  font-weight: 600;
  font-size: 0.9em;
  color: ${({ theme }) => theme.color.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
