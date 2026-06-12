ALTER TABLE community_items ADD COLUMN owner_key TEXT;
ALTER TABLE community_items ADD COLUMN owner_email TEXT;
ALTER TABLE community_items ADD COLUMN owner_order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_community_items_type_owner_key
  ON community_items (type, owner_key);

CREATE INDEX IF NOT EXISTS idx_community_items_type_owner_email
  ON community_items (type, owner_email);
