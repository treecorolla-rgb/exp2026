# ✅ Email System - Final Setup Steps

**Status:** Database setup complete! Now deploy the edge function.

---

## 📊 What You've Done So Far:

✅ **Step 1:** Domain verification (you should do this on Resend.com)  
✅ **Step 2:** Cleanup - Removed old triggers  
✅ **Step 3:** Provider table - Created (API keys NOT in database)  
✅ **Step 4:** Email templates & triggers - Installed  

---

## 🚀 Next Steps:

### Step 5: Set Your API Key and Domain (Backend Environment)

You have **TWO options** to set your Resend API key and domain:

#### **Option A: Via Supabase CLI** (Recommended)

```bash
# Navigate to your project
cd "c:\Users\Computer2025\Documents\Anti Gravity\exp2026"

# Login to Supabase
supabase login

# Link to your project (replace YOUR_PROJECT_REF)
supabase link --project-ref YOUR_PROJECT_REF

# Set your secrets (REPLACE with your actual values!)
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
supabase secrets set RESEND_DOMAIN=yourdomain.com

# Deploy the edge function
supabase functions deploy email-dispatcher
```

#### **Option B: Via Supabase Dashboard** (Easier)

1. Go to your **Supabase Dashboard**
2. Navigate to **Edge Functions** → **email-dispatcher**
3. Click **Settings** → **Secrets**
4. Add two secrets:
   - `RESEND_API_KEY` = your Resend API key (e.g., `re_xxxxxxxxxxxxx`)
   - `RESEND_DOMAIN` = your verified domain (e.g., `airmailchemist.com`)
5. Click **Save**
6. Deploy the function (see Step 6 below)

---

### Step 6: Deploy the Edge Function

```bash
cd "c:\Users\Computer2025\Documents\Anti Gravity\exp2026"
supabase functions deploy email-dispatcher
```

Or via Dashboard:
1. Go to **Edge Functions** → **email-dispatcher**
2. Click **Deploy**

---

### Step 7: Create Webhook

1. Go to **Supabase Dashboard** → **Database** → **Webhooks**
2. Click **"Create a new hook"**
3. Configure:
   - **Name:** `send-email-worker`
   - **Table:** `email_logs`
   - **Events:** Check **INSERT** only (uncheck UPDATE, DELETE)
   - **Type:** `Supabase Edge Function`
   - **Edge Function:** Select `email-dispatcher`
4. Click **Create webhook**

---

### Step 8: Configure in Your Admin Panel

1. Open your app: `http://localhost:5000`
2. Login to admin panel
3. Go to **Email System** → **Server Config** tab
4. Enter your **Sending Domain** (e.g., `airmailchemist.xyz`)
5. Check **"Set as Active Provider"**
6. Click **"Save Configuration"**
7. Click **"Test Connection"** and enter your email

---

## 🔐 Why This is Secure:

✅ **API keys are in backend environment** - Not in database  
✅ **Can't be leaked via SQL** - No way to query them  
✅ **Not in Git** - Won't accidentally commit  
✅ **Easy to rotate** - Just update the secret and redeploy  
✅ **Encrypted at rest** - Supabase encrypts all secrets  

---

## 📝 To Update Your API Key Later:

### Via CLI:
```bash
supabase secrets set RESEND_API_KEY=new_key_here
supabase functions deploy email-dispatcher
```

### Via Dashboard:
1. Edge Functions → email-dispatcher → Settings → Secrets
2. Update `RESEND_API_KEY`
3. Click Save
4. Redeploy function

**No database changes needed!**

---

## ✅ Verification:

After completing all steps:

1. **Check Edge Function Logs:**
   - Dashboard → Edge Functions → email-dispatcher → Logs
   - Should see: "📧 Email Dispatcher triggered"

2. **Check Email Logs Table:**
   ```sql
   SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
   ```
   - Status should change from `PENDING` → `SENT`

3. **Check Your Inbox:**
   - Test email should arrive within 1-2 minutes

4. **Check Resend Dashboard:**
   - [resend.com/emails](https://resend.com/emails)
   - Should see sent emails

---

## 🎯 Where to Get Your Credentials:

### Resend API Key:
1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Copy the key (starts with `re_`)

### Verified Domain:
1. Go to [resend.com/domains](https://resend.com/domains)
2. Add your domain
3. Add DNS records (DKIM, SPF)
4. Wait for verification
5. Use the verified domain name

### Supabase Project Reference:
1. Go to your Supabase Dashboard
2. Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
3. Copy `YOUR_PROJECT_REF`

---

## 🎨 Your Admin Panel UI:

The admin panel now shows:
- 🔐 **Security notice** explaining keys are in backend
- 📝 **Domain field** (editable - saved to database)
- 🔒 **API key field** (read-only - shows dots)
- ✅ **Active provider checkbox**
- 🧪 **Test connection button**
- 💾 **Save configuration button**

---

**Ready?** Start with Step 5 - set your API key and domain in Supabase! 🚀
