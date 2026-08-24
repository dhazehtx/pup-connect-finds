-- =============================================================================
-- Escrow INSERT policy hardening (policy-only, additive)
-- =============================================================================
-- The live `escrow_transactions` INSERT policy ("System can insert escrow
-- transactions") uses WITH CHECK (true), which would let any authenticated user
-- insert an escrow row with an arbitrary buyer_id/seller_id (a write-integrity /
-- spoofing weakness). This replaces it with an owner-scoped rule that matches the
-- table's existing SELECT/UPDATE policies:
--     buyer_id = auth.uid() OR seller_id = auth.uid()
--
-- Legitimate escrow creation flows through the service-role Supabase edge
-- functions (create-escrow-transaction / create-escrow-payment / create-escrow-
-- dispute), which BYPASS RLS entirely — so this change constrains only direct
-- anon/authenticated PostgREST inserts and does not affect the real workflow.
-- (anon has auth.uid() = NULL, so it can no longer insert at all.)
--
-- Policy-only: no table drop, no column change, no row deletion. Idempotent.
-- OWNER ACTION REQUIRED: apply to production (wneticxjhxpjpfghnclr). Not applied here.
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escrow_transactions'
  ) THEN
    -- Remove the permissive policy (by its live name) and any prior copy of the
    -- replacement so this migration is safe to re-run.
    DROP POLICY IF EXISTS "System can insert escrow transactions" ON public.escrow_transactions;
    DROP POLICY IF EXISTS "Users can insert their own escrow transactions" ON public.escrow_transactions;

    CREATE POLICY "Users can insert their own escrow transactions"
      ON public.escrow_transactions
      FOR INSERT
      WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());
  END IF;
END
$$;

-- =============================================================================
-- VERIFICATION (read-only, run after applying)
--   SELECT policyname, cmd, with_check
--     FROM pg_policies
--    WHERE schemaname='public' AND tablename='escrow_transactions' AND cmd='INSERT';
--     -> exactly one INSERT policy, with_check = (buyer_id = auth.uid() OR seller_id = auth.uid())
--   SELECT count(*) FROM pg_policies
--    WHERE schemaname='public' AND tablename='escrow_transactions'
--      AND cmd='INSERT' AND btrim(coalesce(with_check,'')) = 'true';
--     -> 0  (no unrestricted WITH CHECK(true) remains)
-- =============================================================================
