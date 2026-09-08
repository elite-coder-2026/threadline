import { useState } from 'react';
import styled from 'styled-components';
import { PanelTight } from '../common/Panel';
import type { VideoMetadata } from '../../types/models';

interface VideoPostBodyProps {
  metadata: VideoMetadata;
}

// Feed stays light: show a poster + play button, swap in the real player only
// once the viewer clicks (same click-to-expand pattern as CommentThread).
export const VideoPostBody = ({ metadata }: VideoPostBodyProps): JSX.Element => {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <Poster as="button" type="button" onClick={() => setPlaying(true)} aria-label="Play video">
        {metadata.thumbnail ? (
          <PosterImg src={metadata.thumbnail} alt="" loading="lazy" />
        ) : (
          <PosterFallback>{metadata.title ?? 'Video'}</PosterFallback>
        )}
        <PlayBadge aria-hidden>▶</PlayBadge>
      </Poster>
    );
  }

  return (
    <Frame>
      <video src={metadata.url} controls autoPlay style={{ width: '100%' }} />
    </Frame>
  );
};

const Poster = styled(PanelTight)`
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: ${({ theme }) => theme.color.bg};
`;

const PosterImg = styled.img`
  display: block;
  width: 100%;
  max-height: 260px;
  object-fit: cover;
`;

const PosterFallback = styled.div`
  display: grid;
  place-items: center;
  height: 160px;
  color: ${({ theme }) => theme.color.textMuted};
  font-weight: 600;
`;

const PlayBadge = styled.span`
  position: absolute;
  inset: 0;
  margin: auto;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(20, 24, 31, 0.65);
  color: #fff;
  font-size: 1.4rem;
  padding-left: 4px;
`;

const Frame = styled(PanelTight)`
  padding: 0;
  overflow: hidden;
  background: #000;
`;
