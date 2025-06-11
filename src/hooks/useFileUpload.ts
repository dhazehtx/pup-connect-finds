
import { useUnifiedFileUpload, FileUploadOptions } from './useUnifiedFileUpload';

export const useFileUpload = (options?: FileUploadOptions) => {
  return useUnifiedFileUpload(options);
};
