-- FreePass production-readiness database fixes.
-- Run in Supabase SQL Editor before shipping the audited build.

-- Resource freshness metadata used by the resource detail UI.
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS last_verified timestamptz;

-- Backfill category_id for imported Adalo resources that only had service-type tags.
WITH category_matches AS (
  SELECT r.id AS resource_id, c.id AS category_id
  FROM public.resources r
  JOIN LATERAL (
    SELECT rc.id
    FROM public.resource_categories rc
    WHERE EXISTS (
      SELECT 1
      FROM unnest(coalesce(r.tags, '{}')) AS tag
      WHERE lower(trim(tag)) = lower(rc.name)
    )
    ORDER BY rc.sort_order NULLS LAST, rc.name
    LIMIT 1
  ) c ON true
  WHERE r.category_id IS NULL
)
UPDATE public.resources r
SET category_id = cm.category_id
FROM category_matches cm
WHERE r.id = cm.resource_id;

-- Remove known filler events that were present in the generated Adalo migration.
DELETE FROM public.events
WHERE title IN (
  'Example resource 2',
  'Example Resource 3',
  'Collecting Resources (test)'
);

-- Allow signed-in users to submit resources/events for staff review.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'resources'
      AND policyname = 'Authenticated users can submit draft resources'
  ) THEN
    CREATE POLICY "Authenticated users can submit draft resources"
      ON public.resources FOR INSERT TO authenticated
      WITH CHECK (is_published = false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'events'
      AND policyname = 'Authenticated users can submit draft events'
  ) THEN
    CREATE POLICY "Authenticated users can submit draft events"
      ON public.events FOR INSERT TO authenticated
      WITH CHECK (is_published = false);
  END IF;
END $$;

-- Community board table required by app/community-board.tsx and app/(drawer)/message-board.tsx.
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_posts'
      AND policyname = 'Anyone can read posts'
  ) THEN
    CREATE POLICY "Anyone can read posts"
      ON public.community_posts FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_posts'
      AND policyname = 'Anyone can post'
  ) THEN
    CREATE POLICY "Anyone can post"
      ON public.community_posts FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_posts'
      AND policyname = 'Users can delete own posts'
  ) THEN
    CREATE POLICY "Users can delete own posts"
      ON public.community_posts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
