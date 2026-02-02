-- Update Descriptions for all Standard Email Triggers
update public.email_templates
set description = case event_trigger
    when 'ORDER_CREATED' then 'Sent immediately when a customer places a new order.'
    when 'ORDER_SHIPPED' then 'Sent when you mark an order as Shipped in the dashboard.'
    when 'ORDER_DELIVERED' then 'Sent when the order is marked as Delivered.'
    when 'LOGIN_OTP' then 'Sends a 6-digit One-Time Password for login.'
    when 'ACCOUNT_WELCOME' then 'Sent to new users immediately after signup.'
    when 'PAYMENT_RECEIVED' then 'Sent when a payment is successfully recorded.'
    when 'PASSWORD_RESET' then 'Sent when a user requests a password reset link.'
    else description
end
where event_trigger in (
  'ORDER_CREATED', 
  'ORDER_SHIPPED', 
  'ORDER_DELIVERED', 
  'LOGIN_OTP', 
  'ACCOUNT_WELCOME', 
  'PAYMENT_RECEIVED',
  'PASSWORD_RESET'
);

-- Delete duplicate/unused trigger if it exists
delete from public.email_templates where event_trigger = 'PAYMENT_SUCCESS';
