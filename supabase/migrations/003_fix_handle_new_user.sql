-- ============================================================
-- WealthPilot AI - Fix handle_new_user trigger
-- Migration: 003_fix_handle_new_user.sql
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_firm_id UUID;
  base_slug TEXT;
  final_slug TEXT;
  firm_display_name TEXT;
BEGIN
  -- Generate firm display name
  firm_display_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'firm_name', ''), 'Advisory Firm');

  -- Generate unique firm slug
  base_slug := COALESCE(NULLIF(NEW.raw_user_meta_data->>'firm_slug', ''), 'firm-' || substr(NEW.id::text, 1, 8));
  final_slug := base_slug || '-' || substr(md5(random()::text), 1, 4);

  -- Create a new firm for the user safely
  INSERT INTO firms (name, slug, plan, meetings_limit, meetings_used)
  VALUES (
    firm_display_name,
    final_slug,
    'free',
    10,
    0
  )
  RETURNING id INTO new_firm_id;

  -- Create or update profile
  INSERT INTO profiles (id, firm_id, email, full_name, role)
  VALUES (
    NEW.id,
    new_firm_id,
    COALESCE(NEW.email, ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(COALESCE(NEW.email, ''), '@', 1)),
    'owner'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    firm_id = EXCLUDED.firm_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevent aborting auth.users insert if relation error occurs
  RAISE WARNING 'handle_new_user trigger encountered error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
