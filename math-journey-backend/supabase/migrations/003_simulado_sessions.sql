-- Progress save table for Simulado ENEM mode (one row per user, upserted)
CREATE TABLE IF NOT EXISTS simulado_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_ids     UUID[]      NOT NULL,
  answers          JSONB       NOT NULL DEFAULT '{}',
  time_remaining_ms INT        NOT NULL DEFAULT 9900000,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE simulado_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "simulado_sessions_own" ON simulado_sessions
  FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
