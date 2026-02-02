-- ==============================================================================
-- PROFESSIONAL EMAIL TEMPLATES FOR ALL TRIGGERS
-- ==============================================================================
-- Responsive, mobile-friendly email templates with modern design
-- Based on the payment receipt template design
-- ==============================================================================

-- Update all email templates with professional HTML
-- These templates are responsive and work on both desktop and mobile

-- 1. ORDER CREATED (Order Confirmation)
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
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
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0; }
        .company-name { font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0; }
        .icon-success { width: 48px; height: 48px; background: #10b981; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; }
        .icon-success::after { content: "✓"; color: white; font-size: 28px; font-weight: bold; }
        .title { font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; }
        .subtitle { color: #6b7280; font-size: 15px; margin: 0 0 30px; }
        .content { padding: 0 40px 40px; }
        .info-section { margin: 30px 0; }
        .info-label { color: #6b7280; font-size: 13px; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
        .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
        .order-summary { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .summary-row { display: flex; justify-content: space-between; margin: 12px 0; }
        .summary-label { color: #6b7280; font-size: 15px; }
        .summary-value { color: #1f2937; font-size: 15px; font-weight: 500; }
        .total-row { border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 15px; }
        .total-label { color: #1f2937; font-size: 16px; font-weight: 600; }
        .total-value { color: #10b981; font-size: 20px; font-weight: 700; }
        .footer { background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .title { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="company-name">COMPANY</h1>
        </div>
        <div class="content">
            <div class="icon-success"></div>
            <h2 class="title">Thank you for your order</h2>
            <p class="subtitle">We''ve received your order and will process it shortly</p>
            
            <div class="info-section">
                <div class="info-label">Order Number:</div>
                <div class="info-value">#{{order_id}}</div>
                
                <div class="info-label">Customer:</div>
                <div class="info-value">{{customer_name}}</div>
                
                <div class="info-label">Order Date:</div>
                <div class="info-value">{{order_date}}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="order-summary">
                <div class="summary-row">
                    <span class="summary-label">Order Total</span>
                    <span class="summary-value">${{total_amount}}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Status</span>
                    <span class="summary-value">{{status}}</span>
                </div>
                <div class="summary-row total-row">
                    <span class="total-label">Total amount</span>
                    <span class="total-value">${{total_amount}}</span>
                </div>
            </div>
        </div>
        <div class="footer">
            We appreciate your business.
        </div>
    </div>
</body>
</html>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET name = EXCLUDED.name, subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;

-- 2. PAYMENT RECEIVED (Payment Confirmation)
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
VALUES (
  'PAYMENT_RECEIVED',
  'Payment Received',
  'Payment Confirmation for Order #{{order_id}}',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Received</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0; }
        .company-name { font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0; }
        .icon-success { width: 48px; height: 48px; background: #10b981; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; }
        .icon-success::after { content: "✓"; color: white; font-size: 28px; font-weight: bold; }
        .title { font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; }
        .subtitle { color: #6b7280; font-size: 15px; margin: 0 0 30px; }
        .content { padding: 0 40px 40px; }
        .invoice-label { font-size: 18px; color: #1f2937; font-weight: 600; margin: 30px 0 20px; }
        .info-section { margin: 20px 0; }
        .info-label { color: #6b7280; font-size: 13px; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
        .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
        .payment-summary { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .summary-row { display: flex; justify-content: space-between; margin: 12px 0; }
        .summary-label { color: #6b7280; font-size: 15px; }
        .summary-value { color: #1f2937; font-size: 15px; font-weight: 500; }
        .total-row { border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 15px; }
        .total-label { color: #1f2937; font-size: 16px; font-weight: 600; }
        .total-value { color: #10b981; font-size: 20px; font-weight: 700; }
        .disclaimer { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 11px; color: #6b7280; line-height: 1.6; }
        .disclaimer-title { font-weight: 600; color: #1f2937; }
        .footer { background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .title { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="company-name">COMPANY</h1>
        </div>
        <div class="content">
            <div class="icon-success"></div>
            <h2 class="title">Thank you for your order</h2>
            <p class="subtitle">We''ve received your payment and here is a summary for the same</p>
            
            <div class="invoice-label">Invoice #{{order_id}}</div>
            
            <div class="info-section">
                <div class="info-label">Customer:</div>
                <div class="info-value">{{customer_name}}</div>
                
                <div class="info-label">Payment method:</div>
                <div class="info-value">Credit Card</div>
                
                <div class="info-label">Date of payment:</div>
                <div class="info-value">{{payment_date}}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="payment-summary">
                <div class="summary-row">
                    <span class="summary-label">Order Amount</span>
                    <span class="summary-value">${{total_amount}}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Transaction Tax</span>
                    <span class="summary-value">$0</span>
                </div>
                <div class="summary-row total-row">
                    <span class="total-label">Total amount paid</span>
                    <span class="total-value">${{total_amount}}</span>
                </div>
            </div>
            
            <div class="disclaimer">
                <span class="disclaimer-title">Disclaimer:</span> Attached is the invoice for the services provided by the outlet. For items not covered in the attached invoice, the outlet shall be responsible to issue an invoice directly to you.
            </div>
        </div>
        <div class="footer">
            We appreciate your business.
        </div>
    </div>
</body>
</html>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET name = EXCLUDED.name, subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;

-- 3. WELCOME EMAIL
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
VALUES (
  'WELCOME_EMAIL',
  'Welcome to Our Store',
  'Welcome to the family, {{customer_name}}!',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center; }
        .company-name { font-size: 24px; letter-spacing: 6px; color: white; font-weight: 300; margin: 0 0 20px; }
        .header-title { font-size: 36px; color: white; margin: 0; font-weight: 700; }
        .content { padding: 40px; }
        .greeting { font-size: 20px; color: #1f2937; margin: 0 0 20px; font-weight: 600; }
        .message { color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .features { margin: 30px 0; }
        .feature-item { display: flex; align-items: start; margin: 20px 0; }
        .feature-icon { width: 40px; height: 40px; background: #ede9fe; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
        .feature-icon::after { content: "✓"; color: #667eea; font-size: 20px; font-weight: bold; }
        .feature-text { flex: 1; }
        .feature-title { color: #1f2937; font-weight: 600; margin: 0 0 5px; }
        .feature-desc { color: #6b7280; font-size: 14px; margin: 0; }
        .footer { background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header { padding: 30px 20px; }
            .header-title { font-size: 28px; }
            .content, .footer { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="company-name">COMPANY</h1>
            <h2 class="header-title">Welcome!</h2>
        </div>
        <div class="content">
            <p class="greeting">Hello {{customer_name}},</p>
            <p class="message">
                Thank you for joining our community! We''re thrilled to have you on board. 
                Your account has been successfully created, and you''re all set to start shopping.
            </p>
            
            <div class="features">
                <div class="feature-item">
                    <div class="feature-icon"></div>
                    <div class="feature-text">
                        <div class="feature-title">Exclusive Offers</div>
                        <div class="feature-desc">Get access to member-only deals and early product launches</div>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon"></div>
                    <div class="feature-text">
                        <div class="feature-title">Order Tracking</div>
                        <div class="feature-desc">Track your orders in real-time from purchase to delivery</div>
                    </div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon"></div>
                    <div class="feature-text">
                        <div class="feature-title">Fast Checkout</div>
                        <div class="feature-desc">Save your preferences for a seamless shopping experience</div>
                    </div>
                </div>
            </div>
            
            <center>
                <a href="#" class="cta-button">Start Shopping</a>
            </center>
        </div>
        <div class="footer">
            Questions? Contact us anytime at support@company.com
        </div>
    </div>
</body>
</html>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET name = EXCLUDED.name, subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;

-- 4. ORDER SHIPPED
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
VALUES (
  'ORDER_SHIPPED',
  'Order Shipped',
  'Your order #{{order_id}} is on its way!',
  '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0; }
        .company-name { font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0; }
        .icon-shipping { width: 64px; height: 64px; background: #3b82f6; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; }
        .icon-shipping::after { content: "📦"; font-size: 32px; }
        .title { font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; }
        .subtitle { color: #6b7280; font-size: 15px; margin: 0 0 30px; }
        .content { padding: 0 40px 40px; }
        .tracking-box { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; }
        .tracking-label { color: rgba(255,255,255,0.9); font-size: 13px; margin-bottom: 8px; }
        .tracking-number { color: white; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin: 0; }
        .info-section { margin: 30px 0; }
        .info-label { color: #6b7280; font-size: 13px; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
        .timeline { margin: 30px 0; }
        .timeline-item { display: flex; align-items: start; margin: 20px 0; }
        .timeline-dot { width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; margin-top: 5px; margin-right: 15px; flex-shrink: 0; }
        .timeline-dot.completed { background: #10b981; }
        .timeline-dot.pending { background: #e5e7eb; }
        .timeline-content { flex: 1; }
        .timeline-title { color: #1f2937; font-weight: 600; margin: 0 0 3px; }
        .timeline-desc { color: #6b7280; font-size: 13px; margin: 0; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .title { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="company-name">COMPANY</h1>
        </div>
        <div class="content">
            <div class="icon-shipping"></div>
            <h2 class="title">Your order is on its way!</h2>
            <p class="subtitle">Your package has been shipped and will arrive soon</p>
            
            <div class="tracking-box">
                <div class="tracking-label">Tracking Number</div>
                <p class="tracking-number">{{tracking_number}}</p>
            </div>
            
            <div class="info-section">
                <div class="info-label">Order Number:</div>
                <div class="info-value">#{{order_id}}</div>
                
                <div class="info-label">Estimated Delivery:</div>
                <div class="info-value">{{estimated_delivery}}</div>
            </div>
            
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-dot completed"></div>
                    <div class="timeline-content">
                        <div class="timeline-title">Order Placed</div>
                        <div class="timeline-desc">Your order has been confirmed</div>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot completed"></div>
                    <div class="timeline-content">
                        <div class="timeline-title">Shipped</div>
                        <div class="timeline-desc">Package is in transit</div>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot pending"></div>
                    <div class="timeline-content">
                        <div class="timeline-title">Out for Delivery</div>
                        <div class="timeline-desc">Package will be delivered soon</div>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-dot pending"></div>
                    <div class="timeline-content">
                        <div class="timeline-title">Delivered</div>
                        <div class="timeline-desc">Package arrives at your doorstep</div>
                    </div>
                </div>
            </div>
            
            <center>
                <a href="#" class="cta-button">Track Your Package</a>
            </center>
        </div>
        <div class="footer">
            Questions about your delivery? Contact us at support@company.com
        </div>
    </div>
</body>
</html>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET name = EXCLUDED.name, subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;

-- 5. ORDER DELIVERED
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
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
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0; }
        .company-name { font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0; }
        .icon-delivered { width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; }
        .icon-delivered::after { content: "🎉"; font-size: 32px; }
        .title { font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; }
        .subtitle { color: #6b7280; font-size: 15px; margin: 0 0 30px; }
        .content { padding: 0 40px 40px; }
        .delivery-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; color: white; }
        .delivery-message { font-size: 18px; font-weight: 600; margin: 0; }
        .info-section { margin: 30px 0; }
        .info-label { color: #6b7280; font-size: 13px; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
        .feedback-box { background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; }
        .feedback-title { color: #1f2937; font-size: 18px; font-weight: 600; margin: 0 0 10px; }
        .feedback-text { color: #6b7280; font-size: 14px; margin: 0 0 20px; }
        .star-rating { font-size: 32px; margin: 15px 0; }
        .cta-button { display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 10px 0; }
        .footer { background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .title { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="company-name">COMPANY</h1>
        </div>
        <div class="content">
            <div class="icon-delivered"></div>
            <h2 class="title">Your order has been delivered!</h2>
            <p class="subtitle">We hope you enjoy your purchase</p>
            
            <div class="delivery-box">
                <p class="delivery-message">✓ Successfully delivered to your address</p>
            </div>
            
            <div class="info-section">
                <div class="info-label">Order Number:</div>
                <div class="info-value">#{{order_id}}</div>
                
                <div class="info-label">Delivered To:</div>
                <div class="info-value">{{customer_name}}</div>
                
                <div class="info-label">Delivery Date:</div>
                <div class="info-value">{{delivery_date}}</div>
            </div>
            
            <div class="feedback-box">
                <div class="feedback-title">How was your experience?</div>
                <p class="feedback-text">We''d love to hear your feedback about your order</p>
                <div class="star-rating">⭐⭐⭐⭐⭐</div>
                <a href="#" class="cta-button">Leave a Review</a>
            </div>
        </div>
        <div class="footer">
            Thank you for shopping with us! We appreciate your business.
        </div>
    </div>
</body>
</html>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET name = EXCLUDED.name, subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;

-- 6. ORDER CANCELED
INSERT INTO public.email_templates (event_trigger, name, subject, body_html)
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
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: white; padding: 30px 40px; text-align: center; border-bottom: 1px solid #e0e0e0; }
        .company-name { font-size: 18px; letter-spacing: 4px; color: #333; font-weight: 300; margin: 0; }
        .icon-canceled { width: 64px; height: 64px; background: #ef4444; border-radius: 50%; margin: 30px auto 20px; display: flex; align-items: center; justify-content: center; }
        .icon-canceled::after { content: "✕"; color: white; font-size: 32px; font-weight: bold; }
        .title { font-size: 28px; color: #1f2937; margin: 20px 0 10px; font-weight: 600; }
        .subtitle { color: #6b7280; font-size: 15px; margin: 0 0 30px; }
        .content { padding: 0 40px 40px; }
        .alert-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin: 30px 0; }
        .alert-title { color: #991b1b; font-weight: 600; margin: 0 0 8px; }
        .alert-text { color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6; }
        .info-section { margin: 30px 0; }
        .info-label { color: #6b7280; font-size: 13px; margin-bottom: 5px; }
        .info-value { color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
        .refund-box { background: #f0fdf4; border: 2px solid #86efac; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .refund-title { color: #166534; font-weight: 600; margin: 0 0 8px; }
        .refund-text { color: #15803d; font-size: 14px; margin: 0; line-height: 1.6; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 20px; }
            .title { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="company-name">COMPANY</h1>
        </div>
        <div class="content">
            <div class="icon-canceled"></div>
            <h2 class="title">Order Canceled</h2>
            <p class="subtitle">Your order has been successfully canceled</p>
            
            <div class="alert-box">
                <div class="alert-title">Order Cancellation Confirmed</div>
                <p class="alert-text">
                    Your order has been canceled as requested. No further action is required from your side.
                </p>
            </div>
            
            <div class="info-section">
                <div class="info-label">Order Number:</div>
                <div class="info-value">#{{order_id}}</div>
                
                <div class="info-label">Customer:</div>
                <div class="info-value">{{customer_name}}</div>
                
                <div class="info-label">Cancellation Date:</div>
                <div class="info-value">{{cancellation_date}}</div>
            </div>
            
            <div class="refund-box">
                <div class="refund-title">💰 Refund Information</div>
                <p class="refund-text">
                    If you''ve already made a payment, a full refund of ${{total_amount}} will be processed to your original payment method within 5-7 business days.
                </p>
            </div>
            
            <center>
                <a href="#" class="cta-button">Continue Shopping</a>
            </center>
        </div>
        <div class="footer">
            Questions? Contact us at support@company.com
        </div>
    </div>
</body>
</html>'
)
ON CONFLICT (event_trigger) DO UPDATE 
SET name = EXCLUDED.name, subject = EXCLUDED.subject, body_html = EXCLUDED.body_html;

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
    RAISE NOTICE '';
    RAISE NOTICE '✨ All templates are responsive and mobile-friendly!';
END $$;
