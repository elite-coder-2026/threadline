// Layer 4 — Domain. Pure shape, no logic, imports nothing.
export interface Follow {
  followerId: string;
  followeeId: string;
  createdAt: Date;
}
