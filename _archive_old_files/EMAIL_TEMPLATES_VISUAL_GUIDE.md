# 📧 Email Templates - Quick Visual Reference

## Template Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    EMAIL TEMPLATE SYSTEM                     │
│                         6 Templates                          │
└─────────────────────────────────────────────────────────────┘

1. ORDER_CREATED          ✅ Green Success Theme
   ├─ Icon: Green Checkmark
   ├─ Purpose: Order confirmation
   └─ CTA: None (informational)

2. PAYMENT_RECEIVED       ✅ Green Success Theme  
   ├─ Icon: Green Checkmark
   ├─ Purpose: Payment receipt (matches screenshot)
   ├─ Special: Invoice format with disclaimer
   └─ CTA: None (informational)

3. WELCOME_EMAIL          💜 Purple Gradient Theme
   ├─ Icon: Purple gradient header
   ├─ Purpose: Welcome new customers
   ├─ Special: Feature highlights
   └─ CTA: "Start Shopping"

4. ORDER_SHIPPED          📦 Blue Shipping Theme
   ├─ Icon: Blue package icon
   ├─ Purpose: Shipping notification
   ├─ Special: Tracking number + timeline
   └─ CTA: "Track Your Package"

5. ORDER_DELIVERED        🎉 Green Success Theme
   ├─ Icon: Green celebration icon
   ├─ Purpose: Delivery confirmation
   ├─ Special: Feedback request with stars
   └─ CTA: "Leave a Review"

6. ORDER_CANCELED         ❌ Red Alert Theme
   ├─ Icon: Red X icon
   ├─ Purpose: Cancellation notice
   ├─ Special: Refund information box
   └─ CTA: "Continue Shopping"
```

---

## Template Structure (All Templates)

```
┌───────────────────────────────────────────────┐
│                                               │
│              COMPANY (Header)                 │
│                                               │
├───────────────────────────────────────────────┤
│                                               │
│              [ICON - Colored Circle]          │
│                                               │
│              Main Title (28px)                │
│           Subtitle text (15px gray)           │
│                                               │
│  ┌─────────────────────────────────────┐     │
│  │                                     │     │
│  │     Content Section                 │     │
│  │     (Info boxes, details, etc.)     │     │
│  │                                     │     │
│  └─────────────────────────────────────┘     │
│                                               │
│         [CTA Button] (if applicable)          │
│                                               │
├───────────────────────────────────────────────┤
│                                               │
│        Footer Message (Gray background)       │
│                                               │
└───────────────────────────────────────────────┘
```

---

## Color Palette

```css
/* Primary Colors */
Success Green:  #10b981  /* ORDER_CREATED, PAYMENT_RECEIVED, ORDER_DELIVERED */
Primary Blue:   #3b82f6  /* ORDER_SHIPPED */
Alert Red:      #ef4444  /* ORDER_CANCELED */
Purple:         #667eea  /* WELCOME_EMAIL */

/* Neutral Colors */
Dark Text:      #1f2937
Gray Text:      #6b7280
Light Gray:     #e5e7eb
Background:     #f9fafb
White:          #ffffff

/* Gradients */
Purple Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Blue Gradient:   linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)
Green Gradient:  linear-gradient(135deg, #10b981 0%, #059669 100%)
```

---

## Responsive Breakpoints

```
Desktop (> 600px)
├─ Container: 600px max-width
├─ Padding: 40px
└─ Font sizes: Full size

Mobile (≤ 600px)
├─ Container: Full width
├─ Padding: 20px
└─ Font sizes: Reduced
```

---

## Template Comparison

| Template | Color | Icon | Special Feature | CTA |
|----------|-------|------|-----------------|-----|
| ORDER_CREATED | Green | ✓ | Order summary box | None |
| PAYMENT_RECEIVED | Green | ✓ | Invoice format + disclaimer | None |
| WELCOME_EMAIL | Purple | Gradient | Feature list with icons | Start Shopping |
| ORDER_SHIPPED | Blue | 📦 | Tracking number + timeline | Track Package |
| ORDER_DELIVERED | Green | 🎉 | Star rating + feedback | Leave Review |
| ORDER_CANCELED | Red | ✕ | Refund info box | Continue Shopping |

---

## Email Flow Diagram

```
┌─────────────────┐
│  Customer       │
│  Places Order   │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  1. ORDER_CREATED   │  ✅ Green - "Thank you for your order"
└────────┬────────────┘
         │
         ├─ First Time Customer?
         │  └─ YES ──▶ 3. WELCOME_EMAIL  💜 Purple - "Welcome to the family"
         │
         ▼
┌─────────────────────┐
│ 2. PAYMENT_RECEIVED │  ✅ Green - "Payment Confirmation"
└────────┬────────────┘  (Invoice format - matches screenshot)
         │
         ▼
┌─────────────────────┐
│  4. ORDER_SHIPPED   │  📦 Blue - "Your order is on its way"
└────────┬────────────┘  (Tracking number + timeline)
         │
         ▼
┌─────────────────────┐
│ 5. ORDER_DELIVERED  │  🎉 Green - "Your order has been delivered"
└─────────────────────┘  (Feedback request)

         OR

┌─────────────────────┐
│ 6. ORDER_CANCELED   │  ❌ Red - "Order has been canceled"
└─────────────────────┘  (Refund information)
```

---

## Key Features by Template

### 📧 ORDER_CREATED
```
✓ Order number prominently displayed
✓ Customer name
✓ Order date
✓ Order summary with total
✓ Status indicator
```

### 💳 PAYMENT_RECEIVED (Screenshot Match)
```
✓ Invoice number format
✓ Customer name + email
✓ Payment method display
✓ Payment date
✓ Amount breakdown (Order + Tax)
✓ Total amount in green
✓ Legal disclaimer box
```

### 👋 WELCOME_EMAIL
```
✓ Purple gradient header
✓ Personal greeting
✓ 3 feature highlights:
  - Exclusive Offers
  - Order Tracking
  - Fast Checkout
✓ "Start Shopping" CTA
✓ Support contact info
```

### 📦 ORDER_SHIPPED
```
✓ Blue package icon
✓ Tracking number (highlighted box)
✓ Estimated delivery date
✓ Visual timeline:
  ✅ Order Placed
  ✅ Shipped (current)
  ⚪ Out for Delivery
  ⚪ Delivered
✓ "Track Your Package" CTA
```

### 🎉 ORDER_DELIVERED
```
✓ Celebration icon
✓ Success message
✓ Delivery date
✓ Feedback section:
  - Star rating display
  - "Leave a Review" CTA
✓ Thank you message
```

### ❌ ORDER_CANCELED
```
✓ Red alert icon
✓ Cancellation confirmation
✓ Alert box (red border)
✓ Refund information box (green):
  - Refund amount
  - Processing time (5-7 days)
  - Payment method info
✓ "Continue Shopping" CTA
```

---

## Variable Replacement Examples

### ORDER_CREATED
```
Subject: Thank you for your order #12345
Body:
  - Order Number: #12345
  - Customer: John Doe
  - Order Date: February 2, 2026
  - Total: $4000
  - Status: Pending
```

### PAYMENT_RECEIVED
```
Subject: Payment Confirmation for Order #12345
Body:
  - Invoice #12345
  - Customer: John Doe (johndoe@gmail.com)
  - Payment method: Credit Card
  - Date of payment: 5th July 2022
  - Order Amount: $4000
  - Transaction Tax: $0
  - Total amount paid: $4000
```

### ORDER_SHIPPED
```
Subject: Your order #12345 is on its way!
Body:
  - Tracking Number: 1Z999AA10123456784
  - Order Number: #12345
  - Estimated Delivery: February 5, 2026
```

---

## Mobile Preview

```
┌─────────────────┐
│                 │  ← Full width on mobile
│    COMPANY      │
│                 │
├─────────────────┤
│                 │
│       ✓         │  ← Icon centered
│                 │
│  Thank you for  │  ← Title (24px on mobile)
│   your order    │
│                 │
│  We've received │  ← Subtitle
│   your order    │
│                 │
│  Order: #12345  │  ← Info section
│  Customer: John │
│                 │
│  ┌───────────┐  │  ← Summary box
│  │ Total:    │  │
│  │ $4000     │  │
│  └───────────┘  │
│                 │
├─────────────────┤
│  We appreciate  │  ← Footer
│  your business  │
└─────────────────┘
```

---

## Installation Checklist

- [ ] Run `EMAIL_TEMPLATES_PROFESSIONAL.sql` in Supabase
- [ ] Verify all 6 templates are created/updated
- [ ] Check `email_templates` table has correct data
- [ ] Update company name in templates
- [ ] Test each template with sample data
- [ ] Send test emails to verify rendering
- [ ] Test on mobile devices
- [ ] Test on different email clients (Gmail, Outlook, etc.)
- [ ] Verify trigger function uses correct template names
- [ ] Monitor `email_logs` for successful sends

---

## Quick Test Commands

```sql
-- View all templates
SELECT event_trigger, name, is_active 
FROM email_templates 
ORDER BY event_trigger;

-- Count templates
SELECT COUNT(*) as total_templates 
FROM email_templates;

-- Check which templates are active
SELECT event_trigger, is_active 
FROM email_templates 
WHERE is_active = true;

-- Preview subject lines
SELECT 
    event_trigger,
    subject
FROM email_templates
ORDER BY event_trigger;
```

---

**Quick Reference Card**

```
Template Triggers:
├─ ORDER_CREATED      → New order placed
├─ PAYMENT_RECEIVED   → Payment processed
├─ WELCOME_EMAIL      → First-time customer
├─ ORDER_SHIPPED      → Status = 'Shipped'
├─ ORDER_DELIVERED    → Status = 'Delivered'
└─ ORDER_CANCELED     → Status = 'Cancelled'

Color Coding:
├─ Green (✅)  → Success, Confirmation
├─ Blue (📦)   → Shipping, Transit
├─ Purple (💜) → Welcome, Onboarding
└─ Red (❌)    → Cancellation, Alert
```
