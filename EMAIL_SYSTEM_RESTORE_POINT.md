# Email System Setup - Restore Point
**Date:** 2026-01-30
**Status:** Paused (Waiting for Domain Verification)

## 1. What has been done?
*   **Database**: Created `email_templates` and `email_logs` tables using `SUPABASE_EMAIL_SYSTEM.sql`.
*   **Edge Function**: Created and deployed the `send-email` function (TypeScript) to Supabase.
*   **Webhook**: Configured the `send-email-worker` webhook in Supabase Dashboard to trigger on `INSERT` to `email_logs`.

## 2. Where did we stop?
The system is fully built, but emails are **not sending** yet.
*   **Reason**: We are using Resend.com as the provider. Resend requires you to strictly verify a domain (DNS records) before you can send emails from it.
*   **Current Error**: The function likely fails with `Unauthorized` or `Validation Error` because `noreply@airmailchemist.com` is not a verified sender yet.

## 3. INSTRUCTIONS TO RESUME
When you return with your new domain, follow these steps:

### Step 1: Verify Domain on Resend
1.  Go to [Resend.com](https://resend.com) -> Domains.
2.  Add your new domain (e.g., `airmailchemist.com`).
3.  Add the DNS records (DKIM/SPF) to your domain provider (GoDaddy, Namecheap, etc.).
4.  Wait for it to show **"Verified"**.

### Step 2: Update the Edge Function
1.  Go to **Supabase Dashboard** -> **Edge Functions** -> `send-email`.
2.  Edit the code. Find this line:
    ```typescript
    const fromEmail = "AirMail Chemist <noreply@airmailchemist.com>";
    ```
3.  Change the email to match your newly verified domain (e.g., `noreply@your-new-domain.com`).
4.  **Click Deploy/Save**.

### Step 3: Test Again
Run this SQL query in Supabase SQL Editor to send a fresh test email:
```sql
INSERT INTO public.email_logs (
  status, recipient_email, recipient_name, template_id, context_data
) 
SELECT 
  'PENDING', 
  'your_real_email@gmail.com', -- CHANGE THIS
  'Test User', 
  id, 
  '{"order_id": "RESUME-TEST", "total_amount": "50.00", "customer_name": "Test User"}'::jsonb
FROM public.email_templates 
WHERE event_trigger = 'ORDER_CREATED' 
LIMIT 1;
```

### Step 4: Debug (If needed)
*   Check **Supabase Dashboard -> Edge Functions -> send-email -> Logs**.
*   Check **Resend Dashboard -> Logs**.
