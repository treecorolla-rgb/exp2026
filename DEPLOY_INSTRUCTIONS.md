# Deployment Instructions for Email System

Follow these steps to deploy your new email notification system to Supabase.

## 1. Prerequisites

Ensure you have the Supabase CLI installed. If not:
- **Windows (Scoop):** `scoop bucket add supabase https://github.com/supabase/scoop-bucket.git && scoop install supabase`
- **MacOS/Linux (Homebrew):** `brew install supabase/tap/supabase`
- **NPM:** `npm install -g supabase`

## 2. Login to Supabase

Open your terminal in the project root (`c:\Users\Computer2025\Documents\Anti Gravity\exp2026`) and run:

```bash
npx supabase login
```
Follow the browser instructions to authenticate.

---

## 3. Deploy the Edge Function

Run the following command to deploy the function code we created:

```bash
npx supabase functions deploy send-order-email --no-verify-jwt
```
*Note: The `--no-verify-jwt` flag is important because the function is called via a database webhook, not a user request.*

---

## 4. Set Environment Secrets (CRITICAL)

Your function needs access to your database and your email provider (Resend). 

Get these keys:
- **SUPABASE_URL**: Found in Supabase Settings -> API.
- **SUPABASE_SERVICE_ROLE_KEY**: Found in Supabase Settings -> API (service_role secret).
- **RESEND_API_KEY**: Get this from your [Resend.com Dashboard](https://resend.com/api-keys).

Run this command, replacing the values with your actual keys:

```bash
npx supabase secrets set --env-file .env RESEND_API_KEY=re_12345678 SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

*Alternatively, you can set these in the Supabase Dashboard under **Edge Functions -> send-order-email -> Secrets**.*

---

## 5. Connect the Database Webhook

This is the final step that connects your Database `INSERT` trigger to the Function.

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Database** -> **Webhooks**.
3.  Click **"Create a new webhook"**.
4.  **Name**: `trigger-email-function`
5.  **Conditions**:
    - **Table**: `public.email_logs`
    - **Events**: Check `INSERT`
6.  **Webhook Configuration**:
    - **Type**: `HTTP Request`
    - **Method**: `POST`
    - **URL**: `https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-order-email`
      *(Replace `<YOUR_PROJECT_REF>` with your actual project ID found in the URL)*
    - **Timeout**: `5000` (5 seconds)
7.  **HTTP Headers**:
    - Add a new header:
      - **Name**: `Content-Type`
      - **Value**: `application/json`
    - Add authorization header (Optional but recommended):
      - **Name**: `Authorization`
      - **Value**: `Bearer <YOUR_ANON_KEY>`
8.  Click **Confirm**.

---

## 6. Test It!

To verifies it works:
1.  Go to your app and **Place a Test Order**.
2.  Check the `email_logs` table in Supabase. You should see a new row.
3.  Wait a few seconds. The `status` column should change from `PENDING` to `SENT`.
4.  Check your inbox!
