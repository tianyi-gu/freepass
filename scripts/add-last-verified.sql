-- Add last_verified column to resources to track data freshness.
-- Run this in the Supabase SQL editor.

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS last_verified timestamptz;

-- Mark all existing records as unverified (null means unknown).
-- Optionally seed with created_at as a baseline:
-- UPDATE public.resources SET last_verified = created_at WHERE last_verified IS NULL;
