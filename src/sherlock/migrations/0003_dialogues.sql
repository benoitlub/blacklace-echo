-- Persist only validated Octopus dialogue proposals for real Sherlock encounters.
-- Apply after 0002_cycle_decisions.sql.
CREATE TABLE IF NOT EXISTS sherlock_dialogues (
  session_id TEXT NOT NULL REFERENCES sherlock_sessions(id),
  encounter_id TEXT NOT NULL,
  cycle INTEGER NOT NULL CHECK (cycle >= 1),
  operation_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL CHECK (source = 'octopus'),
  dialogue_json TEXT NOT NULL,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (session_id, encounter_id)
);
CREATE INDEX IF NOT EXISTS idx_sherlock_dialogues_session_cycle
  ON sherlock_dialogues (session_id, cycle);
