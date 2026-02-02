-- Create Admin Order Notification Email Template (CORRECTED)
-- Using correct column names: subject, body_html (not subject_line, html_body)

INSERT INTO email_templates (
  event_trigger,
  name,
  subject,
  body_html,
  is_active
) VALUES (
  'ADMIN_ORDER_NOTIFICATION',
  'Admin Order Notification',
  'NEW Order Placed - Order {{order_id}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛒 New Order Received!</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Order Summary -->
      <div style="background-color: #f8fafc; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 25px;">
        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px;">Order Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Order ID:</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">{{order_id}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Order Date:</td>
            <td style="padding: 8px 0; color: #1e293b;">{{order_date}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Total Amount:</td>
            <td style="padding: 8px 0; color: #16a34a; font-size: 24px; font-weight: bold;">${{total_amount}}</td>
          </tr>
        </table>
      </div>

      <!-- Customer Information -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">👤 Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Name:</td>
            <td style="padding: 8px 0; color: #1e293b;">{{customer_name}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
            <td style="padding: 8px 0; color: #1e293b;">{{customer_email}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone:</td>
            <td style="padding: 8px 0; color: #1e293b;">{{customer_phone}}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📦 Shipping Address</h3>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; color: #1e293b; line-height: 1.6;">
          {{shipping_address}}
        </div>
      </div>

      <!-- Order Items -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📋 Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 12px; text-align: left; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Item</th>
              <th style="padding: 12px; text-align: center; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Price</th>
            </tr>
          </thead>
          <tbody>
            {{items_html}}
          </tbody>
        </table>
      </div>

      <!-- Payment Summary -->
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">💰 Payment Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Subtotal:</td>
            <td style="padding: 6px 0; text-align: right; color: #1e293b;">${{subtotal}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Shipping:</td>
            <td style="padding: 6px 0; text-align: right; color: #1e293b;">${{shipping_cost}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Discount:</td>
            <td style="padding: 6px 0; text-align: right; color: #dc2626;">-${{discount}}</td>
          </tr>
          <tr style="border-top: 2px solid #e2e8f0;">
            <td style="padding: 12px 0; color: #1e293b; font-weight: bold; font-size: 18px;">Total:</td>
            <td style="padding: 12px 0; text-align: right; color: #16a34a; font-weight: bold; font-size: 20px;">${{total_amount}}</td>
          </tr>
        </table>
      </div>

      <!-- Payment Method -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
        <strong style="color: #92400e;">Payment Method:</strong>
        <span style="color: #78350f; margin-left: 10px;">{{payment_method}}</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #64748b; font-size: 14px;">
        This is an automated notification from your store admin panel.
      </p>
      <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">
        © 2026 Your Store. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>',
  true
)
ON CONFLICT (event_trigger) 
DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  is_active = EXCLUDED.is_active;

-- Verify the template was created
SELECT 
  id,
  event_trigger,
  name,
  subject,
  is_active
FROM email_templates
WHERE event_trigger = 'ADMIN_ORDER_NOTIFICATION';
