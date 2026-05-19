-- conversation_participants: join table for multi-user conversations
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT uq_conv_participant UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participant_user ON public.conversation_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participant_conv ON public.conversation_participants (conversation_id);

-- Backfill participants from legacy buyer_id / seller_id on conversations
INSERT INTO public.conversation_participants (conversation_id, user_id)
SELECT c.id, c.buyer_id
FROM public.conversations c
WHERE c.buyer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = c.id AND cp.user_id = c.buyer_id
  )
ON CONFLICT (conversation_id, user_id) DO NOTHING;

INSERT INTO public.conversation_participants (conversation_id, user_id)
SELECT c.id, c.seller_id
FROM public.conversations c
WHERE c.seller_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = c.id AND cp.user_id = c.seller_id
  )
ON CONFLICT (conversation_id, user_id) DO NOTHING;
