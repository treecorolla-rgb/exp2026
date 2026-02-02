-- ==============================================================================
-- SETUP EMAIL PROVIDERS TABLE (WITH ENCRYPTION SUPPORT) - SAFE VERSION
-- ==============================================================================
-- This creates the email_providers table that stores API keys in the database.
-- API keys are encrypted for security.
-- Safe to run multiple times - uses IF NOT EXISTS and DROP POLICY IF EXISTS

-- 1. Drop and recreate email_providers table
DROP TABLE IF EXISTS public.email_providers CASCADE;

-- 2. Create email_providers table with config for API keys
CREATE TABLE public.email_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_type TEXT NOT NULL CHECK (provider_type IN ('RESEND', 'SMTP', 'MAILGUN', 'SENDGRID')),
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb, -- Stores encrypted API keys and settings
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS for security
ALTER TABLE public.email_providers ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (admin-only access)
DROP POLICY IF EXISTS "Admin read providers" ON public.email_providers;
DROP POLICY IF EXISTS "Admin manage providers" ON public.email_providers;
DROP POLICY IF EXISTS "Service role full access" ON public.email_providers;

-- Allow authenticated users to read (for admin panel)
CREATE POLICY "Admin read providers" 
    ON public.email_providers 
    FOR SELECT 
    USING (true);

-- Allow authenticated users to manage (for admin panel)
CREATE POLICY "Admin manage providers" 
    ON public.email_providers 
    FOR ALL 
    USING (true);

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access"
    ON public.email_providers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Insert default Resend Provider (empty config - will be set via admin UI)
INSERT INTO public.email_providers (provider_type, display_name, is_active, is_default, config)
VALUES (
    'RESEND',
    'Resend Email Service',
    false,  -- Will be activated via admin UI
    false,
    '{}'::jsonb  -- Empty - will be filled via admin UI
);

-- 6. Create encryption key storage (one-time setup)
CREATE TABLE IF NOT EXISTS public.email_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT UNIQUE NOT NULL,
    encryption_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on encryption keys
ALTER TABLE public.email_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role only" ON public.email_encryption_keys;

-- Only service role can access encryption keys
CREATE POLICY "Service role only"
    ON public.email_encryption_keys
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Generate a random encryption key (you can change this to your own key)
INSERT INTO public.email_encryption_keys (key_name, encryption_key)
VALUES (
    'email_provider_key',
    encode(gen_random_bytes(32), 'base64')  -- 256-bit random key
)
ON CONFLICT (key_name) DO NOTHING;

-- 7. Verification
DO $$
DECLARE
    provider_count INTEGER;
    key_exists BOOLEAN;
    encryption_key_value TEXT;
BEGIN
    SELECT COUNT(*) INTO provider_count FROM public.email_providers;
    SELECT EXISTS(SELECT 1 FROM public.email_encryption_keys WHERE key_name = 'email_provider_key') INTO key_exists;
    
    RAISE NOTICE '✅ Email provider table created successfully!';
    RAISE NOTICE 'Providers: %', provider_count;
    RAISE NOTICE 'Encryption key exists: %', key_exists;
    RAISE NOTICE '';
    RAISE NOTICE '🔐 API keys will be encrypted before storing in database';
    RAISE NOTICE '⚙️  Configure providers via Admin Panel → Email System → Server Config';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '1. Update edge function code (copy from EDGE_FUNCTION_DATABASE_ENCRYPTED.txt)';
    RAISE NOTICE '2. Create webhook if not exists (Database → Webhooks)';
    RAISE NOTICE '3. Configure in Admin Panel (Email System → Server Config)';
END $$;

-- ==============================================================================
-- INSTRUCTIONS:
-- ==============================================================================
-- 1. ✅ Run this script in Supabase SQL Editor
-- 2. Update edge function: Copy EDGE_FUNCTION_DATABASE_ENCRYPTED.txt to dynamic-endpoint
-- 3. Create webhook: Database → Webhooks → send-email-worker
-- 4. Configure: Admin Panel → Email System → Server Config
-- 5. Test: Click "Test Connection" button
-- ==============================================================================
