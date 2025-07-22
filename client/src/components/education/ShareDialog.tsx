
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Linkedin, Copy, Smartphone } from 'lucide-react';
import { useSocialShare } from '../../hooks/useSocialShare';
import { EducationResource } from '../../hooks/useEducationSearch';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resource: EducationResource;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  resource
}) => {
  const {
    shareToTwitter,
    shareToFacebook,
    shareToLinkedIn,
    copyToClipboard,
    nativeShare,
    canNativeShare
  } = useSocialShare();

  const shareData = {
    title: resource.title,
    description: resource.description,
    url: window.location.href
  };

  const handleShare = (shareFunction: (data: any) => void) => {
    shareFunction(shareData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={20} />
            Share Article
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {canNativeShare && (
            <Button
              onClick={() => handleShare(nativeShare)}
              className="w-full justify-start"
              variant="outline"
            >
              <Smartphone size={16} className="mr-2" />
              Share via Device
            </Button>
          )}
          
          <Button
            onClick={() => handleShare(shareToTwitter)}
            className="w-full justify-start"
            variant="outline"
          >
            <Twitter size={16} className="mr-2" />
            Share on Twitter
          </Button>
          
          <Button
            onClick={() => handleShare(shareToFacebook)}
            className="w-full justify-start"
            variant="outline"
          >
            <Facebook size={16} className="mr-2" />
            Share on Facebook
          </Button>
          
          <Button
            onClick={() => handleShare(shareToLinkedIn)}
            className="w-full justify-start"
            variant="outline"
          >
            <Linkedin size={16} className="mr-2" />
            Share on LinkedIn
          </Button>
          
          <Button
            onClick={() => handleShare(copyToClipboard)}
            className="w-full justify-start"
            variant="outline"
          >
            <Copy size={16} className="mr-2" />
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
