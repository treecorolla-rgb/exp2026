-- ==============================================================================
-- BACKEND EMAIL SYSTEM: TEMPLATES & CONFIGURATION
-- ==============================================================================

-- 1. Create/Update Templates Table with Configuration Flags
-- 'is_active' allows you to Enable/Disable specific triggers instantly.
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  event_trigger text not null unique, -- e.g. 'ORDER_CREATED'
  name text not null,               -- Admin friendly name
  subject text not null,            -- Email subject
  body_html text not null,          -- HTML content
  is_active boolean default true,   -- TOGGLE THIS to Enable/Disable trigger
  created_at timestamptz default now()
);

-- 2. Upsert the 3 Core Templates
-- We use ON CONFLICT so we don't duplicate rows, just ensure they exist.
insert into public.email_templates (event_trigger, name, subject, body_html, is_active)
values 
(
  'ORDER_CREATED',
  'Order Placed Confirmation',
  'Order Confirmation #{{order_id}}',
  '
    <div style="font-family: Arial, color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Thank you, {{customer_name}}!</h2>
      <p>We received your order #{{order_id}}.</p>
      
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Summary</h3>
        <table width="100%" style="border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <th align="left" style="padding: 8px;">Product</th>
            <th align="center" style="padding: 8px;">Qty</th>
            <th align="right" style="padding: 8px;">Price</th>
          </tr>
          {{items_html}}
        </table>
        <div style="text-align: right; margin-top: 15px;">
            <strong>Total: {{total_amount}}</strong>
        </div>
      </div>
      
      <p><strong>Shipping To:</strong><br/>{{shipping_address}}</p>
    </div>
  ',
  true -- Enabled by default
),
(
  'PAYMENT_SUCCESS',
  'Payment Received Notification',
  'Payment Received for Order #{{order_id}}',
  '
    <div style="font-family: Arial, color: #333;">
      <h2 style="color: #16a34a;">Payment Confirmed</h2>
      <p>We received your payment of <strong>{{amount_paid}}</strong> for Order #{{order_id}}.</p>
      <p>Method: {{payment_method}}<br/>Transaction ID: {{transaction_id}}</p>
      <p>We will notify you when it ships.</p>
    </div>
  ',
  true -- Enabled by default
),
(
  'ORDER_SHIPPED',
  'Output Shipping Notification',
  'Your Order #{{order_id}} has Shipped!',
  '
    <div style="font-family: Arial, color: #333;">
      <h2 style="color: #2563eb;">Your order is on the way!</h2>
      <p>Order #{{order_id}} has shipped via {{courier_name}}.</p>
      <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
      <p><a href="{{tracking_link}}" style="background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Track Package</a></p>
    </div>
  ',
  true -- Enabled by default
)
on conflict (event_trigger) do update 
set 
  subject = excluded.subject, 
  body_html = excluded.body_html,
  name = excluded.name;
