export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY, 
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  author TEXT DEFAULT 'Social Studio Editor',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS variants (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  tone TEXT DEFAULT 'balanced',
  hashtags TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  idempotency_key TEXT UNIQUE NOT NULL,
  retry_count INTEGER DEFAULT 0,
  locked_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS publish_history (
  id TEXT PRIMARY KEY,
  slot_id TEXT,
  variant_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  adapter_used TEXT NOT NULL,
  status TEXT NOT NULL,
  live_url TEXT,
  platform_post_id TEXT,
  error_message TEXT,
  latency_ms INTEGER DEFAULT 0,
  idempotency_key TEXT NOT NULL,
  metadata TEXT,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  idempotency_key TEXT PRIMARY KEY,
  slot_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  status TEXT NOT NULL,
  response_payload TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mock_storage (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  variant_id TEXT,
  live_mock_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
