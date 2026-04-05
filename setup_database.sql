-- Run this SQL in your Supabase Dashboard SQL Editor!

-- 1. Create table for tracking character votes globally
CREATE TABLE IF NOT EXISTS character_votes (
    tag text primary key,
    votes integer default 0
);

-- 2. Enable Row Level Security (RLS) properly
ALTER TABLE character_votes ENABLE ROW LEVEL SECURITY;

-- 3. Allow absolutely anyone (anon clients) to read the votes
CREATE POLICY "Allow public read access"
  ON character_votes
  FOR SELECT
  USING (true);

-- 4. Create a secure Postgres Function (RPC) that allows frontends to add 1 safely!
-- This prevents users from manually passing arbitrary numbers and trying to cheat.
CREATE OR REPLACE FUNCTION increment_vote(character_tag_val text)
RETURNS void AS $$
BEGIN
  -- Perform an atomic update to prevent race conditions
  UPDATE character_votes
  SET votes = votes + 1
  WHERE tag = character_tag_val;

  -- If character doesn't exist in DB yet, insert them with 1 vote to kick off the ranking
  IF NOT FOUND THEN
    INSERT INTO character_votes (tag, votes) VALUES (character_tag_val, 1);
  END IF;
END;
$$ LANGUAGE plpgsql;
