
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import MessageInbox from '@/components/messaging/MessageInbox';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const DEBUG = import.meta.env.DEV && false;

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const contactUserId = searchParams.get('contact');
  const listingId = searchParams.get('listing');

  useEffect(() => {
    if (DEBUG) console.debug('[MESSAGES PAGE] Component state changed', { user: !!user, loading });
  }, [user, loading]);

  useEffect(() => {
    if (DEBUG) console.debug('[MESSAGES PAGE] Component mounted');
  }, []);

  useEffect(() => {
    if (DEBUG) console.debug('[MESSAGES PAGE] Auth state changed:', { user: !!user });
  }, [user]);

  useEffect(() => {
    if (contactUserId && listingId && user) {
      handleContactFlow();
    }
  }, [contactUserId, listingId, user]);

  const handleContactFlow = async () => {
    if (!user || !contactUserId || !listingId) return;
    
    setLoading(true);
    
    try {
      const result = await apiRequest('/messaging/conversations/find-or-create', {
        method: 'POST',
        body: {
          listing_id: listingId,
          seller_id: contactUserId
        }
      });

      if (result?.id) {
        navigate(`/messages/${result.id}`);
        return;
      }
    } catch (error) {
      console.error('Error handling contact flow:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearchParams({});
    }
  };

  const handleConversationSelect = (conversation: any) => {
    navigate(`/messages/${conversation.id}`);
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-white via-slate-50/90 to-blue-50/25">
    <div className="mx-auto max-w-4xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-5 sm:px-6 sm:pt-6">
      <div className="mx-auto mb-5 max-w-xl text-center sm:mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-[15px]">
          Stay connected with breeders and pet lovers — securely, in one place.
        </p>
      </div>
      <MessageInbox onConversationSelect={handleConversationSelect} loading={loading} />
    </div>
    </div>
  );
};

export default Messages;
