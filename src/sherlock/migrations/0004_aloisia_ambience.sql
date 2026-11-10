CREATE TABLE IF NOT EXISTS aloisia_ambience (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  phase TEXT NOT NULL CHECK (phase IN ('phase-signal','phase-feuch','phase-reboot','phase-sator')),
  night INTEGER NOT NULL CHECK (night IN (0,1)),
  unstable INTEGER NOT NULL CHECK (unstable IN (0,1)),
  source TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO aloisia_ambience (singleton,phase,night,unstable,source)
VALUES (1,'phase-signal',0,0,'initial');
