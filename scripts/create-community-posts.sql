-- Run this in your Supabase SQL editor to enable the community board

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
  ON community_posts FOR SELECT USING (true);

CREATE POLICY "Anyone can post"
  ON community_posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE USING (auth.uid() = user_id);
