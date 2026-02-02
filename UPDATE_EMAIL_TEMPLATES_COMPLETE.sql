-- ==============================================================================
-- COMPLETE EMAIL TEMPLATES UPDATE - FOR BACKEND TEMPLATE EDITOR
-- ==============================================================================
-- This updates all email templates with professional, responsive designs
-- Compatible with your existing backend template management system
-- ==============================================================================

-- Update email_templates table structure (add missing fields if needed)
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS variables_help text;

-- ==============================================================================
-- 1. ORDER_CREATED - Order Confirmation
-- ==============================================================================
INSERT INTO public.email_templates (event_trigger, name, subject, body_html, description, variables_help, is_active)
VALUES (
  'ORDER_CREATED',
  'Order Placed Confirmation',
  'Thank you for your order #{{order_id}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0;">{{store_name}}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 40px 40px;">
            <!-- Success Icon -->
            <div style="width: 48px; height: 48px; background: #10b981; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">✓</div>
            
            <h2 style="font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; text-align: center;">Thank you for your order</h2>
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px; text-align: center;">We''ve received your order and will process it shortly</p>
            
            <!-- Order Info -->
            <div style="margin: 30px 0;">
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Order Number:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{order_id}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Customer:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{customer_name}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Order Date:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{order_date}}</div>
            </div>
            
            <div style="height: 1px; background: #e5e7eb; margin: 30px 0;"></div>
            
            <!-- Order Items -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 16px;">Order Summary</h3>
                <table width="100%" style="border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <th align="left" style="padding: 8px; color: #6b7280; font-size: 13px; font-weight: 600;">Product</th>
                        <th align="center" style="padding: 8px; color: #6b7280; font-size: 13px; font-weight: 600;">Qty</th>
                        <th align="right" style="padding: 8px; color: #6b7280; font-size: 13px; font-weight: 600;">Price</th>
                    </tr>
                    {{items_html}}
                </table>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
                    <span style="color: #1f2937; font-size: 16px; font-weight: 600;">Total amount</span>
                    <span style="color: #10b981; font-size: 20px; font-weight: 700;">${{total_amount}}</span>
                </div>
            </div>
            
            <!-- Shipping Address -->
            <div style="margin: 20px 0;">
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Shipping To:</div>
                <div style="color: #1f2937; font-size: 14px; line-height: 1.6;">
                    {{shipping_address}}
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
            We appreciate your business.
        </div>
    </div>
</body>
</html>',
  'Order confirmation email sent when a new order is placed',
  '{{order_id}}, {{customer_name}}, {{order_date}}, {{total_amount}}, {{items_html}}, {{shipping_address}}, {{store_name}}',
  true
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description,
  variables_help = EXCLUDED.variables_help;

-- ==============================================================================
-- 2. PAYMENT_RECEIVED - Payment Confirmation (Invoice Style)
-- ==============================================================================
INSERT INTO public.email_templates (event_trigger, name, subject, body_html, description, variables_help, is_active)
VALUES (
  'PAYMENT_RECEIVED',
  'Payment Receipt',
  'Payment Confirmation for Order #{{order_id}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0;">{{store_name}}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 40px 40px;">
            <!-- Success Icon -->
            <div style="width: 48px; height: 48px; background: #10b981; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">✓</div>
            
            <h2 style="font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; text-align: center;">Thank you for your order</h2>
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px; text-align: center;">We''ve received your payment and here is a summary for the same</p>
            
            <div style="font-size: 18px; color: #1f2937; font-weight: 600; margin: 30px 0 20px;">Invoice {{order_id}}</div>
            
            <!-- Payment Info -->
            <div style="margin: 20px 0;">
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Customer:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{customer_name}} ({{customer_email}})</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Payment method:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{payment_method}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Date of payment:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{payment_date}}</div>
            </div>
            
            <div style="height: 1px; background: #e5e7eb; margin: 30px 0;"></div>
            
            <!-- Payment Summary -->
            <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; margin: 12px 0;">
                    <span style="color: #6b7280; font-size: 15px;">Order Amount</span>
                    <span style="color: #1f2937; font-size: 15px; font-weight: 500;">${{subtotal}}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 12px 0;">
                    <span style="color: #6b7280; font-size: 15px;">Shipping</span>
                    <span style="color: #1f2937; font-size: 15px; font-weight: 500;">${{shipping_cost}}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 12px 0;">
                    <span style="color: #6b7280; font-size: 15px;">Discount</span>
                    <span style="color: #1f2937; font-size: 15px; font-weight: 500;">-${{discount}}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 12px 0; padding-top: 15px; margin-top: 15px; border-top: 2px solid #e5e7eb;">
                    <span style="color: #1f2937; font-size: 16px; font-weight: 600;">Total amount paid</span>
                    <span style="color: #10b981; font-size: 20px; font-weight: 700;">${{total_amount}}</span>
                </div>
            </div>
            
            <!-- Disclaimer -->
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 11px; color: #6b7280; line-height: 1.6;">
                <span style="font-weight: 600; color: #1f2937;">Disclaimer:</span> This is your payment receipt for the order. Please keep this for your records.
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
            We appreciate your business.
        </div>
    </div>
</body>
</html>',
  'Payment receipt sent when payment is confirmed',
  '{{order_id}}, {{customer_name}}, {{customer_email}}, {{payment_method}}, {{payment_date}}, {{subtotal}}, {{shipping_cost}}, {{discount}}, {{total_amount}}, {{store_name}}',
  true
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description,
  variables_help = EXCLUDED.variables_help;

-- ==============================================================================
-- 3. WELCOME_EMAIL - Welcome New Customer
-- ==============================================================================
INSERT INTO public.email_templates (event_trigger, name, subject, body_html, description, variables_help, is_active)
VALUES (
  'WELCOME_EMAIL',
  'Welcome to Our Store',
  'Welcome to {{store_name}}, {{customer_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center;">
            <h1 style="font-size: 24px; letter-spacing: 6px; color: white; font-weight: 300; margin: 0 0 20px;">{{store_name}}</h1>
            <h2 style="font-size: 36px; color: white; margin: 0; font-weight: 700;">Welcome!</h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px;">
            <p style="font-size: 20px; color: #1f2937; margin: 0 0 20px; font-weight: 600;">Hello {{customer_name}},</p>
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Thank you for joining our community! We''re thrilled to have you on board. 
                Your account has been successfully created, and you''re all set to start shopping.
            </p>
            
            <!-- Features -->
            <div style="margin: 30px 0;">
                <div style="display: flex; align-items: start; margin: 20px 0;">
                    <div style="width: 40px; height: 40px; background: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; color: #667eea; font-size: 20px; font-weight: bold;">✓</div>
                    <div style="flex: 1;">
                        <div style="color: #1f2937; font-weight: 600; margin: 0 0 5px;">Exclusive Offers</div>
                        <div style="color: #6b7280; font-size: 14px; margin: 0;">Get access to member-only deals and early product launches</div>
                    </div>
                </div>
                <div style="display: flex; align-items: start; margin: 20px 0;">
                    <div style="width: 40px; height: 40px; background: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; color: #667eea; font-size: 20px; font-weight: bold;">✓</div>
                    <div style="flex: 1;">
                        <div style="color: #1f2937; font-weight: 600; margin: 0 0 5px;">Order Tracking</div>
                        <div style="color: #6b7280; font-size: 14px; margin: 0;">Track your orders in real-time from purchase to delivery</div>
                    </div>
                </div>
                <div style="display: flex; align-items: start; margin: 20px 0;">
                    <div style="width: 40px; height: 40px; background: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; color: #667eea; font-size: 20px; font-weight: bold;">✓</div>
                    <div style="flex: 1;">
                        <div style="color: #1f2937; font-weight: 600; margin: 0 0 5px;">Fast Checkout</div>
                        <div style="color: #6b7280; font-size: 14px; margin: 0;">Save your preferences for a seamless shopping experience</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
            Questions? Contact us anytime at {{support_email}}
        </div>
    </div>
</body>
</html>',
  'Welcome email sent to first-time customers',
  '{{customer_name}}, {{store_name}}, {{support_email}}',
  true
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description,
  variables_help = EXCLUDED.variables_help;

-- ==============================================================================
-- 4. ORDER_SHIPPED - Shipping Notification
-- ==============================================================================
INSERT INTO public.email_templates (event_trigger, name, subject, body_html, description, variables_help, is_active)
VALUES (
  'ORDER_SHIPPED',
  'Order Shipped Notification',
  'Your order #{{order_id}} is on its way!',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0;">{{store_name}}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 40px 40px;">
            <!-- Shipping Icon -->
            <div style="width: 64px; height: 64px; background: #3b82f6; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">📦</div>
            
            <h2 style="font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; text-align: center;">Your order is on its way!</h2>
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px; text-align: center;">Your package has been shipped and will arrive soon</p>
            
            <!-- Tracking Box -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <div style="color: rgba(255,255,255,0.9); font-size: 13px; margin-bottom: 8px;">Tracking Number</div>
                <p style="color: white; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin: 0;">{{tracking_number}}</p>
            </div>
            
            <!-- Order Info -->
            <div style="margin: 30px 0;">
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Order Number:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{order_id}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Carrier:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{carrier}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Estimated Delivery:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{estimated_delivery}}</div>
            </div>
            
            <!-- Track Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Track Your Package</a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
            Questions about your delivery? Contact us at {{support_email}}
        </div>
    </div>
</body>
</html>',
  'Shipping notification with tracking information',
  '{{order_id}}, {{tracking_number}}, {{carrier}}, {{estimated_delivery}}, {{tracking_url}}, {{store_name}}, {{support_email}}',
  true
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description,
  variables_help = EXCLUDED.variables_help;

-- ==============================================================================
-- 5. ORDER_DELIVERED - Delivery Confirmation
-- ==============================================================================
INSERT INTO public.email_templates (event_trigger, name, subject, body_html, description, variables_help, is_active)
VALUES (
  'ORDER_DELIVERED',
  'Order Delivered',
  'Your order #{{order_id}} has been delivered!',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Delivered</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0;">{{store_name}}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 40px 40px;">
            <!-- Delivered Icon -->
            <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">🎉</div>
            
            <h2 style="font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; text-align: center;">Your order has been delivered!</h2>
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px; text-align: center;">We hope you enjoy your purchase</p>
            
            <!-- Delivery Confirmation -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; color: white;">
                <p style="font-size: 18px; font-weight: 600; margin: 0;">✓ Successfully delivered to your address</p>
            </div>
            
            <!-- Order Info -->
            <div style="margin: 30px 0;">
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Order Number:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{order_id}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Delivered To:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{customer_name}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Delivery Date:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{delivery_date}}</div>
            </div>
            
            <!-- Feedback Box -->
            <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <div style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px;">How was your experience?</div>
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">We''d love to hear your feedback about your order</p>
                <div style="font-size: 32px; margin: 15px 0;">⭐⭐⭐⭐⭐</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
            Thank you for shopping with us! We appreciate your business.
        </div>
    </div>
</body>
</html>',
  'Delivery confirmation with feedback request',
  '{{order_id}}, {{customer_name}}, {{delivery_date}}, {{store_name}}',
  true
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description,
  variables_help = EXCLUDED.variables_help;

-- ==============================================================================
-- 6. ORDER_CANCELED - Cancellation Notice
-- ==============================================================================
INSERT INTO public.email_templates (event_trigger, name, subject, body_html, description, variables_help, is_active)
VALUES (
  'ORDER_CANCELED',
  'Order Canceled',
  'Order #{{order_id}} has been canceled',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Canceled</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0;">{{store_name}}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 0 40px 40px;">
            <!-- Canceled Icon -->
            <div style="width: 64px; height: 64px; background: #ef4444; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">✕</div>
            
            <h2 style="font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; text-align: center;">Order Canceled</h2>
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px; text-align: center;">Your order has been successfully canceled</p>
            
            <!-- Alert Box -->
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <div style="color: #991b1b; font-weight: 600; margin: 0 0 8px;">Order Cancellation Confirmed</div>
                <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6;">
                    Your order has been canceled as requested. No further action is required from your side.
                </p>
            </div>
            
            <!-- Order Info -->
            <div style="margin: 30px 0;">
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Order Number:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{order_id}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Customer:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{customer_name}}</div>
                
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">Cancellation Date:</div>
                <div style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px;">{{cancellation_date}}</div>
            </div>
            
            <!-- Refund Box -->
            <div style="background: #f0fdf4; border: 2px solid #86efac; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <div style="color: #166534; font-weight: 600; margin: 0 0 8px;">💰 Refund Information</div>
                <p style="color: #15803d; font-size: 14px; margin: 0; line-height: 1.6;">
                    If you''ve already made a payment, a full refund of ${{total_amount}} will be processed to your original payment method within 5-7 business days.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
            Questions? Contact us at {{support_email}}
        </div>
    </div>
</body>
</html>',
  'Cancellation notice with refund information',
  '{{order_id}}, {{customer_name}}, {{cancellation_date}}, {{total_amount}}, {{store_name}}, {{support_email}}',
  true
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description,
  variables_help = EXCLUDED.variables_help;

-- ==============================================================================
-- 7. LOGIN_OTP - Login Verification Code (if you use OTP)
-- ==============================================================================
INSERT INTO public.email_templates (event_trigger, name, subject, body_html, description, variables_help, is_active)
VALUES (
  'LOGIN_OTP',
  'Login OTP Code',
  'Your Login Code: {{otp_code}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0;">{{store_name}}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px;">
            <h2 style="font-size: 24px; color: #1f2937; margin: 0 0 20px; font-weight: 600; text-align: center;">Login Verification</h2>
            <p style="color: #6b7280; font-size: 15px; margin: 0 0 30px; text-align: center;">Use the following code to access your account</p>
            
            <!-- OTP Code Box -->
            <div style="background: #f9fafb; border: 2px solid #e5e7eb; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <div style="color: #6b7280; font-size: 13px; margin-bottom: 10px;">Your verification code</div>
                <div style="font-size: 48px; font-weight: 700; color: #1f2937; letter-spacing: 8px; font-family: ''Courier New'', monospace;">{{otp_code}}</div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0;">
                If you did not request this code, please ignore this email.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
            Questions? Contact us at {{support_email}}
        </div>
    </div>
</body>
</html>',
  'Login verification code email',
  '{{otp_code}}, {{store_name}}, {{support_email}}',
  true
)
ON CONFLICT (event_trigger) DO UPDATE 
SET 
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  description = EXCLUDED.description,
  variables_help = EXCLUDED.variables_help;

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================
DO $$
DECLARE
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO template_count FROM public.email_templates;
    
    RAISE NOTICE '✅ Email templates updated successfully!';
    RAISE NOTICE 'Total templates: %', template_count;
    RAISE NOTICE '';
    RAISE NOTICE '📧 Available Templates:';
    RAISE NOTICE '  1. ORDER_CREATED - Order confirmation';
    RAISE NOTICE '  2. PAYMENT_RECEIVED - Payment receipt';
    RAISE NOTICE '  3. WELCOME_EMAIL - Welcome message';
    RAISE NOTICE '  4. ORDER_SHIPPED - Shipping notification';
    RAISE NOTICE '  5. ORDER_DELIVERED - Delivery confirmation';
    RAISE NOTICE '  6. ORDER_CANCELED - Cancellation notice';
    RAISE NOTICE '  7. LOGIN_OTP - Login verification code';
    RAISE NOTICE '';
    RAISE NOTICE '✨ All templates are:';
    RAISE NOTICE '  - Responsive (desktop + mobile)';
    RAISE NOTICE '  - Editable via Admin Panel → Email System → Templates';
    RAISE NOTICE '  - Include variable hints for easy editing';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next: Edit templates in your Admin Dashboard!';
END $$;
