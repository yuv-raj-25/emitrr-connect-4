-- Games table stores match history
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY,
  player1 VARCHAR(100) NOT NULL,
  player2 VARCHAR(100) NOT NULL,
  winner VARCHAR(100),
  duration INT CHECK (duration >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT distinct_players CHECK (player1 <> player2)
);

CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Leaderboard table stores aggregate stats
CREATE TABLE IF NOT EXISTS leaderboard (
  username VARCHAR(100) PRIMARY KEY,
  wins INT DEFAULT 0 CHECK (wins >= 0),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
