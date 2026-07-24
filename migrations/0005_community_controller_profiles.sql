PRAGMA foreign_keys=off;

CREATE TABLE IF NOT EXISTS community_items_new (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('theme', 'mod', 'midi_profile', 'controller_profile')),
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
  owner_key TEXT,
  owner_email TEXT,
  owner_order_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO community_items_new (
  id, type, slug, name, creator_name, uploader_email, app_version, description, tags,
  package_key, package_filename, package_size, package_sha256,
  preview_key, preview_filename, preview_size,
  download_count, rating_count, rating_total,
  owner_key, owner_email, owner_order_id,
  created_at, updated_at
)
SELECT
  id, type, slug, name, creator_name, uploader_email, app_version, description, tags,
  package_key, package_filename, package_size, package_sha256,
  preview_key, preview_filename, preview_size,
  download_count, rating_count, rating_total,
  owner_key, owner_email, owner_order_id,
  created_at, updated_at
FROM community_items;

DROP TABLE community_items;

ALTER TABLE community_items_new RENAME TO community_items;

CREATE INDEX IF NOT EXISTS idx_community_items_type_created
  ON community_items (type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_items_type_owner_key
  ON community_items (type, owner_key);

CREATE INDEX IF NOT EXISTS idx_community_items_type_owner_email
  ON community_items (type, owner_email);

PRAGMA foreign_keys=on;
