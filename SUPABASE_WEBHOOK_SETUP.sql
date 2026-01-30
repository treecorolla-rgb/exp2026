-- ==============================================================================
-- SETUP DATABASE WEBHOOK FOR EMAILS
-- ==============================================================================
-- This SQL sets up a Database Webhook that triggers the Edge Function
-- whenever a new row is inserted into `email_logs`.

-- 1. Create the Trigger
-- NOTE: You must replace 'YOUR_FUNCTION_URL' and 'YOUR_SERVICE_ROLE_KEY' 
-- if you are running this manually. 
-- However, in Supabase Dashboard -> Database -> Webhooks, you can set this up UI-based 
-- or use the `supabase_functions` utility if available.

-- The standard way (raw SQL) to call an edge function from a trigger is via `pg_net` (http extension).
-- Make sure the extension is enabled:
create extension if not exists pg_net;

-- 2. Define the Trigger Function
create or replace function public.trigger_send_email_function()
returns trigger as $$
declare
  request_id bigint;
begin
  -- Call the Edge Function via HTTP POST
  -- Replace [PROJECT_REF] with your actual Supabase project ref
  -- Replace [FUNCTION_SECRET] with `Authorization: Bearer <SERVICE_ROLE_KEY>`
  
  -- IMPORTANT: For security, it is often better to use a dedicated "Schedule" or 
  -- have the Edge Function poll the database, OR use the Supabase Dashboard "Webhooks" UI 
  -- which handles the signing securely.
  
  -- BELOW IS A SIMPLIFIED EXAMPLE using pg_net.
  
  -- Ideally, user should configure this in Dashboard -> Database -> Webhooks -> Add Webhook
  -- Table: public.email_logs
  -- Event: INSERT
  -- Type: HTTP Request
  -- URL: https://[PROJECT_REF].supabase.co/functions/v1/send-email
  -- Method: POST
  -- Headers: Content-Type: application/json, Authorization: Bearer [ANON_KEY_OR_SERVICE_KEY]
  
  return new;
end;
$$ language plpgsql;

-- NO AUTOMATED SQL for Webhooks is provided here because it requires sensitive keys/URLs 
-- that are specific to your deployment.
--
-- INSTRUCTIONS:
-- 1. Deploy the function: `supabase functions deploy send-email`
-- 2. Go to Supabase Dashboard -> Database -> Webhooks
-- 3. Create a new Webhook:
--    - Name: Send Email Worker
--    - Table: public.email_logs
--    - Events: INSERT
--    - Type: HTTP Request
--    - URL: (Get this from your `supabase functions deploy` output)
--    - Method: POST
--    - Header: Authorization: Bearer [YOUR_SERVICE_ROLE_KEY]
--    - Timeout: 5000ms

-- Alternatively, enable the `pg_net` extension and use `net.http_post` if you prefer SQL-only.
