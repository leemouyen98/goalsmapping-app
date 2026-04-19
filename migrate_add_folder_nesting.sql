-- Add parent_id to knowledge_folders for nested folder support
-- Run: npx wrangler d1 execute goalsmapping-db --remote --file=migrate_add_folder_nesting.sql

ALTER TABLE knowledge_folders ADD COLUMN parent_id TEXT REFERENCES knowledge_folders(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_knowledge_folders_parent ON knowledge_folders(parent_id);
