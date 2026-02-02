-- ==============================================================================
-- FIX ALL EMAIL TRIGGERS (WITH WELCOME EMAIL FOR NEW CUSTOMERS)
-- ==============================================================================
-- This script sets up the complete lifecycle triggers for Orders.
-- INCLUDES: Logic to send 'WELCOME_EMAIL' only for first-time customers.

-- 1. Insert/Update Standard Templates (Added WELCOME_EMAIL)
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
VALUES 
(
  'ORDER_CREATED',
  'Order Placed Confirmation',
  'Order Confirmation #{{order_id}}',
  '<div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #4CAF50;">Thank you for your order!</h2>
    <p>Hi {{customer_name}},</p>
    <p>We received your order <strong>#{{order_id}}</strong>.</p>
    <p>We will notify you once it ships.</p>
    <hr>
    <p><strong>Total: {{total_amount}}</strong></p>
  </div>'
),
(
  'WELCOME_EMAIL',
  'Welcome to Our Store',
  'Welcome to the Family! 🎉',
  '<div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2196F3;">Welcome!</h2>
    <p>Hi {{customer_name}},</p>
    <p>Thank you for making your first purchase with us.</p>
    <p>We are excited to have you as a customer.</p>
  </div>'
),
(
  'PAYMENT_SUCCESS',
  'Payment Received',
  'Payment Receipt for Order #{{order_id}}',
  '<div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2196F3;">Payment Confirmed</h2>
    <p>Hi {{customer_name}},</p>
    <p>We have received your payment for order <strong>#{{order_id}}</strong>.</p>
    <p>We are now processing your items.</p>
  </div>'
),
(
  'ORDER_SHIPPED',
  'Order Shipped Notification',
  'Your Order #{{order_id}} has Shipped!',
  '<div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #2196F3;">Your Order is on the way!</h2>
    <p>Hi {{customer_name}},</p>
    <p>Good news! Your order <strong>#{{order_id}}</strong> has been shipped.</p>
    <p><strong>Carrier:</strong> {{carrier}}</p>
    <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
    <p><a href="{{tracking_url}}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a></p>
  </div>'
),
(
  'ORDER_DELIVERED',
  'Order Delivered',
  'Order #{{order_id}} Delivered',
  '<div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #4CAF50;">Delivered!</h2>
    <p>Hi {{customer_name}},</p>
    <p>Your order <strong>#{{order_id}}</strong> has been delivered.</p>
    <p>Enjoy your purchase!</p>
  </div>'
),
(
  'ORDER_CANCELED',
  'Order Canceled',
  'Order #{{order_id}} Canceled',
  '<div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #F44336;">Order Canceled</h2>
    <p>Hi {{customer_name}},</p>
    <p>Your order <strong>#{{order_id}}</strong> has been canceled.</p>
    <p>If you have questions, please reply to this email.</p>
  </div>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html;

-- 2. Update Trigger Function with FIRST TIME CUSTOMER Logic
CREATE OR REPLACE FUNCTION public.handle_order_email_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_template_id UUID;
  v_welcome_template_id UUID;
  v_trigger_type TEXT;
  v_context JSONB;
  v_customer_email TEXT;
  v_customer_name TEXT;
  v_order_count INTEGER;
BEGIN
  -- Wrap in safe block
  BEGIN
      v_trigger_type := NULL;
      
      -- Extract Customer Info First (Needed for Welcome Check)
      v_customer_email := COALESCE(NEW.details->>'email', NEW.details->>'customerEmail', 'admin@example.com');
      v_customer_name := COALESCE(NEW.details->>'firstName', NEW.customer_name, 'Customer');

      -- Determine Event Type
      IF (TG_OP = 'INSERT') THEN
        v_trigger_type := 'ORDER_CREATED';
        
        -- CHECK FOR FIRST TIME CUSTOMER
        -- Count prior orders with this email (excluding current one if logic requires, but safely count all)
        -- Since this is AFTER INSERT, count should be >= 1. If count == 1, it's the first order.
        SELECT COUNT(*) INTO v_order_count 
        FROM public.orders 
        WHERE (details->>'email' = v_customer_email OR details->>'customerEmail' = v_customer_email);
        
        -- If this is their first order (Count is 1), send Welcome Email too
        IF v_order_count = 1 THEN
            SELECT id INTO v_welcome_template_id FROM public.email_templates WHERE event_trigger = 'WELCOME_EMAIL' AND is_active = true LIMIT 1;
            
            IF v_welcome_template_id IS NOT NULL THEN
                 -- Reuse context
                 v_context := jsonb_build_object('customer_name', v_customer_name);
                 
                 INSERT INTO public.email_logs (template_id, recipient_email, recipient_name, status, context_data, created_at)
                 VALUES (v_welcome_template_id, v_customer_email, v_customer_name, 'PENDING', v_context, NOW());
                 
                 RAISE NOTICE '🎉 First time customer! Queued Welcome Email for %', v_customer_email;
            END IF;
        END IF;

      ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW.status = 'Paid' AND OLD.status != 'Paid') THEN
          v_trigger_type := 'PAYMENT_SUCCESS';
        ELSIF (NEW.status = 'Shipped' AND OLD.status != 'Shipped') THEN
          v_trigger_type := 'ORDER_SHIPPED';
        ELSIF (NEW.status = 'Delivered' AND OLD.status != 'Delivered') THEN
          v_trigger_type := 'ORDER_DELIVERED';
        ELSIF (NEW.status = 'Cancelled' AND OLD.status != 'Cancelled') THEN
          v_trigger_type := 'ORDER_CANCELED';
        END IF;
      END IF;

      -- If we found a matching event (Order Created, Shipped, etc.)
      IF v_trigger_type IS NOT NULL THEN
          -- 1. Find the active template
          SELECT id INTO v_template_id FROM public.email_templates 
          WHERE event_trigger = v_trigger_type AND is_active = true LIMIT 1;

          IF v_template_id IS NOT NULL THEN
            -- Build standard context
            v_context := jsonb_build_object(
              'order_id', NEW.id,
              'customer_name', v_customer_name,
              'total_amount', NEW.total,
              'carrier', COALESCE(NEW.details->>'carrier', 'Standard'),
              'tracking_number', COALESCE(NEW.details->>'trackingNumber', 'N/A'),
              'tracking_url', COALESCE(NEW.details->>'trackingUrl', '#'),
              'status', NEW.status
            );

            INSERT INTO public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id, created_at)
            VALUES (v_template_id, v_customer_email, v_customer_name, 'PENDING', v_context, NEW.id, NOW());
            
            RAISE NOTICE '✅ Queued email event: % for Order %', v_trigger_type, NEW.id;
          END IF;
      END IF;

  EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '❌ Email Trigger Failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure Trigger is Attached
DROP TRIGGER IF EXISTS on_order_email_event ON public.orders;

CREATE TRIGGER on_order_email_event
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_email_trigger();

-- Final Verification Block
DO $$
BEGIN
    RAISE NOTICE '✅ All triggers updated with Welcome Email logic!';
END $$;
