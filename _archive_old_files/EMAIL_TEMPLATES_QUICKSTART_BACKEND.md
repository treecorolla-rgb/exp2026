# 🚀 QUICK START - Email Templates for Your Backend System

## ⚡ 2-Minute Setup

### Step 1: Install Templates (1 minute)
1. Open **Supabase Dashboard** → **SQL Editor**
2. Run file: `UPDATE_EMAIL_TEMPLATES_COMPLETE.sql`
3. ✅ Done!

### Step 2: Edit in Admin Panel (1 minute)
1. Open your app → **Admin Panel**
2. Go to **Email System** → **Templates** tab
3. Click any template to edit
4. See live preview on the right
5. Click **Save Template**

---

## 📧 What You Get

### 7 Professional Templates
1. **Order Placed Confirmation** - ORDER_CREATED
2. **Payment Receipt** - PAYMENT_RECEIVED (matches your screenshot!)
3. **Welcome to Our Store** - WELCOME_EMAIL
4. **Order Shipped Notification** - ORDER_SHIPPED
5. **Order Delivered** - ORDER_DELIVERED
6. **Order Canceled** - ORDER_CANCELED
7. **Login OTP Code** - LOGIN_OTP

### Features
✅ **Editable in Admin Panel** - Use your existing template editor  
✅ **Variable Hints** - Shows available variables for each template  
✅ **Live Preview** - See changes in real-time  
✅ **Mobile Responsive** - Works on all devices  
✅ **Professional Design** - Modern, clean aesthetics  

---

## 🎯 How It Works

### Your Admin Panel
```
Email System Configuration
├─ Templates Tab        ← Edit templates here
│  ├─ Template List     ← Left sidebar
│  ├─ HTML Editor       ← Edit HTML
│  ├─ Live Preview      ← See result
│  └─ Save Button       ← Save changes
├─ Triggers Tab         ← Enable/disable triggers
└─ Server Config Tab    ← Email provider settings
```

### Template Structure
```sql
email_templates table:
- event_trigger: 'ORDER_CREATED'
- name: 'Order Placed Confirmation'
- subject: 'Thank you for your order #{{order_id}}'
- body_html: '<html>...</html>'
- description: 'Order confirmation email...'
- variables_help: '{{order_id}}, {{customer_name}}, ...'
- is_active: true
```

### Variables Available

**Global (all templates):**
- `{{store_name}}` - Your store name
- `{{support_email}}` - Support email
- `{{logo_url}}` - Logo URL
- `{{year}}` - Current year

**Order Templates:**
- `{{order_id}}` - Order number
- `{{customer_name}}` - Customer name
- `{{customer_email}}` - Customer email
- `{{total_amount}}` - Order total
- `{{order_date}}` - Order date
- `{{items_html}}` - Order items table
- `{{shipping_address}}` - Formatted address

**Shipping Templates:**
- `{{tracking_number}}` - Tracking code
- `{{carrier}}` - Shipping carrier
- `{{tracking_url}}` - Tracking link
- `{{estimated_delivery}}` - Delivery estimate

**Payment Templates:**
- `{{payment_method}}` - Payment method
- `{{payment_date}}` - Payment date
- `{{subtotal}}` - Subtotal amount
- `{{shipping_cost}}` - Shipping cost
- `{{discount}}` - Discount amount

---

## 🎨 Quick Customization

### 1. Update Company Name
In Admin Panel → Templates → Select any template:
```html
<!-- Find this -->
<h1 style="...">{{store_name}}</h1>

<!-- Replace with -->
<h1 style="...">YOUR COMPANY NAME</h1>
```

### 2. Change Colors
```css
/* Find and replace colors */
#10b981  →  #YOUR_GREEN
#3b82f6  →  #YOUR_BLUE
#667eea  →  #YOUR_PURPLE
#ef4444  →  #YOUR_RED
```

### 3. Add Logo
```html
<!-- Replace company name with -->
<img src="https://yourdomain.com/logo.png" 
     alt="Logo" 
     style="max-width: 200px; height: auto;">
```

---

## 📊 Template Triggers

| Template | Trigger | When It Fires |
|----------|---------|---------------|
| Order Placed Confirmation | ORDER_CREATED | New order placed |
| Payment Receipt | PAYMENT_RECEIVED | Payment confirmed |
| Welcome Email | WELCOME_EMAIL | First-time customer |
| Order Shipped | ORDER_SHIPPED | Status → 'Shipped' |
| Order Delivered | ORDER_DELIVERED | Status → 'Delivered' |
| Order Canceled | ORDER_CANCELED | Status → 'Cancelled' |
| Login OTP | LOGIN_OTP | Login code requested |

---

## ✅ Verification

### Check Templates Installed
```sql
SELECT event_trigger, name, is_active 
FROM email_templates 
ORDER BY event_trigger;
```

Should return 7 templates.

### Check in Admin Panel
1. Login to Admin
2. Email System → Templates
3. Should see 7 templates in left sidebar
4. Click each to verify content

### Test Email
1. Place a test order
2. Check `email_logs` table
3. Verify email was sent
4. Check inbox for email

---

## 🔧 Integration Notes

### Your Order Structure (from types.ts)
```typescript
Order {
  id: string;              // "#ORD-123456"
  customerName: string;    // "John Doe"
  customerEmail: string;   // "john@example.com"
  orderDate: string;       // "02--02--2026 16:45:00"
  grandTotal: number;      // 4000
  items: Array<{
    productId: string;
    name: string;
    packageName: string;
    quantity: number;
    price: number;
  }>;
  shipAddress: string;
  shipCity: string;
  shipState: string;
  // ... etc
}
```

### Variable Replacement (Edge Function)
Your edge function should replace variables like:
```typescript
const emailData = {
  order_id: order.id,
  customer_name: order.customerName,
  customer_email: order.customerEmail,
  total_amount: order.grandTotal.toString(),
  order_date: order.orderDate,
  store_name: 'Your Store',
  support_email: 'support@yourstore.com',
  // ... etc
};

// Replace in template
let emailBody = template.body_html;
Object.keys(emailData).forEach(key => {
  const regex = new RegExp(`{{${key}}}`, 'g');
  emailBody = emailBody.replace(regex, emailData[key]);
});
```

---

## 📱 Mobile Responsive

All templates automatically adapt to:
- ✅ Desktop email clients (Outlook, Thunderbird, etc.)
- ✅ Webmail (Gmail, Yahoo, etc.)
- ✅ Mobile apps (iOS Mail, Gmail app, etc.)

No additional configuration needed!

---

## 🎯 Next Steps

1. ✅ Run SQL script
2. ✅ Check Admin Panel
3. ✅ Edit templates to match your brand
4. ✅ Test with a real order
5. ✅ Verify emails look good on mobile

---

## 📚 Documentation

- **Full Guide:** `EMAIL_TEMPLATES_BACKEND_GUIDE.md`
- **SQL Script:** `UPDATE_EMAIL_TEMPLATES_COMPLETE.sql`
- **System Status:** `EMAIL_SYSTEM_FINAL_STATUS.md`

---

## 🆘 Need Help?

### Templates not showing?
- Check SQL script ran successfully
- Verify `email_templates` table exists
- Check `is_active = true` for templates

### Variables not replacing?
- Check edge function has replacement logic
- Verify variable names match exactly
- Check data is being passed correctly

### Preview not working?
- Check HTML is valid
- Verify inline styles are used
- Test in browser dev tools

---

**You're all set! 🎉**

Your email templates are ready to use with your existing Admin Panel template editor.
