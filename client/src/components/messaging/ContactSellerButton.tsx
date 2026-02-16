
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const conv = await apiRequest('/api/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { seller_id: sellerId, listing_id: listingId }
      });
      console.log('[PROOF:MSG:OK] ContactSeller', JSON.stringify(conv));

      const cid = conv?.conversationId || conv?.id;
      if (cid) {
        await apiRequest('/api/messaging/messages', {
          method: 'POST',
          body: {
            conversation_id: cid,
            content: `Hi! I'm interested in this puppy. Could you tell me more?`
          }
        });
        navigate(`/messages/${cid}`);
      } else {
        console.warn('[PROOF:MSG:ERR] No conversationId in response');
        navigate('/messages');
      }
    } catch (error: any) {
      const code = error?.message?.match(/failed (\d+)/)?.[1] || 'UNKNOWN';
      console.error('[PROOF:MSG:ERR] ContactSeller', code, error?.message);
      toast({
        title: "Messaging unavailable",
        description: `Messaging unavailable (see logs) [${code}]`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleContactSeller}
      className={className}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4 mr-2" />
      )}
      {children || 'Contact Seller'}
    </Button>
  );
};

export default ContactSellerButton;
