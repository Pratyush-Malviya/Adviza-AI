-- ============================================================
-- Adviza AI - Chat & Orchestration Schema
-- Migration: 005_chat_schema.sql
-- ============================================================

-- ============================================================
-- CHAT SESSIONS (conversation threads per advisor & firm)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Advisor Assistant Session',
  context_metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHAT MESSAGES (persisted messages with WORM compliance audit hooks)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  capability_calls JSONB NOT NULL DEFAULT '[]',
  hitl_decision JSONB,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER for chat_sessions
-- ============================================================
CREATE TRIGGER chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chat_sessions_firm_id ON chat_sessions(firm_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_firm_id ON chat_messages(firm_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at ASC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat Sessions: scoped to user's firm & user
CREATE POLICY "chat_sessions: firm members can read their sessions"
  ON chat_sessions FOR SELECT
  USING (firm_id = get_my_firm_id() AND user_id = auth.uid());

CREATE POLICY "chat_sessions: users can insert their sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id() AND user_id = auth.uid());

CREATE POLICY "chat_sessions: users can update their sessions"
  ON chat_sessions FOR UPDATE
  USING (firm_id = get_my_firm_id() AND user_id = auth.uid());

CREATE POLICY "chat_sessions: users can delete their sessions"
  ON chat_sessions FOR DELETE
  USING (firm_id = get_my_firm_id() AND user_id = auth.uid());

-- Chat Messages: scoped to firm & user
CREATE POLICY "chat_messages: firm members can read session messages"
  ON chat_messages FOR SELECT
  USING (firm_id = get_my_firm_id());

CREATE POLICY "chat_messages: users can insert messages into their session"
  ON chat_messages FOR INSERT
  WITH CHECK (firm_id = get_my_firm_id());

CREATE POLICY "chat_messages: system/user can update messages (e.g. HITL decision)"
  ON chat_messages FOR UPDATE
  USING (firm_id = get_my_firm_id());
