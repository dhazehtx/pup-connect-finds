
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useContactSeller = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const contactSeller = (sellerId: string, listingId: string) => {
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

    // Navigate to messages with proper parameters
    navigate(`/messages?contact=${sellerId}&listing=${listingId}`);
  };

  return { contactSeller };
};
