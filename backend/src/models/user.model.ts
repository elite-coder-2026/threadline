// Layer 4 — Domain. Pure shape, no logic, imports nothing.
export interface User {
  id: string;
  handle: string;
  displayName: string;
  createdAt: Date;
}
