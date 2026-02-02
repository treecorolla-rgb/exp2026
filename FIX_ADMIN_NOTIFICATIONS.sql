-- Fix Admin Notification Settings
-- Run this in Supabase SQL Editor

-- 1. Ensure store_settings table exists and has required columns
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS receive_email_notifications BOOLEAN DEFAULT true;

ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS receive_telegram_notifications BOOLEAN DEFAULT true;

ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT;

ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- 2. Insert or update default settings row
INSERT INTO store_settings (
  id, 
  email, 
  receive_email_notifications, 
  receive_telegram_notifications
)
VALUES (
  1, 
  'admin@example.com',  -- CHANGE THIS to your email
  true, 
  true
)
ON CONFLICT (id) DO UPDATE SET
  receive_email_notifications = true,
  receive_telegram_notifications = true;

-- 3. Verify settings
SELECT 
  id,
  email,
  telegram_bot_token,
  telegram_chat_id,
  receive_email_notifications,
  receive_telegram_notifications
FROM store_settings
WHERE id = 1;

-- Expected output:
-- id | email              | telegram_bot_token | telegram_chat_id | receive_email_notifications | receive_telegram_notifications
-- 1  | admin@example.com  | (your token)       | (your chat id)   | true                        | true
