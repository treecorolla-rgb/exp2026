-- ==============================================================================
-- RESTORE EMAIL SYSTEM (SAFE MODE)
-- ==============================================================================
-- This script safely re-integrates the email system.
-- Key Feature: It wraps the trigger logic in an EXCEPTION block.
-- If sending an email fails, it will NOT roll back the order.

-- 1. Ensure Tables Exist
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

-- 2. Ensure Permissions (RLS) - CRITICAL for preventing insertion errors
alter table public.email_templates enable row level security;
alter table public.email_logs enable row level security;

-- Drop old policies to ensure clean slate
drop policy if exists "Public read templates" on public.email_templates;
drop policy if exists "Public insert logs" on public.email_logs;
drop policy if exists "Public select logs" on public.email_logs;

-- Permissive policies (Internal tool usage)
create policy "Public read templates" on public.email_templates for select using (true);
create policy "Public insert logs" on public.email_logs for insert with check (true);
create policy "Public select logs" on public.email_logs for select using (true);
create policy "Public update logs" on public.email_logs for update using (true);

-- 3. Insert Default Templates (only if missing)
insert into public.email_templates (event_trigger, name, subject, body_html)
values 
(
  'ORDER_CREATED',
  'Order Placed - Thank You',
  'Order Confirmation #{{order_id}}',
  '<div style="font-family: Arial, color: #333;"><h2>Thank you, {{customer_name}}!</h2><p>We received your order #{{order_id}}.</p><p>Total: {{total_amount}}</p></div>'
),
(
  'PAYMENT_SUCCESS',
  'Payment Successful',
  'Payment Received for Order #{{order_id}}',
  '<div style="font-family: Arial, color: #333;"><h2>Payment Confirmed</h2><p>We received payment for order #{{order_id}}.</p></div>'
)
on conflict (event_trigger) do nothing;

-- 4. Define SAFE Trigger Function
create or replace function public.handle_order_email_trigger()
returns trigger as $$
declare
  v_template_id uuid;
  v_trigger_type text;
  v_context jsonb;
  v_customer_email text;
  v_customer_name text;
begin
  -- WRAP IN BLOCK TO CATCH ERRORS AND PREVENT ORDER ROLLBACK
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

      if v_trigger_type is not null then
          -- Get Template
          select id into v_template_id from public.email_templates 
          where event_trigger = v_trigger_type and is_active = true limit 1;

          if v_template_id is not null then
            -- Safe extraction with coalescing
            v_customer_email := coalesce(new.details->>'email', new.details->>'customerEmail', 'no-email@example.com'); 
            v_customer_name := coalesce(new.details->>'firstName', new.customer_name, 'Customer');

            -- Build Context
            v_context := jsonb_build_object(
              'order_id', new.id,
              'customer_name', v_customer_name,
              'total_amount', new.total
            );

            -- Insert Log
            insert into public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id)
            values (v_template_id, v_customer_email, v_customer_name, 'PENDING', v_context, new.id);
          end if;
      end if;
  exception when others then
      -- If anything fails (e.g. missing table, permission denied), 
      -- JUST LOG IT to Postgres logs, do not fail the transaction.
      raise warning 'Email Trigger Failed for Order %: %', new.id, SQLERRM;
  end;

  return new;
end;
$$ language plpgsql security definer;

-- 5. Re-attach Trigger
drop trigger if exists on_order_email_event on public.orders;
create trigger on_order_email_event
after insert or update on public.orders
for each row execute function public.handle_order_email_trigger();
