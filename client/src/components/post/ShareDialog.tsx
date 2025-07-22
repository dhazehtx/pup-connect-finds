
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Phone, Share2, Copy, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    // In a real app, this would open the messaging interface
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
      // Fallback for desktop
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
      // Fallback - copy to clipboard
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
        
        <div className="space-y-4">
          {/* Quick Share Options */}
          <div className="grid grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={handleShareToMessages}
            >
              <MessageCircle size={24} />
              <span className="text-xs">Messages</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={handleShareToPhone}
            >
              <Phone size={24} />
              <span className="text-xs">SMS</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={handleShareToEmail}
            >
              <Mail size={24} />
              <span className="text-xs">Email</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-3"
              onClick={handleShareToOtherApps}
            >
              <Share2 size={24} />
              <span className="text-xs">More</span>
            </Button>
          </div>

          {/* Recent Contacts */}
          <div>
            <h3 className="font-medium text-sm mb-3">Send to</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={handleShareToMessages}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-gray-600 text-xs">@{contact.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Link */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleCopyLink}
            >
              <Copy size={16} />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
