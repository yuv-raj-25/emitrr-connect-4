-- Add losses and draws columns to the leaderboard table
ALTER TABLE leaderboard
  ADD COLUMN IF NOT EXISTS losses INT DEFAULT 0 CHECK (losses >= 0),
  ADD COLUMN IF NOT EXISTS draws INT DEFAULT 0 CHECK (draws >= 0);
