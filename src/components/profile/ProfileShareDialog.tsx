
import React, { useState } from 'react';
import { Share, Copy, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfileSharing } from '@/hooks/useProfileSharing';
import { UserProfile } from '@/types/profile';

interface ProfileShareDialogProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileShareDialog: React.FC<ProfileShareDialogProps> = ({
  profile,
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const { generateShareLink, shareViaEmail, shareViaSocial, isSharing } = useProfileSharing();

  const handleCopyLink = async () => {
    try {
      await generateShareLink(profile.id);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
  };

  const handleEmailShare = async () => {
    if (!email) return;
    try {
      await shareViaEmail(profile.id, email);
      setEmail('');
    } catch (error) {
      console.error('Failed to share via email:', error);
    }
  };

  const handleSocialShare = async (platform: 'facebook' | 'twitter' | 'linkedin') => {
    try {
      await shareViaSocial(profile.id, platform);
    } catch (error) {
      console.error('Failed to share on social media:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share size={20} />
            Share Profile
          </DialogTitle>
          <DialogDescription>
            Share your profile with others to increase your visibility and connections.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div>
              <Label htmlFor="share-link">Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  id="share-link"
                  value={`${window.location.origin}/profile/${profile.id}`}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  onClick={handleCopyLink}
                  disabled={isSharing}
                  size="sm"
                >
                  <Copy size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Anyone with this link can view your public profile information.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div>
              <Label htmlFor="email-address">Email Address</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  id="email-address"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleEmailShare}
                  disabled={!email || isSharing}
                  size="sm"
                >
                  <Mail size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Send a direct email with your profile link.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div>
              <Label>Share on Social Media</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button 
                  variant="outline"
                  onClick={() => handleSocialShare('facebook')}
                  disabled={isSharing}
                  className="flex flex-col gap-1 h-16"
                >
                  <Facebook size={20} className="text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSocialShare('twitter')}
                  disabled={isSharing}
                  className="flex flex-col gap-1 h-16"
                >
                  <Twitter size={20} className="text-blue-400" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSocialShare('linkedin')}
                  disabled={isSharing}
                  className="flex flex-col gap-1 h-16"
                >
                  <Linkedin size={20} className="text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Share your profile on your favorite social media platforms.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
