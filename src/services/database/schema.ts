export const DATABASE_NAME = 'sticker_album.db';
export const DATABASE_VERSION = 1;

export const createSchemaSql = `
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  mascot_id TEXT NOT NULL,
  favorite_team_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_stickers (
  sticker_id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  quantity_owned INTEGER NOT NULL DEFAULT 0,
  quantity_duplicate INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_stickers_status
ON user_stickers(status);

CREATE INDEX IF NOT EXISTS idx_activity_events_created_at
ON activity_events(created_at);
`;