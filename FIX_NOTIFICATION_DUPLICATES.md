# 🔧 FIX NOTIFICATION DUPLICATES & WELCOME EMAIL

## ✅ Issues Fixed

### 1. Removed Duplicate Notifications ✅
- **Problem:** Notifications were triggered twice (from `placeOrder` AND realtime subscription)
- **Fix:** Removed duplicate call from `placeOrder` function
- **Result:** Notifications now only triggered once via realtime subscription

### 2. Custom Admin Email Subject ✅
- **Problem:** Admin emails used same template as customer emails
- **Fix:** Created dedicated `ADMIN_ORDER_NOTIFICATION` template
- **New Subject:** "NEW Order Placed - Order #ORD-XXXXX"

### 3. Welcome Email Not Working ⚠️
- **Problem:** No trigger exists for welcome emails
- **Fix:** Need to add welcome email trigger (see below)

---

## 📋 Steps to Complete

### Step 1: Run SQL to Create Admin Email Template

Run this in **Supabase SQL Editor**:

```sql
-- File: CREATE_ADMIN_EMAIL_TEMPLATE.sql
-- This creates a dedicated template for admin notifications

INSERT INTO email_templates (
  event_trigger,
  subject_line,
  html_body,
  is_active
) VALUES (
  'ADMIN_ORDER_NOTIFICATION',
  'NEW Order Placed - Order {{order_id}}',
  '<!-- Beautiful HTML template with order details -->',
  true
)
ON CONFLICT (event_trigger) 
DO UPDATE SET
  subject_line = EXCLUDED.subject_line,
  html_body = EXCLUDED.html_body;
```

See `CREATE_ADMIN_EMAIL_TEMPLATE.sql` for the full template.

### Step 2: Hard Refresh Browser

Press **Ctrl + Shift + R** to reload the updated code.

### Step 3: Test

Place a test order and verify:
- ✅ Only **1** Telegram message received
- ✅ Only **1** admin email received
- ✅ Admin email subject: "NEW Order Placed - Order #ORD-XXXXX"

---

## 🎯 Welcome Email Fix

### Option A: Add to Database Trigger (Recommended)

Add welcome email logic to the order trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_order_email_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_template_id uuid;
  v_trigger_type text;
  v_context jsonb;
  v_customer_email text;
  v_customer_name text;
  v_is_new_customer boolean;
BEGIN
  v_trigger_type := null;

  IF (TG_OP = 'INSERT') THEN
    v_trigger_type := 'ORDER_CREATED';
    
    -- Check if this is customer's first order (welcome email)
    SELECT COUNT(*) = 1 INTO v_is_new_customer
    FROM orders
    WHERE details->>'email' = new.details->>'email';
    
    IF v_is_new_customer THEN
      -- Also send welcome email
      SELECT id INTO v_template_id 
      FROM email_templates 
      WHERE event_trigger = 'CUSTOMER_WELCOME' AND is_active = true;
      
      IF v_template_id IS NOT NULL THEN
        v_customer_email := new.details->>'email';
        v_customer_name := COALESCE(new.details->>'firstName', 'Customer');
        
        INSERT INTO email_logs (
          template_id, 
          recipient_email, 
          recipient_name, 
          status, 
          context_data
        ) VALUES (
          v_template_id,
          v_customer_email,
          v_customer_name,
          'PENDING',
          jsonb_build_object('customer_name', v_customer_name)
        );
      END IF;
    END IF;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Handle status changes...
    IF (new.status = 'Paid' AND old.status != 'Paid') THEN
      v_trigger_type := 'PAYMENT_SUCCESS';
    ELSIF (new.status = 'Shipped' AND old.status != 'Shipped') THEN
      v_trigger_type := 'ORDER_SHIPPED';
    ELSIF (new.status = 'Delivered' AND old.status != 'Delivered') THEN
      v_trigger_type := 'ORDER_DELIVERED';
    END IF;
  END IF;

  -- Send order email if trigger type is set
  IF v_trigger_type IS NOT NULL THEN
    SELECT id INTO v_template_id 
    FROM email_templates 
    WHERE event_trigger = v_trigger_type AND is_active = true;
    
    IF v_template_id IS NOT NULL THEN
      v_customer_email := COALESCE(new.details->>'email', 'no-email@example.com');
      v_customer_name := COALESCE(new.details->>'firstName', new.customer_name, 'Customer');
      
      v_context := jsonb_build_object(
        'order_id', new.id,
        'customer_name', v_customer_name,
        'total_amount', new.total
      );
      
      INSERT INTO email_logs (
        template_id, 
        recipient_email, 
        recipient_name, 
        status, 
        context_data,
        related_order_id
      ) VALUES (
        v_template_id,
        v_customer_email,
        v_customer_name,
        'PENDING',
        v_context,
        new.id
      );
    END IF;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Option B: Client-Side Welcome Email

Add to `StoreContext.tsx` after order placement:

```typescript
// After successful order placement
if (!isCustomerAuthenticated && financialData?.createAccount) {
  // Send welcome email
  await triggerRealEmail(
    details.email,
    details.firstName,
    'CUSTOMER_WELCOME',
    { customer_name: details.firstName }
  );
}
```

---

## 📊 Expected Results After Fixes

### When placing an order:

**Console Output:**
```
[ORDER] Saving to Supabase: #ORD-123456
[ORDER] Saved successfully: #ORD-123456
[REALTIME] New Order Received: Object
[NOTIFICATION] handleOrderNotification called for order: #ORD-123456 status: Pending
[ADMIN NOTIFICATION] Telegram response: { success: true, status: 200 }
[ADMIN EMAIL] Queuing admin email for treecorolla@gmail.com
[ADMIN EMAIL] Email queued successfully
```

**Notifications Received:**
- ✅ **1** Telegram message (not 4)
- ✅ **1** admin email with subject "NEW Order Placed - Order #ORD-123456"
- ✅ **1** customer order confirmation email
- ✅ **1** welcome email (if first order)

---

## 🎯 Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `StoreContext.tsx` | Removed duplicate notification call | Fix duplicates |
| `notificationService.ts` | Changed to `ADMIN_ORDER_NOTIFICATION` | Custom subject |
| `CREATE_ADMIN_EMAIL_TEMPLATE.sql` | New SQL script | Admin template |

---

## ✅ Checklist

- [x] Remove duplicate notification call
- [x] Create admin email template SQL
- [x] Update notification service to use new template
- [ ] Run SQL to create admin template
- [ ] Hard refresh browser
- [ ] Test order placement
- [ ] Verify only 1 notification received
- [ ] Add welcome email trigger (optional)

---

**After running the SQL and refreshing, you should have clean, single notifications!** 🚀
