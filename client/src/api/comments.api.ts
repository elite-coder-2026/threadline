// Comments resource. One file per resource; every call is an async arrow.
import { httpGet, httpPost } from '../lib/httpClient';
import type { Comment, Page } from '../types/models';

export const getComments = async (postId: string): Promise<Page<Comment>> =>
  httpGet<Page<Comment>>(`/api/posts/${postId}/comments`);

interface CreateCommentArgs {
  postId: string;
  content: string;
}

export const createComment = async ({
  postId,
  content,
}: CreateCommentArgs): Promise<Comment> =>
  httpPost<Comment>(`/api/posts/${postId}/comments`, { content });
