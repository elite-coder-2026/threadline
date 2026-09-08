// Layer 4 — Domain. Pure shape, no logic, imports nothing.
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorHandle: string;
  content: string;
  createdAt: Date;
}
