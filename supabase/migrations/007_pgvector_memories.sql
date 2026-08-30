-- ============================================================
-- 007_pgvector_memories.sql
-- Mem0 pgvector Semantic Search & Embeddings Integration
-- ============================================================

-- 1. Enable pgvector extension if available
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to user_memories (768 dimensions for Gemini text-embedding-004)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_memories' 
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE public.user_memories ADD COLUMN embedding vector(768);
  END IF;
END $$;

-- 3. Create HNSW index for high-speed cosine distance lookups
CREATE INDEX IF NOT EXISTS idx_user_memories_embedding 
  ON public.user_memories 
  USING hnsw (embedding vector_cosine_ops);

-- 4. Matching RPC function for semantic similarity search with RLS enforcement
CREATE OR REPLACE FUNCTION match_user_memories(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  target_user_id uuid
)
RETURNS TABLE (
  id uuid,
  memory text,
  category text,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    um.id,
    um.memory,
    um.category,
    um.metadata,
    um.created_at,
    um.updated_at,
    1 - (um.embedding <=> query_embedding) AS similarity
  FROM public.user_memories um
  WHERE um.user_id = target_user_id
    AND um.embedding IS NOT NULL
    AND 1 - (um.embedding <=> query_embedding) > match_threshold
  ORDER BY um.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
