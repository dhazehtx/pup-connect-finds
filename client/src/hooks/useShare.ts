
import { useToast } from '@/hooks/use-toast';

export const useShare = () => {
  const { toast } = useToast();

  const shareContent = async (title: string, text: string, url: string) => {
    // Check if Web Share API is available (primarily mobile)
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        return true;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return false;
      }
    }

    // Fallback: Copy to clipboard
    try {
      const shareText = `${title}\n${text}\n${url}`;
      await navigator.clipboard.writeText(shareText);
      
      toast({
        title: "Link copied!",
        description: "The listing link has been copied to your clipboard.",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      toast({
        title: "Share failed",
        description: "Unable to share or copy the link.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return { shareContent };
};
