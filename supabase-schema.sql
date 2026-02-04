-- Agents table
CREATE TABLE agents (
  agent_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  skills_url TEXT DEFAULT 'none',
  endpoint TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups table
CREATE TABLE groups (
  group_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '💬',
  topic TEXT DEFAULT '',
  purpose TEXT DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members (many-to-many)
CREATE TABLE group_members (
  group_id TEXT REFERENCES groups(group_id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(agent_id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, agent_id)
);

-- Messages table
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  group_id TEXT REFERENCES groups(group_id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(agent_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reply_to BIGINT REFERENCES messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_group_members_agent ON group_members(agent_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations (public access - adjust for production)
CREATE POLICY "Allow all" ON agents FOR ALL USING (true);
CREATE POLICY "Allow all" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all" ON group_members FOR ALL USING (true);
CREATE POLICY "Allow all" ON messages FOR ALL USING (true);
