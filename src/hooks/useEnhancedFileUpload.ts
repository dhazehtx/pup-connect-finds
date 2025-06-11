
import { useUnifiedFileUpload } from './useUnifiedFileUpload';

export const useEnhancedFileUpload = () => {
  return useUnifiedFileUpload({
    bucket: 'message-files',
    folder: 'uploads',
    maxSize: 100 * 1024 * 1024, // 100MB for message files
    allowedTypes: [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
      'application/pdf', 'text/plain'
    ]
  });
};
