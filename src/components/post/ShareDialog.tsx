
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ShareOptions from './ShareOptions';
import ShareContactsList from './ShareContactsList';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    user: {
      name: string;
      username: string;
    };
    caption: string;
  };
}

const ShareDialog = ({ isOpen, onClose, post }: ShareDialogProps) => {
  const { toast } = useToast();

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({
      title: "Link copied!",
      description: "Post link has been copied to clipboard",
    });
    onClose();
  };

  const handleShareToMessages = () => {
    toast({
      title: "Share via Messages",
      description: "Opening messaging interface...",
    });
    onClose();
  };

  const handleShareToPhone = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const text = `Check out this post by ${post.user.name}: ${postUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.name}`,
        text: text,
        url: postUrl,
      });
    } else {
      const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
      window.open(smsUrl);
    }
    onClose();
  };

  const handleShareToEmail = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const subject = `Check out this post by ${post.user.name}`;
    const body = `I thought you might like this post:\n\n${post.caption}\n\nView it here: ${postUrl}`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    onClose();
  };

  const handleShareToOtherApps = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const text = `Check out this post by ${post.user.name}: ${postUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.name}`,
        text: text,
        url: postUrl,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard",
      });
    }
    onClose();
  };

  // Mock recent contacts for messaging
  const recentContacts = [
    {
      id: '1',
      name: 'Sarah M.',
      username: 'sarah_m',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Mike D.',
      username: 'mike_d',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Emma W.',
      username: 'emma_w',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        
        <ShareOptions
          onShareToMessages={handleShareToMessages}
          onShareToPhone={handleShareToPhone}
          onShareToEmail={handleShareToEmail}
          onShareToOtherApps={handleShareToOtherApps}
          onCopyLink={handleCopyLink}
        />

        <ShareContactsList
          contacts={recentContacts}
          onContactClick={handleShareToMessages}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
