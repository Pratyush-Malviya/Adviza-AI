-- ============================================================
-- 005_mem0_memory_schema.sql
-- Mem0 Long-Term Memory & Adaptive Persona Storage Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
  agent_id TEXT DEFAULT 'adviza_orchestrator',
  session_id TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('preference', 'persona', 'fact', 'client_context', 'workflow_habit', 'general')),
  memory TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own memories"
  ON public.user_memories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON public.user_memories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON public.user_memories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON public.user_memories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for ultra-fast recall and semantic querying
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON public.user_memories (user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_category ON public.user_memories (category);
CREATE INDEX IF NOT EXISTS idx_user_memories_updated_at ON public.user_memories (updated_at DESC);
