# 📧 Professional Email Templates - Complete Guide

## Overview
This document describes all email templates created for the system. Each template is **responsive** and optimized for both **desktop and mobile** viewing.

---

## 🎨 Design Philosophy

All templates follow these principles:
- **Clean & Modern**: Minimalist design with clear hierarchy
- **Responsive**: Adapts perfectly to mobile and desktop screens
- **Consistent Branding**: Unified look across all email types
- **Accessible**: High contrast, readable fonts, clear CTAs
- **Professional**: Based on industry-standard transactional email design

---

## 📬 Email Templates

### 1. **ORDER_CREATED** - Order Confirmation
**Trigger:** When a new order is placed  
**Subject:** `Thank you for your order #{{order_id}}`

**Purpose:** Confirms order receipt and provides order details

**Key Features:**
- ✅ Green success icon
- Order number prominently displayed
- Customer name and order date
- Order summary with total amount
- Professional footer

**Variables Used:**
- `{{order_id}}` - Order number
- `{{customer_name}}` - Customer's name
- `{{order_date}}` - Date order was placed
- `{{total_amount}}` - Total order value
- `{{status}}` - Current order status

---

### 2. **PAYMENT_RECEIVED** - Payment Confirmation
**Trigger:** When payment is successfully processed  
**Subject:** `Payment Confirmation for Order #{{order_id}}`

**Purpose:** Receipt for payment with invoice-style details

**Key Features:**
- ✅ Green success checkmark
- Invoice number format
- Payment method display
- Transaction breakdown (amount + tax)
- Legal disclaimer section
- Matches the screenshot design exactly

**Variables Used:**
- `{{order_id}}` - Invoice/Order number
- `{{customer_name}}` - Customer's name
- `{{payment_date}}` - Date payment was processed
- `{{total_amount}}` - Total amount paid

**Design Notes:**
- This template matches the screenshot provided
- Includes disclaimer text for legal compliance
- Shows payment breakdown with tax line item

---

### 3. **WELCOME_EMAIL** - Welcome to Store
**Trigger:** When a customer creates an account  
**Subject:** `Welcome to the family, {{customer_name}}!`

**Purpose:** Welcome new customers and highlight benefits

**Key Features:**
- 🎨 Purple gradient header
- Warm, friendly greeting
- Feature highlights with icons:
  - Exclusive Offers
  - Order Tracking
  - Fast Checkout
- "Start Shopping" CTA button
- Support contact information

**Variables Used:**
- `{{customer_name}}` - Customer's name

**Design Notes:**
- Uses gradient background for visual appeal
- Feature list helps onboard new customers
- More colorful than transactional emails

---

### 4. **ORDER_SHIPPED** - Shipping Notification
**Trigger:** When order status changes to "Shipped"  
**Subject:** `Your order #{{order_id}} is on its way!`

**Purpose:** Notify customer of shipment with tracking info

**Key Features:**
- 📦 Blue shipping icon
- Prominent tracking number display
- Estimated delivery date
- Visual timeline showing shipping progress:
  - ✅ Order Placed
  - ✅ Shipped (current)
  - ⚪ Out for Delivery
  - ⚪ Delivered
- "Track Your Package" CTA button

**Variables Used:**
- `{{order_id}}` - Order number
- `{{tracking_number}}` - Shipping tracking number
- `{{estimated_delivery}}` - Expected delivery date

**Design Notes:**
- Blue theme represents shipping/transit
- Timeline provides clear status visualization
- Tracking number in highlighted box for easy copying

---

### 5. **ORDER_DELIVERED** - Delivery Confirmation
**Trigger:** When order status changes to "Delivered"  
**Subject:** `Your order #{{order_id}} has been delivered!`

**Purpose:** Confirm successful delivery and request feedback

**Key Features:**
- 🎉 Green celebration icon
- Success message with delivery confirmation
- Delivery details (date, recipient)
- Feedback request section with star rating
- "Leave a Review" CTA button

**Variables Used:**
- `{{order_id}}` - Order number
- `{{customer_name}}` - Customer's name
- `{{delivery_date}}` - Date of delivery

**Design Notes:**
- Green theme represents success/completion
- Encourages customer engagement through reviews
- Celebratory tone to reinforce positive experience

---

### 6. **ORDER_CANCELED** - Cancellation Notice
**Trigger:** When order status changes to "Cancelled"  
**Subject:** `Order #{{order_id}} has been canceled`

**Purpose:** Confirm cancellation and explain refund process

**Key Features:**
- ❌ Red cancellation icon
- Clear cancellation confirmation
- Alert box explaining the cancellation
- Refund information box (green):
  - Refund amount
  - Processing timeline (5-7 days)
  - Payment method info
- "Continue Shopping" CTA button

**Variables Used:**
- `{{order_id}}` - Order number
- `{{customer_name}}` - Customer's name
- `{{cancellation_date}}` - Date of cancellation
- `{{total_amount}}` - Refund amount

**Design Notes:**
- Red theme indicates cancellation/alert
- Refund box uses green to reassure customer
- Provides clear next steps and timeline

---

## 🎯 Template Variables Reference

### Common Variables (Available in Most Templates)
| Variable | Description | Example |
|----------|-------------|---------|
| `{{order_id}}` | Unique order identifier | `#12345` |
| `{{customer_name}}` | Customer's first name | `John` |
| `{{total_amount}}` | Order total | `4000` |
| `{{status}}` | Current order status | `Paid`, `Shipped` |

### Template-Specific Variables
| Template | Variable | Description |
|----------|----------|-------------|
| ORDER_CREATED | `{{order_date}}` | Date order was placed |
| PAYMENT_RECEIVED | `{{payment_date}}` | Date payment processed |
| ORDER_SHIPPED | `{{tracking_number}}` | Shipping tracking code |
| ORDER_SHIPPED | `{{estimated_delivery}}` | Expected delivery date |
| ORDER_DELIVERED | `{{delivery_date}}` | Actual delivery date |
| ORDER_CANCELED | `{{cancellation_date}}` | Date of cancellation |

---

## 📱 Mobile Responsiveness

All templates include responsive design with:

```css
@media only screen and (max-width: 600px) {
    .container { margin: 0; border-radius: 0; }
    .header, .content, .footer { padding: 20px; }
    .title { font-size: 24px; }
}
```

**Mobile Optimizations:**
- Reduced padding for smaller screens
- Adjusted font sizes for readability
- Full-width containers on mobile
- Touch-friendly button sizes

---

## 🚀 Installation

Run the SQL script to update all templates:

```sql
-- In Supabase SQL Editor
-- Run: EMAIL_TEMPLATES_PROFESSIONAL.sql
```

This will:
1. ✅ Update all 6 email templates
2. ✅ Use `ON CONFLICT` to safely update existing templates
3. ✅ Preserve template IDs and relationships
4. ✅ Display verification summary

---

## 🎨 Customization Guide

### Changing Colors

**Brand Colors:**
```css
/* Success/Green */
background: #10b981;

/* Primary/Blue */
background: #3b82f6;

/* Alert/Red */
background: #ef4444;

/* Purple Gradient (Welcome) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Updating Company Name

Find and replace in all templates:
```html
<h1 class="company-name">COMPANY</h1>
```

Replace `COMPANY` with your actual company name.

### Adding Logo

Replace the company name section with:
```html
<img src="https://your-domain.com/logo.png" alt="Company Logo" style="max-width: 200px;">
```

### Customizing CTAs

Update button links and text:
```html
<a href="https://your-domain.com/track" class="cta-button">Track Your Package</a>
```

---

## 🔧 Testing Templates

### Test in Supabase

```sql
-- View all templates
SELECT event_trigger, name, subject 
FROM email_templates 
ORDER BY event_trigger;

-- Test template rendering
SELECT 
    event_trigger,
    replace(
        replace(subject, '{{order_id}}', '12345'),
        '{{customer_name}}', 'John'
    ) as rendered_subject
FROM email_templates;
```

### Send Test Email

Use the Admin Panel:
1. Go to **Email System** → **Templates**
2. Select a template
3. Click **Send Test Email**
4. Enter test email address
5. Verify rendering on desktop and mobile

---

## 📊 Template Performance Tips

### Email Client Compatibility
- ✅ Gmail (Desktop & Mobile)
- ✅ Outlook (Desktop & Mobile)
- ✅ Apple Mail (macOS & iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail

### Best Practices
1. **Keep HTML inline styles** - Better email client support
2. **Avoid JavaScript** - Most clients block it
3. **Use web-safe fonts** - Arial, Helvetica, sans-serif
4. **Test on real devices** - Email rendering varies
5. **Keep file size under 100KB** - Faster loading

---

## 🎯 Trigger Mapping

| Database Event | Template Triggered | When It Fires |
|----------------|-------------------|---------------|
| `INSERT` on orders | ORDER_CREATED | New order placed |
| `INSERT` on orders (first order) | WELCOME_EMAIL | Customer's first order |
| `UPDATE` status → 'Paid' | PAYMENT_RECEIVED | Payment processed |
| `UPDATE` status → 'Shipped' | ORDER_SHIPPED | Order shipped |
| `UPDATE` status → 'Delivered' | ORDER_DELIVERED | Order delivered |
| `UPDATE` status → 'Cancelled' | ORDER_CANCELED | Order canceled |

---

## 🔐 Security Notes

- Templates are stored in `email_templates` table
- Variables are replaced server-side (safe from XSS)
- No user input is directly rendered in HTML
- All links should use HTTPS
- Consider adding unsubscribe links for marketing emails

---

## 📝 Maintenance

### Regular Updates
- Review templates quarterly for design trends
- Update contact information as needed
- Test on new email clients when released
- Monitor delivery rates and open rates

### Version Control
- Keep template versions in SQL migration files
- Document changes in commit messages
- Test thoroughly before deploying to production

---

## 🆘 Troubleshooting

### Template Not Sending
1. Check `email_logs` table for errors
2. Verify template is marked `is_active = true`
3. Check trigger function is attached to orders table
4. Verify webhook is configured correctly

### Variables Not Replacing
1. Check variable names match exactly (case-sensitive)
2. Verify context_data JSONB contains the values
3. Check edge function template rendering logic

### Mobile Display Issues
1. Test in real email clients (not just browser)
2. Verify media queries are included
3. Check inline styles are present
4. Use email testing tools (Litmus, Email on Acid)

---

## 📚 Additional Resources

- [Email Design Best Practices](https://www.campaignmonitor.com/resources/)
- [HTML Email Templates](https://github.com/leemunroe/responsive-html-email-template)
- [Email Client CSS Support](https://www.caniemail.com/)
- [Litmus Email Testing](https://www.litmus.com/)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
