// Follows / profile resource. Every call is an async arrow.
import { httpGet, httpPost, httpDelete } from '../lib/httpClient';
import type { Profile } from '../types/models';

export const getProfile = async (handle: string): Promise<Profile> =>
  httpGet<Profile>(`/api/profiles/${handle}`);

export const followUser = async (userId: string): Promise<void> => {
  await httpPost<{ following: boolean }>(`/api/follows/${userId}`);
};

export const unfollowUser = async (userId: string): Promise<void> => {
  await httpDelete<{ following: boolean }>(`/api/follows/${userId}`);
};
