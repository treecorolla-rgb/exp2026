# 🚀 Email System - Complete Setup Guide (Secure Version)

**Last Updated:** 2026-01-31  
**Status:** Ready to Deploy (API Keys in Environment Variables)

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

---

### Step 2: Clean Up Existing Email System

✅ **DONE** - You already ran this!

```sql
-- File: CLEANUP_EMAIL_SYSTEM.sql
-- Status: Success. No rows returned
```

---

### Step 3: Set Up Email Provider Table

Run this SQL in Supabase SQL Editor:

```sql
-- File: SETUP_EMAIL_PROVIDERS.sql
```

**Note:** This version does NOT store API keys in the database. It just marks Resend as the active provider.

---

### Step 4: Install Email Templates & Triggers

Run this SQL in Supabase SQL Editor:

```sql
-- File: RESTORE_EMAIL_SYSTEM_SAFE.sql
```

This creates:
- Email templates (ORDER_CREATED, PAYMENT_SUCCESS, etc.)
- Email logs table
- Database trigger that auto-queues emails

---

### Step 5: Deploy Edge Function with Secrets

```bash
# Navigate to your project
cd "c:\Users\Computer2025\Documents\Anti Gravity\exp2026"

# Login to Supabase (if not already)
supabase login

# Link to your project (first time only)
supabase link --project-ref YOUR_PROJECT_REF

# Set your Resend API key as a secret (SECURE!)
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here

# Set your verified domain as a secret
supabase secrets set RESEND_DOMAIN=yourdomain.com

# Deploy the email-dispatcher function
supabase functions deploy email-dispatcher
```

**Alternative: Set Secrets via Dashboard**
1. Go to **Supabase Dashboard** → **Edge Functions** → `email-dispatcher`
2. Click **Settings** → **Secrets**
3. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_DOMAIN` = your verified domain

---

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

---

### Step 7: Test the System

Run this SQL to send a test email:

```sql
-- File: TEST_EMAIL_SYSTEM.sql
-- Make sure to replace YOUR_EMAIL@gmail.com with your actual email
```

Or run this directly:

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

### 1. Check Supabase Edge Function Logs
- Dashboard → Edge Functions → `email-dispatcher` → Logs
- Should see:
  ```
  📧 Email Dispatcher triggered
  ✅ Using Resend API (domain: yourdomain.com)
  📤 Sending email from: noreply@yourdomain.com
  ✅ Email sent via Resend! ID: xxx
  ```

### 2. Check Email Logs Table
```sql
SELECT 
    id,
    recipient_email,
    status,
    error_message,
    created_at,
    sent_at
FROM email_logs 
ORDER BY created_at DESC 
LIMIT 5;
```
- Status should change from `PENDING` → `SENT`

### 3. Check Your Inbox
- You should receive the test email within 1-2 minutes

### 4. Check Resend Dashboard
- Go to [resend.com/emails](https://resend.com/emails)
- Should see the sent email in the logs

---

## 🔧 Troubleshooting

### Issue: "RESEND_API_KEY not configured"

**Solution:** Set the secret:
```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
```

Or via Dashboard: Edge Functions → email-dispatcher → Settings → Secrets

### Issue: "Unauthorized" or "Domain not verified"

**Solution:** 
1. Check domain verification status on Resend
2. Ensure DNS records are correct
3. Wait 15-30 minutes for DNS propagation
4. Make sure `RESEND_DOMAIN` matches your verified domain exactly

### Issue: Email stays in PENDING status

**Solution:**
1. Check webhook is created correctly
2. Verify edge function is deployed: `supabase functions list`
3. Check edge function logs for errors
4. Verify secrets are set: `supabase secrets list`

### Issue: "Failed to fetch email log"

**Solution:** Ensure RLS policies are set correctly (run `RESTORE_EMAIL_SYSTEM_SAFE.sql` again)

---

## 🔐 Security Benefits

### Why Environment Variables are Better:

✅ **Not stored in database** - Can't be leaked via SQL injection  
✅ **Not in version control** - Won't accidentally commit to Git  
✅ **Easy to rotate** - Change keys without touching database  
✅ **Encrypted at rest** - Supabase encrypts all secrets  
✅ **Separate per environment** - Different keys for dev/staging/prod  

### To Update Your API Key:

```bash
# Just update the secret and redeploy
supabase secrets set RESEND_API_KEY=new_key_here
supabase functions deploy email-dispatcher
```

No database changes needed!

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
│  Read RESEND_API_KEY    │ ← From Environment!
│  from Deno.env          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Fetch Template         │
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

---

## 📞 Quick Reference Commands

```bash
# View current secrets
supabase secrets list

# Set a secret
supabase secrets set KEY_NAME=value

# Deploy function
supabase functions deploy email-dispatcher

# View function logs
supabase functions logs email-dispatcher

# Test locally (optional)
supabase functions serve email-dispatcher
```

---

**Ready to go? Start with Step 1! 🚀**

**Current Progress:**
- ✅ Step 2: Cleanup complete
- ⏭️ Next: Step 3 (Set up provider table)
