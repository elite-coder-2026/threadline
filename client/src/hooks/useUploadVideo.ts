import { useMutation } from '@tanstack/react-query';
import { uploadVideo } from '../api/uploads.api';
import type { UploadedVideo } from '../api/uploads.api';

// Stateless one-shot: hands a File to the backend, gets back a public URL.
export const useUploadVideo = () =>
  useMutation<UploadedVideo, Error, File>({
    mutationFn: async (file: File) => uploadVideo(file),
  });
