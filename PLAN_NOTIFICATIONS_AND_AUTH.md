# 📋 Master Plan: Notifications & User Accounts

## 🎯 Objective
Expand the system to support **SMS/WhatsApp notifications** using the existing trigger architecture, and implement a full **User Account system** with Email/SMS login and Order History.

---

## 📱 Phase 1: SMS & WhatsApp Notifications
**Strategy:** Reuse the robust `database-trigger -> webhook -> edge-function` architecture we built for emails.

### **1. Database Schema**
We need tables to store SMS/WhatsApp specific data.
- **`sms_provider_config`**: To store Twilio/WhatsApp credentials (Encrypted, same as Email).
- **`sms_templates`**: Short text templates (e.g., "Your order #123 is confirmed").
- **`sms_logs`**: Queue for outgoing messages (`PENDING`, `SENT`, `FAILED`).

### **2. The "Unified" Trigger Logic**
We perform a **Non-Destructive Upgrade** to the existing `handle_order_email_trigger`.
- **Rename Trigger:** `handle_order_notification_trigger`.
- **Logic Flow:**
  1. Detect Event (e.g., `ORDER_SHIPPED`).
  2. **Email Branch:** Look up Email Template -> Insert into `email_logs`.
  3. **SMS Branch:** Look up SMS Template -> Insert into `sms_logs` (if customer has phone number).
  4. **WhatsApp Branch:** (Optional) Check if user opted-in for WhatsApp -> Insert into `sms_logs` with channel='WHATSAPP'.

### **3. Edge Function (`notification-dispatcher`)**
- Create a new webhook `send-sms-worker` watching `sms_logs`.
- Logic:
  1. Read `sms_logs`.
  2. Fetch Encrypted Twilio Credentials from DB.
  3. Send Message via Twilio API.
  4. Update Log to `SENT`.
- **Benefit:** Runs completely independently of the email system. If SMS fails, Email still works (and vice versa).

---

## 👤 Phase 2: User Accounts & Authentication

### **1. Supabase Auth Configuration**
- **Email:** Enable Email/Password and Magic Link.
- **Phone:** Enable Phone Provider (via Twilio).
- **Security:** Ensure RLS policies in DB allow users to read ONLY their own data.

### **2. Frontend Improvements**
- **Login Screen:** Add tabs for [Email] and [Phone].
- **OTP Handling:** specific UI input for entering the 6-digit code.

### **3. The "Smart Link" System (Crucial)**
Currently, all orders are "Guest Orders". We need to connect them to real users.
- **Add Column:** `orders.user_id` (Nullable UUID).
- **Auto-Link Logic:**
  - When a user logs in, trigger a database function: `link_past_orders(email, phone)`.
  - This searches for any existing orders with matching Email OR Phone.
  - Updates those orders with the new `user_id`.
  - **Result:** User sees their entire history immediately, even orders placed as a guest.

### **4. User Dashboard**
- **Tabs:**
  - **My Orders:** List of orders (Status, Items, Tracking Link).
  - **Address Book:** table `user_addresses`. CRUD (Create, Read, Update, Delete) addresses.
  - **Profile:** Update Phone/Email.

---

## 🗓️ Execution Steps

1.  **DB Setup (SMS):** Create SMS tables and encryption logic.
2.  **Trigger Update:** Modify the Postgres Function to handle SMS queuing.
3.  **Edge Function:** Deploy SMS dispatcher.
4.  **Backend Auth:** Enable Supabase Phone Auth.
5.  **Frontend Auth:** Build Login/OTP UI.
6.  **Dashboard:** Build "My Orders" and "Address Book" pages.

---

## ❓ Decisions for User
1.  **Provider:** Do you strictly want **Twilio** (Standard for SMS & WhatsApp)? 
2.  **WhatsApp Mode:** 
    - **Simple:** SMS only.
    - **Advanced:** SMS + WhatsApp (Requires Meta Business Verification for WhatsApp API). 
    *Recommendation: Start with SMS, it's easier to approve. Add WhatsApp later.*
