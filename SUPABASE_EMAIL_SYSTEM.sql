<<<<<<< HEAD
-- ==============================================================================
-- EMAIL NOTIFICATION SYSTEM FOR SUPABASE
-- ==============================================================================
-- This file creates the necessary tables, default templates, and triggers 
-- to support a scalable, event-based email system.

-- 1. Create Email Templates Table
-- Stores the content and configuration for different email types.
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  event_trigger text not null unique, -- e.g., 'ORDER_CREATED', 'PAYMENT_SUCCESS'
  name text not null, -- Friendly name for admin
  subject text not null, -- Supports {{variables}}
  body_html text not null, -- Supports {{variables}}
  body_text text, -- Fallback plain text
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.email_templates enable row level security;
-- Allow read access to everyone (or restrict to service role / admin in production)
create policy "Allow public read templates" on public.email_templates for select using (true);
-- Allow write access only to authenticated admin users (configure as needed)
create policy "Allow admin write templates" on public.email_templates for all using (true) with check (true);


-- 2. Create Email Logs / Queue Table
-- Serves as both a history log and an outbound queue.
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.email_templates(id),
  recipient_email text not null,
  recipient_name text,
  status text default 'PENDING', -- PENDING, SENT, FAILED, RETRYING
  context_data jsonb, -- The dynamic data used to render the template
  subject text, -- Snapshot of subject at time of sending
  error_message text,
  retry_count int default 0,
  related_order_id text references public.orders(id), -- Optional link to order
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- Enable RLS
alter table public.email_logs enable row level security;
create policy "Allow service role full access" on public.email_logs for all using (true) with check (true);


-- 3. Insert Default Email Templates
-- We use standard Handlebars-style syntax {{variable}} as placeholders.

insert into public.email_templates (event_trigger, name, subject, body_html, body_text)
values 
(
  'ORDER_CREATED',
  'Order Placed - Thank You',
  'Order Confirmation #{{order_id}}',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Thank you for your order, {{customer_name}}!</h2>
      <p>We have received your order and are processing it.</p>
      
      <h3>Order Summary</h3>
      <p><strong>Order ID:</strong> {{order_id}}</p>
      <p><strong>Total Amount:</strong> ${{total_amount}}</p>
      
      <hr />
      <h3>Shipping Address</h3>
      <p>{{shipping_address}}</p>
      
      <p>If you have any questions, please contact our support.</p>
      <p>Best regards,<br/>The Team</p>
    </div>
  ',
  'Thank you for your order, {{customer_name}}! Order ID: {{order_id}}. Total: ${{total_amount}}.'
),
(
  'PAYMENT_SUCCESS',
  'Payment Successful',
  'Payment Received for Order #{{order_id}}',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Payment Confirmed</h2>
      <p>Passment for your order #{{order_id}} has been successfully processed.</p>
      
      <h3>Payment Details</h3>
      <p><strong>Amount Paid:</strong> ${{amount_paid}}</p>
      <p><strong>Payment Method:</strong> {{payment_method}}</p>
      <p><strong>Transaction ID:</strong> {{transaction_id}}</p>
      
      <p>We will notify you when your order ships.</p>
    </div>
  ',
  'Payment Confirmed for Order #{{order_id}}. Amount: ${{amount_paid}}.'
),
(
  'ORDER_SHIPPED',
  'Order Shipped',
  'Your Order #{{order_id}} has Shipped!',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Good news! Your order is on the way.</h2>
      <p>Order #{{order_id}} has been shipped.</p>
      
      <h3>Tracking Info</h3>
      <p><strong>Courier:</strong> {{courier_name}}</p>
      <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
      <p><a href="{{tracking_link}}">Track your package here</a></p>
      
      <p>Estimated Delivery: {{estimated_delivery_date}}</p>
    </div>
  ',
  'Your order #{{order_id}} has shipped! Track it at: {{tracking_link}}'
),
(
  'ORDER_DELIVERED',
  'Order Delivered',
  'Order #{{order_id}} Delivered',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Your order has arrived!</h2>
      <p>Order #{{order_id}} has been marked as delivered.</p>
      
      <p>We hope you enjoy your purchase.</p>
      <p><a href="{{review_link}}">Leave a review</a></p>
    </div>
  ',
  'Your order #{{order_id}} has been delivered. Enjoy!'
)
on conflict (event_trigger) do update 
set 
  subject = excluded.subject,
  body_html = excluded.body_html,
  body_text = excluded.body_text;


-- 4. Create Database Function to Auto-Queue Emails
-- This function listens to changes in the `orders` table and inserts into `email_logs`.

create or replace function public.handle_order_email_trigger()
returns trigger as $$
declare
  v_customer_email text;
  v_template_id uuid;
  v_trigger_type text;
  v_context jsonb;
begin
  -- Extract customer email from the details JSONB column
  -- Adjust the path 'email' based on your actual JSON structure in `orders.details`
  v_customer_email := new.details->>'email';

  -- If no email is found, we cannot send notifications (or log error)
  if v_customer_email is null then
    return new;
  end if;

  -- Determine the Event Type based on operation
  v_trigger_type := null;

  if (TG_OP = 'INSERT') then
    -- New Order Created
    v_trigger_type := 'ORDER_CREATED';
  elsif (TG_OP = 'UPDATE') then
    -- Check for Status Changes
    if (old.status is distinct from new.status) then
      if (new.status = 'PAID') then
        v_trigger_type := 'PAYMENT_SUCCESS';
      elsif (new.status = 'SHIPPED') then
        v_trigger_type := 'ORDER_SHIPPED';
      elsif (new.status = 'DELIVERED') then
        v_trigger_type := 'ORDER_DELIVERED';
      end if;
    end if;
  end if;

  -- If we identified a trigger event, queue the email
  if v_trigger_type is not null then
    -- Find the active template for this trigger
    select id into v_template_id 
    from public.email_templates 
    where event_trigger = v_trigger_type and is_active = true 
    limit 1;

    if v_template_id is not null then
      -- Construct the Context Data (JSON) for the template
      -- This pulls data from the `orders` row to populate variables
      v_context := jsonb_build_object(
        'order_id', new.id,
        'customer_name', new.customer_name,
        'total_amount', new.total,
        'status', new.status,
        'shipping_address', new.details->>'address', -- Adjust key as needed
        'amount_paid', new.total, -- Assuming full payment
        'payment_method', new.details->>'paymentMethod', -- Adjust key as needed
        'tracking_number', new.details->>'trackingNumber', -- Adjust key
        'tracking_link', new.details->>'trackingLink', -- Adjust key
        'courier_name', new.details->>'courier' -- Adjust key
      );

      -- Insert into Queue
      insert into public.email_logs (
        template_id,
        recipient_email,
        recipient_name,
        status,
        context_data,
        related_order_id
      ) values (
        v_template_id,
        v_customer_email,
        new.customer_name,
        'PENDING',
        v_context,
        new.id
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;


-- 5. Attach Trigger to Orders Table
-- This ensures the function runs automatically on every insert/update.

drop trigger if exists on_order_status_change on public.orders;

create trigger on_order_status_change
after insert or update on public.orders
for each row execute function public.handle_order_email_trigger();


-- ==============================================================================
-- NEXT STEPS:
-- 1. Run this SQL in your Supabase SQL Editor.
-- 2. The `email_logs` table will now populate automatically when orders are created/updated.
-- 3. You need to setup an Edge Function or Cron Job to poll `email_logs` where status='PENDING'
--    and actually send the emails using SendGrid/Resend/etc.
-- ==============================================================================
=======
-- ==============================================================================
-- EMAIL NOTIFICATION SYSTEM FOR SUPABASE
-- ==============================================================================
-- This file creates the necessary tables, default templates, and triggers 
-- to support a scalable, event-based email system.

-- 1. Create Email Templates Table
-- Stores the content and configuration for different email types.
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  event_trigger text not null unique, -- e.g., 'ORDER_CREATED', 'PAYMENT_SUCCESS'
  name text not null, -- Friendly name for admin
  subject text not null, -- Supports {{variables}}
  body_html text not null, -- Supports {{variables}}
  body_text text, -- Fallback plain text
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.email_templates enable row level security;
-- Allow read access to everyone (or restrict to service role / admin in production)
create policy "Allow public read templates" on public.email_templates for select using (true);
-- Allow write access only to authenticated admin users (configure as needed)
create policy "Allow admin write templates" on public.email_templates for all using (true) with check (true);


-- 2. Create Email Logs / Queue Table
-- Serves as both a history log and an outbound queue.
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.email_templates(id),
  recipient_email text not null,
  recipient_name text,
  status text default 'PENDING', -- PENDING, SENT, FAILED, RETRYING
  context_data jsonb, -- The dynamic data used to render the template
  subject text, -- Snapshot of subject at time of sending
  error_message text,
  retry_count int default 0,
  related_order_id text references public.orders(id), -- Optional link to order
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- Enable RLS
alter table public.email_logs enable row level security;
create policy "Allow service role full access" on public.email_logs for all using (true) with check (true);


-- 3. Insert Default Email Templates
-- We use standard Handlebars-style syntax {{variable}} as placeholders.

insert into public.email_templates (event_trigger, name, subject, body_html, body_text)
values 
(
  'ORDER_CREATED',
  'Order Placed - Thank You',
  'Order Confirmation #{{order_id}}',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Thank you for your order, {{customer_name}}!</h2>
      <p>We have received your order and are processing it.</p>
      
      <h3>Order Summary</h3>
      <p><strong>Order ID:</strong> {{order_id}}</p>
      <p><strong>Total Amount:</strong> ${{total_amount}}</p>
      
      <hr />
      <h3>Shipping Address</h3>
      <p>{{shipping_address}}</p>
      
      <p>If you have any questions, please contact our support.</p>
      <p>Best regards,<br/>The Team</p>
    </div>
  ',
  'Thank you for your order, {{customer_name}}! Order ID: {{order_id}}. Total: ${{total_amount}}.'
),
(
  'PAYMENT_SUCCESS',
  'Payment Successful',
  'Payment Received for Order #{{order_id}}',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Payment Confirmed</h2>
      <p>Passment for your order #{{order_id}} has been successfully processed.</p>
      
      <h3>Payment Details</h3>
      <p><strong>Amount Paid:</strong> ${{amount_paid}}</p>
      <p><strong>Payment Method:</strong> {{payment_method}}</p>
      <p><strong>Transaction ID:</strong> {{transaction_id}}</p>
      
      <p>We will notify you when your order ships.</p>
    </div>
  ',
  'Payment Confirmed for Order #{{order_id}}. Amount: ${{amount_paid}}.'
),
(
  'ORDER_SHIPPED',
  'Order Shipped',
  'Your Order #{{order_id}} has Shipped!',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Good news! Your order is on the way.</h2>
      <p>Order #{{order_id}} has been shipped.</p>
      
      <h3>Tracking Info</h3>
      <p><strong>Courier:</strong> {{courier_name}}</p>
      <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
      <p><a href="{{tracking_link}}">Track your package here</a></p>
      
      <p>Estimated Delivery: {{estimated_delivery_date}}</p>
    </div>
  ',
  'Your order #{{order_id}} has shipped! Track it at: {{tracking_link}}'
),
(
  'ORDER_DELIVERED',
  'Order Delivered',
  'Order #{{order_id}} Delivered',
  '
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Your order has arrived!</h2>
      <p>Order #{{order_id}} has been marked as delivered.</p>
      
      <p>We hope you enjoy your purchase.</p>
      <p><a href="{{review_link}}">Leave a review</a></p>
    </div>
  ',
  'Your order #{{order_id}} has been delivered. Enjoy!'
)
on conflict (event_trigger) do update 
set 
  subject = excluded.subject,
  body_html = excluded.body_html,
  body_text = excluded.body_text;


-- 4. Create Database Function to Auto-Queue Emails
-- This function listens to changes in the `orders` table and inserts into `email_logs`.

create or replace function public.handle_order_email_trigger()
returns trigger as $$
declare
  v_customer_email text;
  v_template_id uuid;
  v_trigger_type text;
  v_context jsonb;
begin
  -- Extract customer email from the details JSONB column
  -- Adjust the path 'email' based on your actual JSON structure in `orders.details`
  v_customer_email := new.details->>'email';

  -- If no email is found, we cannot send notifications (or log error)
  if v_customer_email is null then
    return new;
  end if;

  -- Determine the Event Type based on operation
  v_trigger_type := null;

  if (TG_OP = 'INSERT') then
    -- New Order Created
    v_trigger_type := 'ORDER_CREATED';
  elsif (TG_OP = 'UPDATE') then
    -- Check for Status Changes
    if (old.status is distinct from new.status) then
      if (new.status = 'PAID') then
        v_trigger_type := 'PAYMENT_SUCCESS';
      elsif (new.status = 'SHIPPED') then
        v_trigger_type := 'ORDER_SHIPPED';
      elsif (new.status = 'DELIVERED') then
        v_trigger_type := 'ORDER_DELIVERED';
      end if;
    end if;
  end if;

  -- If we identified a trigger event, queue the email
  if v_trigger_type is not null then
    -- Find the active template for this trigger
    select id into v_template_id 
    from public.email_templates 
    where event_trigger = v_trigger_type and is_active = true 
    limit 1;

    if v_template_id is not null then
      -- Construct the Context Data (JSON) for the template
      -- This pulls data from the `orders` row to populate variables
      v_context := jsonb_build_object(
        'order_id', new.id,
        'customer_name', new.customer_name,
        'total_amount', new.total,
        'status', new.status,
        'shipping_address', new.details->>'address', -- Adjust key as needed
        'amount_paid', new.total, -- Assuming full payment
        'payment_method', new.details->>'paymentMethod', -- Adjust key as needed
        'tracking_number', new.details->>'trackingNumber', -- Adjust key
        'tracking_link', new.details->>'trackingLink', -- Adjust key
        'courier_name', new.details->>'courier' -- Adjust key
      );

      -- Insert into Queue
      insert into public.email_logs (
        template_id,
        recipient_email,
        recipient_name,
        status,
        context_data,
        related_order_id
      ) values (
        v_template_id,
        v_customer_email,
        new.customer_name,
        'PENDING',
        v_context,
        new.id
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;


-- 5. Attach Trigger to Orders Table
-- This ensures the function runs automatically on every insert/update.

drop trigger if exists on_order_status_change on public.orders;

create trigger on_order_status_change
after insert or update on public.orders
for each row execute function public.handle_order_email_trigger();


-- ==============================================================================
-- NEXT STEPS:
-- 1. Run this SQL in your Supabase SQL Editor.
-- 2. The `email_logs` table will now populate automatically when orders are created/updated.
-- 3. You need to setup an Edge Function or Cron Job to poll `email_logs` where status='PENDING'
--    and actually send the emails using SendGrid/Resend/etc.
-- ==============================================================================
>>>>>>> aa34a9715944dd35c335ab419f23ab548cd6285a
