import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/follows.api';
import { keys } from '../lib/queryKeys';
import type { Profile } from '../types/models';

export const useProfile = (handle: string) =>
  useQuery<Profile>({
    queryKey: keys.profile(handle),
    queryFn: async () => getProfile(handle),
    enabled: handle.length > 0,
  });
