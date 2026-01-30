-- ==============================================================================
-- EMAIL NOTIFICATION SYSTEM FOR SUPABASE (FIXED)
-- ==============================================================================

-- 1. Create Email Templates Table
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  event_trigger text not null unique, -- 'ORDER_CREATED', 'PAYMENT_SUCCESS', 'ORDER_SHIPPED'
  name text not null,
  subject text not null,
  body_html text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Create Email Logs / Queue Table
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.email_templates(id),
  recipient_email text not null,
  recipient_name text,
  status text default 'PENDING', -- PENDING, SENT, FAILED
  context_data jsonb, -- Dynamic data for the template
  error_message text,
  related_order_id text, -- Loose reference to orders table
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- 3. Insert Specific Templates (Using ON CONFLICT to avoid Foreign Key errors)
-- We DO NOT delete existing templates, we update them.
insert into public.email_templates (event_trigger, name, subject, body_html)
values 
(
  'ORDER_CREATED',
  'Order Placed - Thank You',
  'Order Confirmation #{{order_id}}',
  '
    <div style="font-family: Arial, color: #333;">
      <h2>Thank you for your order, {{customer_name}}!</h2>
      <p>We have successfully received your order.</p>
      
      <h3>Order Summary (Order #{{order_id}})</h3>
      <table width="100%" style="border-collapse: collapse;">
        <tr>
          <th align="left">Product</th>
          <th align="center">Qty</th>
          <th align="right">Price</th>
        </tr>
        {{#each items}}
        <tr>
          <td>{{name}}</td>
          <td align="center">{{quantity}}</td>
          <td align="right">{{price}}</td>
        </tr>
        {{/each}}
      </table>
      
      <p><strong>Total Amount:</strong> {{total_amount}}</p>
      
      <h3>Billing & Shipping Address</h3>
      <p>{{shipping_address}}</p>
      
      <hr/>
      <p><strong>Support Contact:</strong> support@airmailchemist.com</p>
    </div>
  '
),
(
  'PAYMENT_SUCCESS',
  'Payment Successful',
  'Payment Received for Order #{{order_id}}',
  '
    <div style="font-family: Arial, color: #333;">
      <h2>Payment Confirmed</h2>
      <p>We have received your payment for Order #{{order_id}}.</p>
      
      <div style="background: #f0fdf4; padding: 15px; border-radius: 5px;">
        <p><strong>Amount Paid:</strong> {{amount_paid}}</p>
        <p><strong>Payment Method:</strong> {{payment_method}}</p>
        <p><strong>Transaction ID:</strong> {{transaction_id}}</p>
      </div>
      
      <p>We will notify you as soon as your order ships.</p>
    </div>
  '
),
(
  'ORDER_SHIPPED',
  'Order Shipped',
  'Your Order #{{order_id}} has Shipped!',
  '
    <div style="font-family: Arial, color: #333;">
      <h2>Good news! Your order is on the way.</h2>
      <p>Your order #{{order_id}} has been shipped.</p>
      
      <h3>Shipping Details</h3>
      <p><strong>Courier:</strong> {{courier_name}}</p>
      <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
      <p><strong>Estimated Delivery:</strong> {{estimated_delivery_date}}</p>
      
      <p>
        <a href="{{tracking_link}}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Track Package
        </a>
      </p>
    </div>
  '
)
on conflict (event_trigger) do update 
set 
  subject = excluded.subject,
  body_html = excluded.body_html,
  name = excluded.name;


-- 4. Database Trigger Function
create or replace function public.handle_order_email_trigger()
returns trigger as $$
declare
  v_template_id uuid;
  v_trigger_type text;
  v_context jsonb;
  v_customer_email text;
  v_customer_name text;
begin
  -- Determine Trigger Type
  v_trigger_type := null;

  if (TG_OP = 'INSERT') then
    v_trigger_type := 'ORDER_CREATED';
  elsif (TG_OP = 'UPDATE') then
    if (new.status = 'Paid' and old.status != 'Paid') then
      v_trigger_type := 'PAYMENT_SUCCESS';
    elsif (new.status = 'Shipped' and old.status != 'Shipped') then
      v_trigger_type := 'ORDER_SHIPPED';
    end if;
  end if;

  if v_trigger_type is null then
    return new;
  end if;

  -- Get Template
  select id into v_template_id from public.email_templates 
  where event_trigger = v_trigger_type and is_active = true limit 1;

  if v_template_id is not null then
    -- Robust Data Extraction (Handle optional columns vs details JSONB)
    v_customer_email := coalesce(new.details->>'email', 'no-email@example.com'); 
    v_customer_name := coalesce(new.details->>'firstName', 'Customer');

    -- Build Context Data
    v_context := jsonb_build_object(
      'order_id', new.id,
      'customer_name', v_customer_name,
      'total_amount', new.total,
      'shipping_address', new.details->>'address',
      'items', new.items, 
      'payment_method', new.details->>'paymentMethod',
      'transaction_id', new.details->>'transactionId',
      'amount_paid', new.total,
      'courier_name', coalesce(new.carrier, new.details->>'carrier'),
      'tracking_number', coalesce(new.tracking_number, new.details->>'trackingNumber'),
      'tracking_link', coalesce(new.tracking_url, new.details->>'trackingLink'),
      'estimated_delivery_date', '3-5 Business Days'
    );

    -- Insert to Log (Queue)
    insert into public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id)
    values (
      v_template_id,
      v_customer_email,
      v_customer_name,
      'PENDING',
      v_context,
      new.id
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- 5. Attach Trigger
drop trigger if exists on_order_email_event on public.orders;
create trigger on_order_email_event
after insert or update on public.orders
for each row execute function public.handle_order_email_trigger();
