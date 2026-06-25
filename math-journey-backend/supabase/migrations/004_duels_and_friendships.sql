-- Duel rating columns on user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS duel_rating  INT NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS duel_wins    INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS duel_losses  INT NOT NULL DEFAULT 0;

-- ── Duels ──────────────────────────────────────────────────────────────────
-- status: 'pending' = waiting for opponent | 'active' = both joined, play in progress
--         'completed' = both answered | 'cancelled' = expired/withdrawn
CREATE TABLE IF NOT EXISTS duels (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id              UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  status                   TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','active','completed','cancelled')),
  invite_code              TEXT        UNIQUE,
  question_ids             UUID[]      NOT NULL,

  -- Challenger
  challenger_answers       JSONB       NOT NULL DEFAULT '{}',
  challenger_correct       INT,
  challenger_time_ms       INT,
  challenger_played_at     TIMESTAMPTZ,

  -- Opponent
  opponent_answers         JSONB       NOT NULL DEFAULT '{}',
  opponent_correct         INT,
  opponent_time_ms         INT,
  opponent_played_at       TIMESTAMPTZ,

  -- Result
  winner_id                UUID        REFERENCES auth.users(id),
  challenger_rating_change INT,
  opponent_rating_change   INT,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at               TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  completed_at             TIMESTAMPTZ
);

ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "duels_participants_read" ON duels
  FOR SELECT TO authenticated
  USING (
    auth.uid() = challenger_id
    OR auth.uid() = opponent_id
    OR (status = 'pending' AND opponent_id IS NULL)
  );

CREATE POLICY "duels_challenger_insert" ON duels
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "duels_participants_update" ON duels
  FOR UPDATE TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE INDEX IF NOT EXISTS duels_challenger_idx ON duels (challenger_id, status);
CREATE INDEX IF NOT EXISTS duels_opponent_idx   ON duels (opponent_id,   status);

-- ── Friendships ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','accepted','blocked')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CONSTRAINT no_self_friend CHECK (requester_id != addressee_id)
);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friendships_own" ON friendships
  FOR ALL TO authenticated
  USING  (auth.uid() = requester_id OR auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = requester_id);

CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON friendships (addressee_id, status);
