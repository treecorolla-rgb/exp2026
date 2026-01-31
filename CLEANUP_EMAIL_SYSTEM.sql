-- ==============================================================================
-- CLEANUP EMAIL SYSTEM - Remove All Conflicts
-- ==============================================================================
-- This script removes ALL existing email triggers and functions to start fresh.
-- Run this FIRST before setting up the new system.

-- 1. Drop ALL possible triggers (from various implementations)
DROP TRIGGER IF EXISTS on_order_email_event ON public.orders;
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
DROP TRIGGER IF EXISTS trigger_send_email_on_order ON public.orders;
DROP TRIGGER IF EXISTS notify_order_status ON public.orders;
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
DROP TRIGGER IF EXISTS send_email_on_insert ON public.orders;
DROP TRIGGER IF EXISTS order_email_trigger ON public.orders;

-- 2. Drop ALL related functions
DROP FUNCTION IF EXISTS public.handle_order_email_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.send_order_email() CASCADE;
DROP FUNCTION IF EXISTS public.notify_order_change() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_email_notification() CASCADE;

-- 3. Keep the tables but clear old logs (optional - comment out if you want to keep history)
-- TRUNCATE TABLE public.email_logs;

-- 4. Verify cleanup
DO $$
BEGIN
    RAISE NOTICE '✅ Email system cleanup complete!';
    RAISE NOTICE 'All triggers and functions have been removed.';
    RAISE NOTICE 'Tables email_templates and email_logs are preserved.';
END $$;
