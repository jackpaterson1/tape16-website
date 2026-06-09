CREATE TABLE IF NOT EXISTS community_downloads (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  downloaded_at TEXT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES community_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_community_downloads_item_time
  ON community_downloads (item_id, downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_downloads_time
  ON community_downloads (downloaded_at DESC);
