-- ==============================================================================
-- FIX EMAIL DUPLICATES AND MISSING TRIGGERS
-- ==============================================================================

-- 1. Aggressively Drop ALL Potential Triggers to stop duplicates
-- We suspect existing triggers are firing multiple times.
drop trigger if exists on_order_email_event on public.orders;
drop trigger if exists on_order_status_change on public.orders;
drop trigger if exists trigger_send_email_on_order on public.orders;
drop trigger if exists notify_order_status on public.orders;
drop trigger if exists on_new_order on public.orders;

-- 2. Drop the function to rebuild it clean
drop function if exists public.handle_order_email_trigger() cascade;

-- 3. Ensure Templates Exist (Standardized Names)
-- 'welcome_email' for new accounts created during checkout
insert into public.email_templates (event_trigger, name, subject, body_html)
values 
(
  'WELCOME_EMAIL',
  'Welcome to AirMail Chemist',
  'Welcome to the family, {{customer_name}}!',
  '<div style="font-family: Arial;"><h2>Welcome!</h2><p>Thanks for creating an account with us.</p></div>'
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
on conflict (event_trigger) do nothing;

-- 4. Create the Master Trigger Function
create or replace function public.handle_order_email_trigger()
returns trigger as $$
declare
  v_tid uuid; 
  v_type text; 
  v_ctx jsonb;
  v_send_welcome boolean := false;
begin
  begin -- SAFE BLOCK
      v_type := null;

      -- A) HANDLE INSERT (New Order)
      if (TG_OP = 'INSERT') then
         v_type := 'ORDER_CREATED';
         
         -- Check for Welcome Email (Account Creation)
         -- We check the JSONB 'accountCreated' flag or a dedicated column
         if (new.details->>'accountCreated' = 'true' or new.details->'createAccount' = 'true') then
             v_send_welcome := true;
         end if;

      -- B) HANDLE UPDATE (Status Change)
      elsif (TG_OP = 'UPDATE') then
         -- Only trigger if status ACTUALLY changed
         if (new.status is distinct from old.status) then
             if (new.status = 'Paid') then v_type := 'PAYMENT_RECEIVED'; -- Map 'Paid' -> TEMPLATE NAME
             elsif (new.status = 'Shipped') then v_type := 'ORDER_SHIPPED';
             elsif (new.status = 'Delivered') then v_type := 'ORDER_DELIVERED';
             end if;
         end if;
      end if;

      -- C) Insert Log for Primary Event (Order/Status)
      if v_type is not null then
          select id into v_tid from public.email_templates where event_trigger = v_type and is_active = true limit 1;
          
          -- Fallback: If 'PAYMENT_RECEIVED' missing, try 'PAYMENT_SUCCESS'
          if v_tid is null and v_type = 'PAYMENT_RECEIVED' then
             select id into v_tid from public.email_templates where event_trigger = 'PAYMENT_SUCCESS' and is_active = true limit 1;
          end if;

          if v_tid is not null then
            v_ctx := jsonb_build_object(
              'order_id', new.id,
              'customer_name', coalesce(new.details->>'firstName', 'Customer'),
              'total_amount', new.total,
              'status', new.status,
              'tracking_number', coalesce(new.tracking_number, new.details->>'trackingNumber', 'N/A')
            );
            
            insert into public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id)
            values (v_tid, coalesce(new.details->>'email', 'no-email@example.com'), coalesce(new.details->>'firstName', 'Customer'), 'PENDING', v_ctx, new.id);
          end if;
      end if;

      -- D) Insert Log for Welcome Email (Secondary Event)
      if v_send_welcome = true then
          select id into v_tid from public.email_templates where event_trigger = 'WELCOME_EMAIL' and is_active = true limit 1;
          if v_tid is not null then
             v_ctx := jsonb_build_object('customer_name', coalesce(new.details->>'firstName', 'Customer'));
             insert into public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id)
            values (v_tid, coalesce(new.details->>'email', 'no-email@example.com'), coalesce(new.details->>'firstName', 'Customer'), 'PENDING', v_ctx, new.id);
          end if;
      end if;

  exception when others then 
      raise warning 'Email logic failed: %', SQLERRM; 
  end;
  return new;
end;
$$ language plpgsql security definer;

-- 5. Attach Only ONE Trigger
create trigger on_order_email_event
after insert or update on public.orders
for each row execute function public.handle_order_email_trigger();
