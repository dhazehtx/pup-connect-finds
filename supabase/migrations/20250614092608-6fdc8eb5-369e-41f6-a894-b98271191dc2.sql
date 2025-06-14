
-- Add foreign key constraints for conversations table to profiles
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_buyer_id_profiles_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_seller_id_profiles_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for messages table to profiles
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_profiles_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraints to link conversations and messages to listings
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_listing_id_dog_listings_id_fkey 
FOREIGN KEY (listing_id) REFERENCES public.dog_listings(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_conversation_id_conversations_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;
