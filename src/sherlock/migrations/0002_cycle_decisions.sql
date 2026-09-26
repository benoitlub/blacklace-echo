-- Apply after 0001_world_log.sql. Stores decision provenance in the same transaction as cycle events.
CREATE TABLE IF NOT EXISTS sherlock_cycle_decisions (
  session_id TEXT NOT NULL REFERENCES sherlock_sessions(id),
  cycle INTEGER NOT NULL CHECK (cycle >= 1),
  operation_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source = 'octopus'),
  actor_id TEXT NOT NULL,
  action_json TEXT NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (session_id, cycle),
  UNIQUE (operation_id)
);
