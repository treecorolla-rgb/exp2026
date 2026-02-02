-- Update Telegram Chat ID to Numeric Value
-- Run this in Supabase SQL Editor AFTER you get your numeric chat ID

-- STEP 1: Get your numeric Chat ID
-- ================================
-- Method 1: Message @userinfobot on Telegram
--   - Start a chat with @userinfobot
--   - It will reply with your user ID (this is your chat ID)
--
-- Method 2: Use Telegram API
--   1. Start a chat with your bot @Neworder202GBot
--   2. Send any message to the bot
--   3. Visit this URL in your browser:
--      https://api.telegram.org/bot8104859763:AAHu0gv2A9KtPlg9QEX3AlRwqImQY7ungQc/getUpdates
--   4. Look for "chat":{"id":123456789} in the response
--   5. Copy the numeric ID (e.g., 123456789 or -123456789 for groups)

-- STEP 2: Update your settings with the NUMERIC chat ID
-- ======================================================
-- Replace 'YOUR_NUMERIC_CHAT_ID' with the actual number from Step 1

UPDATE store_settings
SET telegram_chat_id = 'YOUR_NUMERIC_CHAT_ID'  -- Example: '123456789' or '-987654321'
WHERE id = 1;

-- STEP 3: Verify the update
-- =========================
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
-- id | email                  | telegram_bot_token | telegram_chat_id | receive_email_notifications | receive_telegram_notifications
-- 1  | treecorolla@gmail.com  | 8104859763:AAH...  | 123456789        | true                        | true

-- NOTES:
-- ======
-- 1. Chat ID must be NUMERIC (e.g., '123456789')
-- 2. For private chats: positive number (e.g., '123456789')
-- 3. For groups: negative number (e.g., '-987654321')
-- 4. DO NOT use bot username (e.g., '@Neworder202GBot' is WRONG)
