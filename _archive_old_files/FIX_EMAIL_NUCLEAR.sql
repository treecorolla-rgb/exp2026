-- ==============================================================================
-- FIX EMAIL SYSTEM: NUCLEAR OPTION (CLEAR EVERYTHING & REBUILD)
-- ==============================================================================

-- 1. DROP EVERYTHING RELATED TO EMAILS
drop trigger if exists on_order_email_event on public.orders;
drop trigger if exists on_order_status_change on public.orders;
drop trigger if exists trigger_send_email_on_order on public.orders;
drop trigger if exists notify_order_status on public.orders;
drop trigger if exists on_new_order on public.orders;
drop function if exists public.handle_order_email_trigger() cascade;
drop function if exists public.trigger_send_email_function() cascade;

-- 2. ENSURE TABLES EXIST (Idempotent)
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  event_trigger text not null unique,
  name text not null,
  subject text not null,
  body_html text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.email_templates(id),
  recipient_email text not null,
  recipient_name text,
  status text default 'PENDING',
  context_data jsonb,
  error_message text,
  related_order_id text,
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- 3. ENSURE TEMPLATES EXIST (Standardized Keys)
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
VALUES 
(
  'ORDER_CREATED',
  'Order Placed',
  'Order Confirmation #{{order_id}}',
  '<div style="font-family: Arial;"><h2>Order Received</h2><p>Thanks {{customer_name}}! We got your order.</p></div>'
),
(
  'WELCOME_EMAIL',
  'Welcome Email',
  'Welcome to the Family',
  '<div style="font-family: Arial;"><h2>Welcome!</h2><p>Thanks for creating an account.</p></div>'
),
(
  'PAYMENT_RECEIVED', 
  'Payment Received', 
  'Payment Received for Order #{{order_id}}', 
  '<div style="font-family: Arial;"><h2>Payment Confirmed</h2><p>We received your payment.</p></div>'
),
(
  'ORDER_DELIVERED', 
  'Order Delivered', 
  'Your Order #{{order_id}} has been Delivered', 
  '<div style="font-family: Arial;"><h2>Delivered!</h2><p>Your order has arrived.</p></div>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET name = excluded.name, subject = excluded.subject, body_html = excluded.body_html;


-- 4. CREATE THE ONE AND ONLY TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_order_email_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_tid uuid; 
  v_type text; 
  v_ctx jsonb;
  v_send_welcome boolean := false;
BEGIN
  -- Strict logic to determine ONE event type
  v_type := NULL;

  -- CASE 1: INSERT (New Order)
  IF (TG_OP = 'INSERT') THEN
     v_type := 'ORDER_CREATED';
     
     -- Check for Welcome Email (Account Creation) - safely check JSONB fields
     IF (new.details->>'accountCreated' = 'true' OR new.details->>'createAccount' = 'true') THEN
         v_send_welcome := true;
     END IF;

  -- CASE 2: UPDATE (Status Change)
  ELSIF (TG_OP = 'UPDATE') THEN
     -- Only process if status ACTUALLY changed
     IF (new.status IS DISTINCT FROM old.status) THEN
         IF (new.status = 'Paid') THEN v_type := 'PAYMENT_RECEIVED';
         ELSIF (new.status = 'Shipped') THEN v_type := 'ORDER_SHIPPED';
         ELSIF (new.status = 'Delivered') THEN v_type := 'ORDER_DELIVERED';
         END IF;
     END IF;
  END IF;

  -- EXECUTE: Log Primary Email (Order/Status)
  IF v_type IS NOT NULL THEN
      SELECT id INTO v_tid FROM public.email_templates WHERE event_trigger = v_type AND is_active = true LIMIT 1;
      
      -- Fallback mapping for older template names if needed
      IF v_tid IS NULL AND v_type = 'PAYMENT_RECEIVED' THEN
         SELECT id INTO v_tid FROM public.email_templates WHERE event_trigger = 'PAYMENT_SUCCESS' AND is_active = true LIMIT 1;
      END IF;

      IF v_tid IS NOT NULL THEN
        v_ctx := jsonb_build_object(
          'order_id', new.id,
          'customer_name', COALESCE(new.details->>'firstName', 'Customer'),
          'total_amount', new.total,
          'status', new.status
        );
        
        INSERT INTO public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id)
        VALUES (v_tid, COALESCE(new.details->>'email', 'no-email@example.com'), COALESCE(new.details->>'firstName', 'Customer'), 'PENDING', v_ctx, new.id);
      END IF;
  END IF;

  -- EXECUTE: Log Welcome Email (if applicable)
  IF v_send_welcome THEN
      SELECT id INTO v_tid FROM public.email_templates WHERE event_trigger = 'WELCOME_EMAIL' AND is_active = true LIMIT 1;
      IF v_tid IS NOT NULL THEN
         v_ctx := jsonb_build_object('customer_name', COALESCE(new.details->>'firstName', 'Customer'));
         
         INSERT INTO public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id)
         VALUES (v_tid, COALESCE(new.details->>'email', 'no-email@example.com'), COALESCE(new.details->>'firstName', 'Customer'), 'PENDING', v_ctx, new.id);
      END IF;
  END IF;

  RETURN new;
EXCEPTION WHEN OTHERS THEN 
  -- Log error but DO NOT FAIL the transaction
  RAISE WARNING 'Email Trigger Error: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. ATTACH THE SINGLE TRIGGER
DROP TRIGGER IF EXISTS on_order_email_v2 ON public.orders;
CREATE TRIGGER on_order_email_v2
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_email_trigger();

-- 6. VERIFY NO OTHER TRIGGERS EXIST
-- Manually inspect your triggers if issues persist.
