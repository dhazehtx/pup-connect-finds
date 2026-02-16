
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
      const response = await apiRequest('/api/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { targetUserId: sellerId, listing_id: listingId }
      });
      console.log('[PROOF:MSG] response', response);

      if (response.ok && response.conversationId) {
        await apiRequest('/api/messaging/messages', {
          method: 'POST',
          body: {
            conversation_id: response.conversationId,
            content: `Hi! I'm interested in this puppy. Could you tell me more?`
          }
        });
        navigate(`/messages/${response.conversationId}`);
      } else {
        toast({
          title: "Messaging unavailable",
          description: `Messaging unavailable (${response.code || 'UNKNOWN'})`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('[PROOF:MSG:ERR] ContactSeller', error?.message);
      let code = 'UNKNOWN';
      try {
        const jsonMatch = error?.message?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          code = parsed.code || code;
        }
      } catch {}
      toast({
        title: "Messaging unavailable",
        description: `Messaging unavailable (${code})`,
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
