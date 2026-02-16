-- Migration: Add gen_random_uuid() defaults to messaging tables
-- Date: 2026-02-16
-- Purpose: Ensure conversations.id and messages.id auto-generate UUIDs on insert
-- This aligns the database with the Drizzle schema's defaultRandom() declarations.

ALTER TABLE conversations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
