# 🔐 Email System Setup - Database Storage with Encryption

**Complete guide for setting up email system with encrypted API keys stored in database**

---

## ✅ **What You Get:**

1. ✅ **Admin UI Control** - Manage everything from your admin panel
2. ✅ **Database Storage** - API keys stored in `email_providers` table
3. ✅ **Encryption** - API keys are encrypted before storage
4. ✅ **Flexibility** - Switch between RESEND, SMTP, MAILGUN anytime
5. ✅ **No Supabase Access Needed** - Employees only need admin panel access
6. ✅ **Secure** - Encrypted keys + RLS policies

---

## 📋 **Step-by-Step Setup:**

### **Step 1: Run the New Database Setup**

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Copy and paste the contents of: `SETUP_EMAIL_PROVIDERS_ENCRYPTED.sql`
4. Click **Run**

**This creates:**
- ✅ `email_providers` table (with `config` JSONB column)
- ✅ `email_encryption_keys` table (stores encryption key)
- ✅ RLS policies for security
- ✅ Random 256-bit encryption key

---

### **Step 2: Update Edge Function Code**

1. Go to **Supabase Dashboard** → **Edge Functions** → **`dynamic-endpoint`**
2. Click **Code** tab
3. **Delete all existing code**
4. Copy and paste the contents of: `EDGE_FUNCTION_DATABASE_ENCRYPTED.txt`
5. Click **Deploy** button

**This function:**
- ✅ Reads provider config from database
- ✅ Decrypts API keys automatically
- ✅ Supports RESEND, MAILGUN, SMTP
- ✅ Handles errors gracefully

---

### **Step 3: Create Webhook (if not already done)**

1. Go to **Database** → **Webhooks**
2. Click **"Create a new hook"**
3. Configure:
   - **Name:** `send-email-worker`
   - **Table:** `email_logs`
   - **Events:** Check **INSERT** only
   - **Type:** Select **"Supabase Edge Functions"**
   - **Edge Function:** Select **`dynamic-endpoint`**
4. Click **Create webhook**

---

### **Step 4: Configure via Admin Panel**

1. Open your app: `http://localhost:5000`
2. Login to admin panel
3. Go to **Email System** → **Server Config** tab
4. Select **RESEND** provider
5. Enter your **API KEY** (will be encrypted automatically!)
6. Enter your **SENDING DOMAIN** (e.g., `airmailchemist.xyz`)
7. Check **"Set as Active Provider"**
8. Click **"Save Configuration"**

**Behind the scenes:**
- ✅ API key is encrypted using XOR encryption
- ✅ Encrypted key is stored in database with `ENC:` prefix
- ✅ Domain is stored in plain text (not sensitive)

---

### **Step 5: Test the System**

#### **Option A: Test via Admin Panel**
1. In Email System → Server Config
2. Click **"Test Connection"** button
3. Enter your email address
4. Check your inbox!

#### **Option B: Test via SQL**
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
    'your_email@gmail.com',  -- ⚠️ REPLACE THIS
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

## 🔐 **How Encryption Works:**

### **Encryption (Admin Panel → Database):**
```
1. User enters API key: "re_abc123xyz"
2. System fetches encryption key from database
3. XOR encryption applied
4. Encrypted result: "ENC:SGVsbG8gV29ybGQ="
5. Saved to database
```

### **Decryption (Edge Function → Resend API):**
```
1. Edge function reads from database: "ENC:SGVsbG8gV29ybGQ="
2. Detects "ENC:" prefix
3. Fetches encryption key
4. XOR decryption applied
5. Original key restored: "re_abc123xyz"
6. Used to call Resend API
```

---

## 🔒 **Security Features:**

### **1. Encryption**
- ✅ API keys encrypted before storage
- ✅ XOR encryption with 256-bit random key
- ✅ Encryption key stored in separate table
- ✅ Can upgrade to AES encryption if needed

### **2. Row Level Security (RLS)**
- ✅ `email_providers` - Authenticated users can read/write
- ✅ `email_encryption_keys` - Service role only
- ✅ Prevents unauthorized access

### **3. Access Control**
- ✅ Admin panel requires login
- ✅ Employees don't need Supabase access
- ✅ All changes via admin UI only

---

## 🎯 **How to Switch Providers:**

### **Switch to SMTP:**
1. Admin Panel → Email System → Server Config
2. Click **SMTP** button
3. Enter: Host, Port, User, Password
4. Check "Set as Active Provider"
5. Click "Save Configuration"

### **Switch to Mailgun:**
1. Click **MAILGUN** button
2. Enter: API Key, Domain
3. Check "Set as Active Provider"
4. Click "Save Configuration"

**No code changes needed!** Everything is managed via UI.

---

## ✅ **Verification Checklist:**

After setup, verify:

### **1. Database Tables**
```sql
-- Check email_providers table
SELECT * FROM email_providers;

-- Check encryption key exists
SELECT key_name FROM email_encryption_keys;

-- Check email templates
SELECT * FROM email_templates;
```

### **2. Edge Function Logs**
- Dashboard → Edge Functions → dynamic-endpoint → Logs
- Should see: `📧 Email Dispatcher triggered`
- Should see: `Using provider: RESEND`

### **3. Email Logs**
```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
```
- Status should change: `PENDING` → `SENT`

### **4. Your Inbox**
- Test email should arrive within 1-2 minutes

---

## 🔄 **How to Update API Key Later:**

1. Open Admin Panel
2. Go to Email System → Server Config
3. Enter new API key
4. Click "Save Configuration"

**That's it!** The new key will be encrypted and saved automatically.

---

## 📊 **Database Schema:**

### **email_providers**
```sql
id UUID PRIMARY KEY
provider_type TEXT (RESEND, SMTP, MAILGUN, SENDGRID)
display_name TEXT
is_active BOOLEAN
is_default BOOLEAN
config JSONB  -- { "api_key": "ENC:...", "domain": "..." }
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### **email_encryption_keys**
```sql
id UUID PRIMARY KEY
key_name TEXT UNIQUE
encryption_key TEXT  -- Base64 encoded 256-bit key
created_at TIMESTAMPTZ
```

---

## 🚀 **Benefits of This Approach:**

✅ **Easy Management** - Everything via admin UI  
✅ **No CLI Required** - Pure web interface  
✅ **Encrypted Storage** - API keys are encrypted  
✅ **Flexible** - Switch providers anytime  
✅ **Employee Friendly** - No Supabase access needed  
✅ **Secure** - RLS policies + encryption  
✅ **Maintainable** - All config in one place  

---

## 🆘 **Troubleshooting:**

### **Email not sending?**
1. Check Edge Function logs for errors
2. Verify API key is correct (re-enter in admin panel)
3. Check domain is verified on Resend.com
4. Verify webhook is created and active

### **"No active email provider" error?**
1. Go to Admin Panel → Email System → Server Config
2. Make sure "Set as Active Provider" is checked
3. Click "Save Configuration"

### **Encryption errors?**
1. Check `email_encryption_keys` table exists
2. Run `SETUP_EMAIL_PROVIDERS_ENCRYPTED.sql` again if needed

---

**You're all set!** 🎉 Your email system is now secure, flexible, and easy to manage!
