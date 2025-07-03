
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleContactSeller = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
      });
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

    // Navigate to messages with the listing context
    navigate(`/messages?contact=${sellerId}&listing=${listingId}`);
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
