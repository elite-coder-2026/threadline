// Layer 4 — Domain. Pure shape, no logic, imports nothing.
export interface UploadedFile {
  /** Absolute, publicly reachable URL of the stored file. */
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}
