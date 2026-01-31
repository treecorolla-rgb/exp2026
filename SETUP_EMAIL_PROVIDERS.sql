-- ==============================================================================
-- SETUP EMAIL PROVIDERS TABLE (SIMPLIFIED - NO API KEYS IN DB)
-- ==============================================================================
-- This creates a simple email_providers table to track which provider is active.
-- API keys and domains are stored in Supabase Edge Function secrets (secure).
-- Run this AFTER cleanup and BEFORE the restore script.

-- 1. Drop and recreate table to ensure clean state
DROP TABLE IF EXISTS public.email_providers CASCADE;

-- 2. Create email_providers table (simplified - no sensitive data)
CREATE TABLE public.email_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_type TEXT NOT NULL CHECK (provider_type IN ('RESEND', 'SMTP', 'MAILGUN', 'SENDGRID')),
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb, -- Optional config (non-sensitive only)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.email_providers ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (admin-only access recommended)
DROP POLICY IF EXISTS "Admin read providers" ON public.email_providers;
DROP POLICY IF EXISTS "Admin manage providers" ON public.email_providers;

CREATE POLICY "Admin read providers" 
    ON public.email_providers 
    FOR SELECT 
    USING (true); -- In production, restrict to admin role

CREATE POLICY "Admin manage providers" 
    ON public.email_providers 
    FOR ALL 
    USING (true); -- In production, restrict to admin role

-- 5. Insert Resend Provider (just marking it as active)
INSERT INTO public.email_providers (provider_type, display_name, is_active, is_default, config)
VALUES (
    'RESEND',
    'Resend Email Service',
    true,
    true,
    '{}'::jsonb  -- No sensitive data here!
);

-- 6. Verification
DO $$
DECLARE
    provider_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO provider_count FROM public.email_providers WHERE is_active = true;
    
    RAISE NOTICE '✅ Email provider table created successfully!';
    RAISE NOTICE 'Active providers: %', provider_count;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Set your Resend API key and domain as Edge Function secrets:';
    RAISE NOTICE '   supabase secrets set RESEND_API_KEY=your_api_key_here';
    RAISE NOTICE '   supabase secrets set RESEND_DOMAIN=your_domain_here';
END $$;

-- ==============================================================================
-- INSTRUCTIONS:
-- ==============================================================================
-- API keys and domains are now stored as Edge Function secrets (more secure).
-- After running this script, set your secrets using Supabase CLI:
--
-- supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
-- supabase secrets set RESEND_DOMAIN=yourdomain.com
--
-- Or via Supabase Dashboard:
-- Edge Functions → email-dispatcher → Settings → Secrets
-- ==============================================================================
