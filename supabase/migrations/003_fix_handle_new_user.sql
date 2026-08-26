-- ============================================================
-- WealthPilot AI - Fix handle_new_user trigger with schema qualification
-- Migration: 003_fix_handle_new_user.sql
-- ============================================================

-- Ensure public schema extensions are active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Make sure handle_new_user uses public search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions, pg_temp
AS $$
DECLARE
  new_firm_id UUID;
  base_slug TEXT;
  final_slug TEXT;
  firm_display_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract and sanitize firm name
  firm_display_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'firm_name'), ''), 'Advisory Firm');

  -- Extract and sanitize user full name
  user_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(COALESCE(NEW.email, 'Advisor'), '@', 1)
  );

  -- Generate collision-proof firm slug
  base_slug := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'firm_slug'), ''),
    'firm-' || substr(NEW.id::text, 1, 8)
  );
  final_slug := base_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);

  -- 1. Insert Firm
  INSERT INTO public.firms (name, slug, plan, meetings_limit, meetings_used)
  VALUES (
    firm_display_name,
    final_slug,
    'free',
    10,
    0
  )
  RETURNING id INTO new_firm_id;

  -- 2. Insert Profile
  INSERT INTO public.profiles (id, firm_id, email, full_name, role)
  VALUES (
    NEW.id,
    new_firm_id,
    COALESCE(NEW.email, ''),
    user_full_name,
    'owner'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    firm_id = EXCLUDED.firm_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log warning but do not crash auth.users insertion
  RAISE WARNING 'handle_new_user error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop and recreate the auth trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
