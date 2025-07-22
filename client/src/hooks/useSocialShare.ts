
import { useToast } from '../hooks/use-toast';

interface ShareData {
  title: string;
  description: string;
  url?: string;
}

export const useSocialShare = () => {
  const { toast } = useToast();

  const shareToTwitter = (data: ShareData) => {
    const text = `${data.title}\n\n${data.description}`;
    const url = data.url || window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToFacebook = (data: ShareData) => {
    const url = data.url || window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = (data: ShareData) => {
    const url = data.url || window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const copyToClipboard = async (data: ShareData) => {
    try {
      const text = `${data.title}\n\n${data.description}\n\n${data.url || window.location.href}`;
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Article link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nativeShare = async (data: ShareData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url || window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard(data);
    }
  };

  return {
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    copyToClipboard,
    nativeShare,
    canNativeShare: !!navigator.share
  };
};
