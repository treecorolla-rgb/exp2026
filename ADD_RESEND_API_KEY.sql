-- Add Resend API Key column to store_settings table
-- This allows admin emails to be sent directly via Resend API

-- 1. Add column if it doesn't exist
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS resend_api_key TEXT;

-- 2. Update with your Resend API key
-- Get your API key from: https://resend.com/api-keys
UPDATE store_settings
SET resend_api_key = 'YOUR_RESEND_API_KEY_HERE'  -- Replace with actual key (starts with re_)
WHERE id = 1;

-- 3. Verify
SELECT 
  email,
  resend_api_key,
  receive_email_notifications,
  receive_telegram_notifications
FROM store_settings
WHERE id = 1;

-- ✅ Expected Result:
-- email: treecorolla@gmail.com
-- resend_api_key: re_xxxxxxxxxxxxx (your actual key)
-- receive_email_notifications: true
-- receive_telegram_notifications: true
