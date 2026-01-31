# 🚀 Email System - Complete Setup Guide

**Last Updated:** 2026-01-31  
**Status:** Ready to Deploy

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Resend Account** - Sign up at [resend.com](https://resend.com)
- [ ] **Verified Domain** - Add DNS records and verify your domain
- [ ] **Resend API Key** - Get from [resend.com/api-keys](https://resend.com/api-keys)
- [ ] **Supabase Project** - Your project URL and service role key
- [ ] **Supabase CLI** - Install with `npm install -g supabase`

---

## 🎯 Setup Steps

### Step 1: Verify Your Domain on Resend

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `airmailchemist.com`)
4. Add the DNS records to your domain provider:
   - **DKIM Record** (TXT)
   - **SPF Record** (TXT)
5. Wait for verification (usually 5-15 minutes)
6. Confirm status shows "Verified" ✅

### Step 2: Clean Up Existing Email System

Run this SQL in Supabase SQL Editor:

```sql
-- File: CLEANUP_EMAIL_SYSTEM.sql
```

This removes all conflicting triggers and functions.

### Step 3: Set Up Email Provider

1. Open `SETUP_EMAIL_PROVIDERS.sql`
2. **IMPORTANT:** Replace these placeholders:
   ```sql
   'api_key', 'YOUR_RESEND_API_KEY_HERE',  -- Replace with actual key
   'domain', 'YOUR_VERIFIED_DOMAIN_HERE'    -- Replace with your domain
   ```
3. Run the updated SQL in Supabase SQL Editor

### Step 4: Install Email Templates & Triggers

Run this SQL in Supabase SQL Editor:

```sql
-- File: RESTORE_EMAIL_SYSTEM_SAFE.sql
```

This creates:
- Email templates (ORDER_CREATED, PAYMENT_SUCCESS, etc.)
- Email logs table
- Database trigger that auto-queues emails

### Step 5: Deploy Edge Function

```bash
# Navigate to your project
cd "c:\Users\Computer2025\Documents\Anti Gravity\exp2026"

# Login to Supabase (if not already)
supabase login

# Link to your project (first time only)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the email-dispatcher function
supabase functions deploy email-dispatcher
```

### Step 6: Set Up Webhook

1. Go to **Supabase Dashboard** → **Database** → **Webhooks**
2. Click "Create a new hook"
3. Configure:
   - **Name:** `send-email-worker`
   - **Table:** `email_logs`
   - **Events:** Check only `INSERT`
   - **Type:** `Supabase Edge Function`
   - **Edge Function:** Select `email-dispatcher`
4. Click "Create webhook"

### Step 7: Test the System

Run this SQL to send a test email:

```sql
INSERT INTO public.email_logs (
    status, 
    recipient_email, 
    recipient_name, 
    template_id, 
    context_data
) 
SELECT 
    'PENDING', 
    'YOUR_EMAIL@gmail.com',  -- ⚠️ REPLACE WITH YOUR EMAIL
    'Test User', 
    id, 
    jsonb_build_object(
        'order_id', 'TEST-001',
        'customer_name', 'Test User',
        'total_amount', '$99.99'
    )
FROM public.email_templates 
WHERE event_trigger = 'ORDER_CREATED' 
LIMIT 1;
```

---

## ✅ Verification

After running the test:

1. **Check Supabase Logs:**
   - Dashboard → Edge Functions → `email-dispatcher` → Logs
   - Should see: "📧 Email Dispatcher triggered" and "✅ Email sent via Resend"

2. **Check Email Logs Table:**
   ```sql
   SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
   ```
   - Status should change from `PENDING` → `SENT`

3. **Check Your Inbox:**
   - You should receive the test email within 1-2 minutes

4. **Check Resend Dashboard:**
   - Go to [resend.com/emails](https://resend.com/emails)
   - Should see the sent email in the logs

---

## 🔧 Troubleshooting

### Issue: "No active email provider configured"

**Solution:** Run `SETUP_EMAIL_PROVIDERS.sql` with your actual API key and domain.

### Issue: "Unauthorized" or "Domain not verified"

**Solution:** 
1. Check domain verification status on Resend
2. Ensure DNS records are correct
3. Wait 15-30 minutes for DNS propagation

### Issue: Email stays in PENDING status

**Solution:**
1. Check webhook is created correctly
2. Verify edge function is deployed: `supabase functions list`
3. Check edge function logs for errors

### Issue: "Failed to fetch email log"

**Solution:** Ensure RLS policies are set correctly (run `RESTORE_EMAIL_SYSTEM_SAFE.sql` again)

---

## 📊 How It Works

```
┌─────────────────┐
│  Order Created  │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Insert Order   │
│  into Database  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Database Trigger Fires │
│  (handle_order_email_   │
│   trigger function)     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Insert into email_logs │
│  (status: PENDING)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Webhook Triggers       │
│  email-dispatcher       │
│  Edge Function          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Fetch Provider & Tmpl  │
│  Render Email HTML      │
│  Call Resend API        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update email_logs      │
│  (status: SENT)         │
└─────────────────────────┘
```

---

## 🎨 Customizing Email Templates

To modify email templates:

```sql
UPDATE email_templates 
SET 
    subject = 'New Subject {{order_id}}',
    body_html = '<div>New HTML content with {{variables}}</div>'
WHERE event_trigger = 'ORDER_CREATED';
```

Available variables depend on the trigger:
- `ORDER_CREATED`: order_id, customer_name, total_amount
- `PAYMENT_SUCCESS`: order_id, amount_paid, payment_method
- `ORDER_SHIPPED`: order_id, tracking_number, courier_name

---

## 🚨 Important Notes

1. **Security:** Never commit your Resend API key to Git
2. **Rate Limits:** Resend free tier has limits - check your plan
3. **Testing:** Always test with your own email first
4. **Production:** Consider adding retry logic for failed emails
5. **Monitoring:** Regularly check `email_logs` table for failures

---

## 📞 Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check Resend dashboard logs
3. Query `email_logs` table for error messages
4. Verify all prerequisites are complete

---

**Ready to go? Start with Step 1! 🚀**
