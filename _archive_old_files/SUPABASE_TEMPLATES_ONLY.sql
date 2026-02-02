-- ==============================================================================
-- CLEAN EMAIL SYSTEM: NO TRIGGERS, ONLY TEMPLATES
-- ==============================================================================

-- 1. Remove Previous Automation (Triggers & Functions)
drop trigger if exists on_order_email_event on public.orders;
drop trigger if exists on_order_status_change on public.orders;
drop function if exists public.handle_order_email_trigger;

-- 2. Keep/Create Email Templates Table
-- This is your "CMS" for email content. You can edit rows here to change wording/numbers.
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  event_trigger text not null unique, -- 'ORDER_CREATED', 'PAYMENT_SUCCESS', 'ORDER_SHIPPED'
  name text not null,
  subject text not null,
  body_html text not null, -- Stores the HTML template with {{variables}}
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. Upsert Default Templates (Safe to run multiple times)
insert into public.email_templates (event_trigger, name, subject, body_html)
values 
(
  'ORDER_CREATED',
  'Order Placed - Thank You',
  'Order Confirmation #{{order_id}}',
  '
    <div style="font-family: Arial, color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Thank you for your order, {{customer_name}}!</h2>
      <p>We have successfully received your order and are getting it ready.</p>
      
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Summary #{{order_id}}</h3>
        <table width="100%" style="border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <th align="left" style="padding: 8px;">Product</th>
            <th align="center" style="padding: 8px;">Qty</th>
            <th align="right" style="padding: 8px;">Price</th>
          </tr>
          {{items_html}}
        </table>
        
        <div style="text-align: right; margin-top: 15px; font-size: 1.1em;">
            <strong>Total Amount: {{total_amount}}</strong>
        </div>
      </div>
      
      <h3>Billing & Shipping Address</h3>
      <p style="background: #fff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px;">
        {{shipping_address}}
      </p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      
      <p style="font-size: 0.9em; color: #64748b;">
        <strong>Need Help?</strong><br/>
        Contact us at <a href="mailto:support@airmailchemist.com">support@airmailchemist.com</a> or call +1 (555) 123-4567.
      </p>
    </div>
  '
),
(
  'PAYMENT_SUCCESS',
  'Payment Successful',
  'Payment Received for Order #{{order_id}}',
  '
    <div style="font-family: Arial, color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Payment Confirmed</h2>
      <p>We have received your payment for Order #{{order_id}}.</p>
      
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> {{amount_paid}}</p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{payment_method}}</p>
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> <span style="font-family: monospace;">{{transaction_id}}</span></p>
      </div>
      
      <p>We will notify you via email as soon as your order ships.</p>
    </div>
  '
),
(
  'ORDER_SHIPPED',
  'Order Shipped',
  'Your Order #{{order_id}} has Shipped!',
  '
    <div style="font-family: Arial, color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Good news! Your order is on the way.</h2>
      <p>Your order #{{order_id}} has been shipped.</p>
      
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">Shipping Details</h3>
        <p><strong>Courier:</strong> {{courier_name}}</p>
        <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
        <p><strong>Estimated Delivery:</strong> {{estimated_delivery_date}}</p>
        
        <div style="text-align: center; margin-top: 25px;">
          <a href="{{tracking_link}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Track Your Package
          </a>
        </div>
      </div>
      
      <p style="font-size: 0.9em; text-align: center; color: #64748b;">
        Please note logic it may take up to 24 hours for tracking information to update.
      </p>
    </div>
  '
)
on conflict (event_trigger) do update 
set 
  subject = excluded.subject,
  body_html = excluded.body_html,
  name = excluded.name;
