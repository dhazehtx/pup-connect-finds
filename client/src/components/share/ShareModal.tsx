import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Share, 
  Copy, 
  Facebook, 
  Twitter, 
  Instagram,
  ExternalLink,
  Check,
  Smartphone
} from 'lucide-react';

interface ShareModalProps {
  trigger: React.ReactNode;
  postId: string;
  postTitle?: string;
  postContent?: string;
  postImage?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  trigger,
  postId,
  postTitle,
  postContent,
  postImage
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate shareable URL
  const shareUrl = `${window.location.origin}/post/${postId}`;
  const shareText = postTitle || postContent?.substring(0, 100) || 'Check out this post on MY PUP!';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied!",
        description: "The post link has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setOpen(false);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setOpen(false);
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct URL sharing, so we copy the link and guide the user
    copyToClipboard();
    toast({
      title: "Link copied for Instagram",
      description: "Paste this link in your Instagram story or bio",
    });
    setOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: shareUrl,
        });
        setOpen(false);
      } catch (error) {
        // User cancelled sharing or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          toast({
            title: "Sharing failed",
            description: "Please try copying the link instead",
            variant: "destructive",
          });
        }
      }
    }
  };

  const openInNewTab = () => {
    window.open(shareUrl, '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium line-clamp-2">
              {shareText}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {shareUrl}
            </p>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Copy Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="px-3"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share to Social Media</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={shareToFacebook}
                className="justify-start"
              >
                <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={shareToTwitter}
                className="justify-start"
              >
                <Twitter className="w-4 h-4 mr-2 text-blue-400" />
                Twitter/X
              </Button>
              <Button
                variant="outline"
                onClick={shareToInstagram}
                className="justify-start"
              >
                <Instagram className="w-4 h-4 mr-2 text-pink-600" />
                Instagram
              </Button>
              <Button
                variant="outline"
                onClick={openInNewTab}
                className="justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </Button>
            </div>
          </div>

          {/* Native Mobile Share */}
          {navigator.share && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Share</label>
              <Button
                variant="outline"
                onClick={handleNativeShare}
                className="w-full justify-start"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Share via Apps
              </Button>
            </div>
          )}

          {/* Social Media Tips */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Share className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-medium">Sharing Tips</p>
                <p>Facebook & Twitter will show a preview. For Instagram, copy the link and paste it in your story or bio.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;