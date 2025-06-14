
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const { user } = useAuth();
  const { createConversation } = useRealTimeMessages();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleContactSeller = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot start a conversation with yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      const conversation = await createConversation(listingId, sellerId);
      if (conversation) {
        navigate(`/messages?conversation=${conversation.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
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
