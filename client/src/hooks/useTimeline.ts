import { useInfiniteQuery } from '@tanstack/react-query';
import { getTimelinePage } from '../api/posts.api';
import { keys } from '../lib/queryKeys';
import type { Page, SortOrder, TimelineItem } from '../types/models';

// Infinite (paginated) timeline, cached per sort order.
export const useTimeline = (sort: SortOrder) =>
  useInfiniteQuery<Page<TimelineItem>>({
    queryKey: keys.timeline(sort),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      getTimelinePage({ sort, cursor: pageParam as string | undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
