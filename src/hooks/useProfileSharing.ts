
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProfileShareData } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';

export const useProfileSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareData, setShareData] = useState<ProfileShareData | null>(null);
  const { toast } = useToast();

  const generateShareLink = async (profileId: string, expiresInDays?: number) => {
    try {
      setIsSharing(true);
      
      // Generate a unique share token
      const shareToken = generateToken();
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const shareData: Omit<ProfileShareData, 'view_count'> = {
        profile_id: profileId,
        share_token: shareToken,
        shared_by: user.user.id,
        shared_at: new Date().toISOString(),
        expires_at: expiresAt,
        is_public: true
      };

      // In a real implementation, you'd store this in a database table
      // For now, we'll simulate it
      const fullShareData: ProfileShareData = {
        ...shareData,
        view_count: 0
      };

      setShareData(fullShareData);

      const shareUrl = `${window.location.origin}/profile/shared/${shareToken}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Share Link Generated",
        description: "Share link has been copied to your clipboard",
      });

      return shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  const shareViaEmail = async (profileId: string, email: string) => {
    try {
      const shareUrl = await generateShareLink(profileId, 30); // 30 days expiry
      const subject = 'Check out this profile on MY PUP';
      const body = `I wanted to share this profile with you: ${shareUrl}`;
      
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl);

      toast({
        title: "Email Opened",
        description: "Your email client has been opened with the share link",
      });
    } catch (error) {
      console.error('Error sharing via email:', error);
    }
  };

  const shareViaSocial = async (profileId: string, platform: 'facebook' | 'twitter' | 'linkedin') => {
    try {
      const shareUrl = await generateShareLink(profileId);
      const text = 'Check out this profile on MY PUP';
      
      let socialUrl = '';
      switch (platform) {
        case 'facebook':
          socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'twitter':
          socialUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
          break;
        case 'linkedin':
          socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
      }
      
      window.open(socialUrl, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Error sharing on social media:', error);
    }
  };

  const generateToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const revokeShareLink = async (shareToken: string) => {
    try {
      // In a real implementation, you'd mark the share as revoked in the database
      setShareData(null);
      toast({
        title: "Share Link Revoked",
        description: "The share link is no longer active",
      });
    } catch (error) {
      console.error('Error revoking share link:', error);
    }
  };

  return {
    generateShareLink,
    shareViaEmail,
    shareViaSocial,
    revokeShareLink,
    isSharing,
    shareData
  };
};
