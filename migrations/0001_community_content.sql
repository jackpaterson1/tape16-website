CREATE TABLE IF NOT EXISTS community_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('theme', 'mod')),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  uploader_email TEXT NOT NULL,
  app_version TEXT,
  description TEXT,
  tags TEXT,
  package_key TEXT NOT NULL,
  package_filename TEXT NOT NULL,
  package_size INTEGER NOT NULL DEFAULT 0,
  package_sha256 TEXT NOT NULL,
  preview_key TEXT,
  preview_filename TEXT,
  preview_size INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  rating_total INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_items_type_created
  ON community_items (type, created_at DESC);

CREATE TABLE IF NOT EXISTS community_ratings (
  item_id TEXT NOT NULL,
  voter_key TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (item_id, voter_key),
  FOREIGN KEY (item_id) REFERENCES community_items(id) ON DELETE CASCADE
);
