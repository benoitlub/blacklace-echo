-- Apply with wrangler d1 migrations apply after provisioning a dedicated D1 database.
-- No automatic deletion or canon promotion.
CREATE TABLE IF NOT EXISTS sherlock_sessions (
  id TEXT PRIMARY KEY,
  initial_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sherlock_events (
  sequence INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sherlock_sessions(id),
  cycle INTEGER NOT NULL CHECK (cycle >= 1),
  position INTEGER NOT NULL CHECK (position >= 0),
  event_id TEXT NOT NULL,
  event_json TEXT NOT NULL,
  UNIQUE (session_id, cycle, position),
  UNIQUE (session_id, event_id)
);
CREATE INDEX IF NOT EXISTS sherlock_events_session_sequence
  ON sherlock_events (session_id, sequence);
