// Uploads resource. One file per resource; every call is an async arrow.
import { httpUpload } from '../lib/httpClient';

export interface UploadedVideo {
  url: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export const uploadVideo = async (file: File): Promise<UploadedVideo> => {
  const form = new FormData();
  form.append('file', file);
  return httpUpload<UploadedVideo>('/api/uploads', form);
};
