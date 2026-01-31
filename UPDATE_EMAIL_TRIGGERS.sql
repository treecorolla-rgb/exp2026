-- ==============================================================================
-- UPDATE EMAIL SYSTEM: ADD MISSING TRIGGERS (DELIVERED/PAID)
-- ==============================================================================

-- 1. Insert Missing Templates (ORDER_DELIVERED)
insert into public.email_templates (event_trigger, name, subject, body_html)
values 
(
  'ORDER_DELIVERED',
  'Order Delivered',
  'Your Order #{{order_id}} has been Delivered!',
  '
    <div style="font-family: Arial, color: #333;">
      <h2>Delivery Confirmed</h2>
      <p>Your order #{{order_id}} has been successfully delivered.</p>
      
      <p>We hope you enjoy your purchase. If you have any feedback or issues, please reply to this email.</p>
      
      <hr/>
      <p>Thank you for choosing us!</p>
    </div>
  '
)
on conflict (event_trigger) do nothing;

-- 2. Update the Trigger Function to Handle 'Delivered' and Ensure 'Paid' works
create or replace function public.handle_order_email_trigger()
returns trigger as $$
declare
  v_template_id uuid;
  v_trigger_type text;
  v_context jsonb;
  v_customer_email text;
  v_customer_name text;
begin
  begin -- SAFE BLOCK
      v_trigger_type := null;

      if (TG_OP = 'INSERT') then
        v_trigger_type := 'ORDER_CREATED';
      elsif (TG_OP = 'UPDATE') then
        -- Check for status changes
        if (new.status = 'Paid' and old.status != 'Paid') then
          v_trigger_type := 'PAYMENT_SUCCESS';
        elsif (new.status = 'Shipped' and old.status != 'Shipped') then
          v_trigger_type := 'ORDER_SHIPPED';
        elsif (new.status = 'Delivered' and old.status != 'Delivered') then
          v_trigger_type := 'ORDER_DELIVERED';
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
              'total_amount', new.total,
              'tracking_number', coalesce(new.tracking_number, new.details->>'trackingNumber', 'N/A'),
              'carrier', coalesce(new.carrier, new.details->>'carrier', 'N/A')
            );

            -- Insert Log
            insert into public.email_logs (template_id, recipient_email, recipient_name, status, context_data, related_order_id)
            values (v_template_id, v_customer_email, v_customer_name, 'PENDING', v_context, new.id);
          end if;
      end if;
  exception when others then
      raise warning 'Email Trigger Failed for Order %: %', new.id, SQLERRM;
  end;

  return new;
end;
$$ language plpgsql security definer;
