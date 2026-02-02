-- ==============================================================================
-- EMAIL SYSTEM TEST SCRIPT
-- ==============================================================================
-- Run this script to verify your email system is working correctly.
-- Replace YOUR_EMAIL@gmail.com with your actual email address.

-- Test 1: Check if tables exist
DO $$
DECLARE
    templates_count INTEGER;
    providers_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO templates_count FROM email_templates;
    SELECT COUNT(*) INTO providers_count FROM email_providers WHERE is_active = true;
    
    RAISE NOTICE '=== EMAIL SYSTEM STATUS ===';
    RAISE NOTICE 'Email Templates: %', templates_count;
    RAISE NOTICE 'Active Providers: %', providers_count;
    
    IF templates_count = 0 THEN
        RAISE WARNING '⚠️  No email templates found! Run RESTORE_EMAIL_SYSTEM_SAFE.sql';
    END IF;
    
    IF providers_count = 0 THEN
        RAISE WARNING '⚠️  No active email provider! Run SETUP_EMAIL_PROVIDERS.sql';
    END IF;
    
    IF templates_count > 0 AND providers_count > 0 THEN
        RAISE NOTICE '✅ System is configured!';
    END IF;
END $$;

-- Test 2: Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_name LIKE '%email%';

-- Test 3: View available templates
SELECT 
    event_trigger,
    name,
    is_active,
    created_at
FROM email_templates
ORDER BY event_trigger;

-- Test 4: View recent email logs
SELECT 
    id,
    recipient_email,
    status,
    error_message,
    created_at,
    sent_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 10;

-- Test 5: Send a test email (REPLACE YOUR_EMAIL@gmail.com)
INSERT INTO public.email_logs (
    status, 
    recipient_email, 
    recipient_name, 
    template_id, 
    context_data
) 
SELECT 
    'PENDING', 
    'YOUR_EMAIL@gmail.com',  -- ⚠️ REPLACE THIS WITH YOUR EMAIL
    'Test User', 
    id, 
    jsonb_build_object(
        'order_id', 'TEST-' || to_char(now(), 'YYYYMMDDHH24MISS'),
        'customer_name', 'Test User',
        'total_amount', '$99.99',
        'shipping_address', '123 Test Street, Test City, TC 12345'
    )
FROM public.email_templates 
WHERE event_trigger = 'ORDER_CREATED' 
LIMIT 1
RETURNING id, recipient_email, status;

-- Test 6: Check if the test email was processed (wait 5-10 seconds, then run this)
-- SELECT 
--     id,
--     recipient_email,
--     status,
--     error_message,
--     created_at,
--     sent_at
-- FROM email_logs
-- WHERE created_at > now() - interval '1 minute'
-- ORDER BY created_at DESC;

-- ==============================================================================
-- EXPECTED RESULTS:
-- ==============================================================================
-- Test 1: Should show template count > 0 and provider count = 1
-- Test 2: Should show 'on_order_email_event' trigger
-- Test 3: Should list ORDER_CREATED, PAYMENT_SUCCESS, etc.
-- Test 4: Shows recent email history
-- Test 5: Creates a new PENDING email
-- Test 6: Email status should change to SENT (or FAILED with error message)
-- ==============================================================================
