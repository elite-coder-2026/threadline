import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Panel } from '../common/Panel';
import { StatusPanel } from '../common/StatusPanel';
import { FeedSortDropdown } from './FeedSortDropdown';
import { FloatingComposer } from './FloatingComposer';
import { PostCard } from './PostCard';
import { useTimeline } from '../../hooks/useTimeline';
import type { SortOrder } from '../../types/models';

export const Timeline = (): JSX.Element => {
  const [sort, setSort] = useState<SortOrder>('latest');
  const {
    data,
    status,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useTimeline(sort);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // DOM observation only — the actual fetching is React Query's job.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Feed>
      <Header>
        <Title>Home</Title>
        <FeedSortDropdown value={sort} onChange={setSort} />
      </Header>

      {status === 'pending' && <StatusPanel>Loading timeline…</StatusPanel>}
      {status === 'error' && (
        <StatusPanel tone="error">Couldn’t load timeline: {error.message}</StatusPanel>
      )}
      {status === 'success' && posts.length === 0 && (
        <StatusPanel>No posts yet — follow someone or write the first one.</StatusPanel>
      )}

      {posts.length > 0 && (
        <List>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} as="li" />
          ))}
        </List>
      )}

      <Sentinel ref={sentinelRef} aria-hidden />
      {isFetchingNextPage && <StatusPanel>Loading more…</StatusPanel>}
      {!hasNextPage && posts.length > 0 && !isFetching && (
        <StatusPanel>You’re all caught up.</StatusPanel>
      )}

      <FloatingComposer />
    </Feed>
  );
};

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(3)};
  max-width: 620px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.space(4)};
`;

const Header = styled(Panel)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.2rem;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space(3)};
`;

const Sentinel = styled.div`
  height: 1px;
`;
