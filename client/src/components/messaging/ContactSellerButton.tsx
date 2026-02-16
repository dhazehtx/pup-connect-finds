
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface ContactSellerButtonProps {
  listingId: string;
  sellerId: string;
  className?: string;
  children?: React.ReactNode;
}

const ContactSellerButton = ({ 
  listingId, 
  sellerId, 
  className = '',
  children 
}: ContactSellerButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContactSeller = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
        variant: "destructive",
      });
      return;
    }

    if (sellerId === user.id) {
      toast({
        title: "Cannot contact yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('[MESSAGE] ContactSeller fired, seller:', sellerId, 'listing:', listingId);
      const conv = await apiRequest('/api/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { seller_id: sellerId, listing_id: listingId }
      });
      console.log('[MESSAGE] ContactSeller conversation result:', conv);

      if (conv?.id) {
        await apiRequest('/api/messaging/messages', {
          method: 'POST',
          body: {
            conversation_id: conv.id,
            content: `Hi! I'm interested in this puppy. Could you tell me more?`
          }
        });
        navigate(`/messages/${conv.id}`);
      } else {
        console.warn('[MESSAGE] No conversation id returned:', conv);
        navigate('/messages');
      }
    } catch (error: any) {
      console.error('[MESSAGE] ContactSeller error:', error);
      const msg = error?.message || '';
      toast({
        title: "Couldn't start conversation",
        description: msg.includes('404') ? "Seller profile not found" : "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleContactSeller}
      className={className}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || 'Contact Seller'}
    </Button>
  );
};

export default ContactSellerButton;
