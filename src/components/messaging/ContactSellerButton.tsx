
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useContactSeller } from '@/hooks/useContactSeller';

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
  const { contactSeller } = useContactSeller();

  const handleContactSeller = () => {
    contactSeller(sellerId, listingId);
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
