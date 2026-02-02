# 🔍 Admin Notification Debugging Guide

## ✅ CRITICAL FIX APPLIED

**Issue Found:** The notification service was looking for table `settings` but the actual table is `store_settings`.

**Fix Applied:** Changed `from('settings')` to `from('store_settings')` in `lib/notificationService.ts`

---

## 🧪 How to Test

### Step 1: Check Admin Settings

1. Open your browser: http://localhost:5000
2. Login as admin
3. Go to **Admin Dashboard** → **Settings** → **Profile**
4. Verify these settings:

```
✅ Email: [your-email@example.com]
✅ Receive Email Notifications: [CHECKED]
✅ Telegram Bot Token: [your-bot-token]
✅ Telegram Chat ID: [your-chat-id]
✅ Receive Telegram Notifications: [CHECKED]
```

### Step 2: Open Browser Console

1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Clear the console (trash icon)

### Step 3: Place Test Order

1. Go to the store (not admin)
2. Add a product to cart
3. Go to checkout
4. Fill in customer details
5. Submit order

### Step 4: Check Console Logs

Look for these messages in the console:

**Success Messages:**
```
[EMAIL SERVICE] Triggering email for customer@example.com (Event: ORDER_CREATED)
[ADMIN NOTIFICATION] Telegram sent: true
[ADMIN NOTIFICATION] Email queued: true
```

**Error Messages (if any):**
```
[ADMIN NOTIFICATION] Admin settings not found: [error details]
[ADMIN NOTIFICATION] Supabase not initialized
[ADMIN NOTIFICATION] Telegram failed: [error]
[ADMIN NOTIFICATION] Error: [error details]
```

### Step 5: Check Notifications Tab

1. Go to **Admin Dashboard** → **Notifications**
2. Look for new entries:
   - Customer email notification
   - Admin Telegram notification
   - Admin email notification

---

## 🐛 Common Issues & Solutions

### Issue 1: "Admin settings not found"

**Cause:** No row in `store_settings` table

**Solution:**
```sql
-- Run in Supabase SQL Editor
INSERT INTO store_settings (id, email, receive_email_notifications, receive_telegram_notifications)
VALUES (1, 'your-email@example.com', true, true)
ON CONFLICT (id) DO UPDATE SET
  email = 'your-email@example.com',
  receive_email_notifications = true,
  receive_telegram_notifications = true;
```

### Issue 2: "Supabase not initialized"

**Cause:** Supabase client not properly configured

**Solution:**
- Check `lib/supabaseClient.ts` exists
- Verify `.env` has correct Supabase URL and key
- Restart dev server

### Issue 3: Telegram not sending

**Possible Causes:**
1. Invalid Bot Token
2. Invalid Chat ID
3. Bot not started in Telegram

**Solution:**
1. Get Bot Token from @BotFather on Telegram
2. Get Chat ID from @userinfobot
3. Start a chat with your bot first
4. Update settings in Admin Panel

### Issue 4: Email not sending

**Possible Causes:**
1. Email provider not configured
2. Email templates not in database
3. Edge function not deployed

**Solution:**
- Check `email_providers` table has Resend configured
- Check `email_templates` table has ORDER_CREATED template
- Verify edge function is deployed

---

## 📊 Database Check

Run these queries in Supabase SQL Editor:

### Check store_settings table:
```sql
SELECT * FROM store_settings;
```

**Expected Result:**
```
id | email              | telegram_bot_token | telegram_chat_id | receive_email_notifications | receive_telegram_notifications
1  | admin@example.com  | 123456:ABC...      | 987654321        | true                        | true
```

### Check if table exists:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'store_settings';
```

**Expected Result:**
```
table_name
store_settings
```

---

## 🔧 Manual Test (Console)

Open browser console and run:

```javascript
// Test Supabase connection
const { data, error } = await window.supabase
  .from('store_settings')
  .select('*')
  .limit(1)
  .single();

console.log('Settings:', data);
console.log('Error:', error);
```

**Expected Output:**
```javascript
Settings: {
  id: 1,
  email: "admin@example.com",
  telegram_bot_token: "123456:ABC...",
  telegram_chat_id: "987654321",
  receive_email_notifications: true,
  receive_telegram_notifications: true,
  ...
}
Error: null
```

---

## 📝 Checklist

Before testing, verify:

- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console is open (F12)
- [ ] Admin settings are configured
- [ ] `store_settings` table exists in Supabase
- [ ] At least one row in `store_settings` table
- [ ] Email and Telegram settings are filled in
- [ ] Notification checkboxes are enabled

---

## 🎯 Expected Behavior

**When order is placed:**

1. **Customer receives:**
   - ✅ Order confirmation email

2. **Admin receives:**
   - ✅ Email notification with order details
   - ✅ Telegram message with order summary

3. **Notification logs show:**
   - ✅ Customer email: Sent
   - ✅ Admin Telegram: Sent
   - ✅ Admin email: Sent

---

## 🚨 If Still Not Working

1. **Check console for errors** - Look for red error messages
2. **Check network tab** - Look for failed API calls
3. **Check Supabase logs** - Go to Supabase Dashboard → Logs
4. **Verify table name** - Make sure it's `store_settings` not `settings`
5. **Check data** - Make sure settings row exists with id=1

**Share the console error messages with me for further debugging!**
