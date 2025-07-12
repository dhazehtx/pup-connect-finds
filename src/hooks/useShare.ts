
import { useToast } from '@/hooks/use-toast';

interface ShareData {
  title: string;
  description: string;
  url?: string;
}

export const useShare = () => {
  const { toast } = useToast();

  const shareNative = async (data: ShareData) => {
    const shareUrl = data.url || window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: shareUrl,
        });
        return true;
      } catch (error) {
        // User cancelled or error occurred
        return false;
      }
    }
    
    // Fallback to clipboard
    try {
      const text = `${data.title}\n\n${data.description}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Listing link has been copied to your clipboard.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share this listing.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { shareNative };
};
