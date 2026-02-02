# 📧 Email Templates - Backend Integration Guide

## ✅ What This Is

Professional, responsive email templates that integrate **directly with your existing Admin Panel** template editor.

---

## 🎯 Your Current System

Based on your screenshot and code, you have:

### Admin Panel Email System
- **Location:** Admin Dashboard → Email System → Templates tab
- **Features:**
  - ✅ Template list (left sidebar)
  - ✅ Live HTML editor
  - ✅ Live preview pane
  - ✅ Variable hints display
  - ✅ Save button
  
### Database Structure
```sql
email_templates table:
- id (uuid)
- event_trigger (text) - e.g., 'ORDER_CREATED'
- name (text) - Display name
- subject (text) - Email subject with variables
- body_html (text) - HTML content
- description (text) - Template description
- variables_help (text) - Comma-separated variable list
- is_active (boolean) - Enable/disable toggle
```

### Order Structure (from types.ts)
Your orders contain:
- `id` - Order ID (e.g., "#ORD-123456")
- `customerName` - Full name
- `customerEmail` - Email address
- `orderDate` - Timestamp
- `total` / `grandTotal` - Total amount
- `items[]` - Array of order items
- `shipAddress`, `shipCity`, `shipState`, etc.
- `paymentMethod`, `cardType`, etc.
- `status` - Order status
- `trackingNumber`, `carrier` - Shipping info

---

## 🚀 Installation

### Step 1: Run the SQL Script

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open file: `UPDATE_EMAIL_TEMPLATES_COMPLETE.sql`
4. Click **Run**

This will:
- ✅ Add `description` and `variables_help` columns (if missing)
- ✅ Update all 7 email templates
- ✅ Preserve existing template IDs
- ✅ Keep templates active

### Step 2: Verify in Admin Panel

1. Open your app
2. Login to Admin Panel
3. Go to **Email System** → **Templates** tab
4. You should see 7 templates:
   - Order Placed Confirmation
   - Payment Receipt
   - Welcome to Our Store
   - Order Shipped Notification
   - Order Delivered
   - Order Canceled
   - Login OTP Code

### Step 3: Customize (Optional)

Click any template to edit:
- Update `{{store_name}}` placeholders
- Modify colors/styling
- Adjust text content
- See live preview on the right

---

## 📧 Templates Included

### 1. ORDER_CREATED
**Trigger:** `ORDER_CREATED`  
**When:** New order placed  
**Variables:**
```
{{order_id}}
{{customer_name}}
{{order_date}}
{{total_amount}}
{{items_html}}
{{shipping_address}}
{{store_name}}
```

### 2. PAYMENT_RECEIVED
**Trigger:** `PAYMENT_RECEIVED`  
**When:** Payment confirmed  
**Variables:**
```
{{order_id}}
{{customer_name}}
{{customer_email}}
{{payment_method}}
{{payment_date}}
{{subtotal}}
{{shipping_cost}}
{{discount}}
{{total_amount}}
{{store_name}}
```

### 3. WELCOME_EMAIL
**Trigger:** `WELCOME_EMAIL`  
**When:** First-time customer  
**Variables:**
```
{{customer_name}}
{{store_name}}
{{support_email}}
```

### 4. ORDER_SHIPPED
**Trigger:** `ORDER_SHIPPED`  
**When:** Order status → 'Shipped'  
**Variables:**
```
{{order_id}}
{{tracking_number}}
{{carrier}}
{{estimated_delivery}}
{{tracking_url}}
{{store_name}}
{{support_email}}
```

### 5. ORDER_DELIVERED
**Trigger:** `ORDER_DELIVERED`  
**When:** Order status → 'Delivered'  
**Variables:**
```
{{order_id}}
{{customer_name}}
{{delivery_date}}
{{store_name}}
```

### 6. ORDER_CANCELED
**Trigger:** `ORDER_CANCELED`  
**When:** Order status → 'Cancelled'  
**Variables:**
```
{{order_id}}
{{customer_name}}
{{cancellation_date}}
{{total_amount}}
{{store_name}}
{{support_email}}
```

### 7. LOGIN_OTP
**Trigger:** `LOGIN_OTP`  
**When:** User requests login code  
**Variables:**
```
{{otp_code}}
{{store_name}}
{{support_email}}
```

---

## 🎨 How to Edit Templates

### In Admin Panel

1. **Select Template:** Click template name in left sidebar
2. **Edit Subject:** Modify subject line (supports variables)
3. **Edit HTML:** Modify HTML in left editor pane
4. **See Preview:** Right pane shows live preview
5. **Save:** Click "Save Template" button

### Variable Hints

The "Available Variables" section shows:
- **Global Variables:** Work in all templates
  - `{{logo_url}}`
  - `{{store_name}}`
  - `{{support_email}}`
  - `{{year}}`
  
- **Template Variables:** Specific to each template
  - Shown in purple boxes
  - Listed in `variables_help` field

### Example Edit

To change company name:
1. Select any template
2. Find: `<h1 style="...">{{store_name}}</h1>`
3. Replace with: `<h1 style="...">YOUR COMPANY</h1>`
4. Or keep `{{store_name}}` and set it dynamically in your edge function

---

## 🔧 Integration with Your System

### Edge Function Integration

Your edge function needs to replace variables. Example:

```typescript
// In your edge function (dynamic-endpoint)
const replaceVariables = (template: string, data: any) => {
  let result = template;
  
  // Replace all variables
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });
  
  return result;
};

// When sending email
const emailData = {
  order_id: order.id,
  customer_name: order.customerName,
  customer_email: order.customerEmail,
  total_amount: order.grandTotal,
  order_date: order.orderDate,
  store_name: 'Your Store Name',
  support_email: 'support@yourstore.com',
  // ... other variables
};

const emailBody = replaceVariables(template.body_html, emailData);
const emailSubject = replaceVariables(template.subject, emailData);
```

### Items HTML Generation

For `{{items_html}}` in ORDER_CREATED template:

```typescript
const generateItemsHtml = (items: any[]) => {
  return items.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px;">${item.name}</td>
      <td align="center" style="padding: 8px;">${item.quantity}</td>
      <td align="right" style="padding: 8px;">$${item.price}</td>
    </tr>
  `).join('');
};

// Then include in emailData
emailData.items_html = generateItemsHtml(order.items);
```

### Shipping Address Formatting

For `{{shipping_address}}`:

```typescript
const formatShippingAddress = (order: Order) => {
  return `
    ${order.shipFirstName} ${order.shipLastName}<br/>
    ${order.shipAddress}<br/>
    ${order.shipCity}, ${order.shipState} ${order.shipZip}<br/>
    ${order.shipCountry}
  `;
};

emailData.shipping_address = formatShippingAddress(order);
```

---

## 📱 Mobile Responsiveness

All templates use **inline styles** for maximum email client compatibility.

### Responsive Features
- ✅ Max-width: 600px containers
- ✅ Flexible padding
- ✅ Readable font sizes
- ✅ Touch-friendly buttons
- ✅ Works in Gmail, Outlook, Apple Mail, etc.

### Testing
1. Send test email to yourself
2. Check on desktop email client
3. Check on mobile device
4. Verify all variables replaced correctly

---

## 🎯 Customization Examples

### Change Primary Color

Find and replace in template HTML:
```css
/* Green (#10b981) → Your Brand Color */
background: #10b981;  →  background: #YOUR_COLOR;
color: #10b981;       →  color: #YOUR_COLOR;
```

### Add Logo

Replace store name with logo:
```html
<!-- Before -->
<h1 style="...">{{store_name}}</h1>

<!-- After -->
<img src="{{logo_url}}" alt="Logo" style="max-width: 200px; height: auto;">
```

Then in edge function:
```typescript
emailData.logo_url = 'https://yourdomain.com/logo.png';
```

### Customize Footer

Find footer section:
```html
<div style="background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 14px;">
    <!-- Edit this text -->
    We appreciate your business.
</div>
```

---

## ✅ Checklist

- [ ] Run `UPDATE_EMAIL_TEMPLATES_COMPLETE.sql` in Supabase
- [ ] Verify templates appear in Admin Panel
- [ ] Test editing a template
- [ ] Check live preview works
- [ ] Update `{{store_name}}` placeholders
- [ ] Update `{{support_email}}` placeholders
- [ ] Test sending an email
- [ ] Verify variables are replaced correctly
- [ ] Test on mobile device
- [ ] Test in different email clients

---

## 🔍 Troubleshooting

### Templates Not Showing in Admin Panel

**Check:**
1. SQL script ran successfully
2. `email_templates` table exists
3. Templates have `is_active = true`
4. Frontend is fetching from correct table

**Fix:**
```sql
-- Verify templates exist
SELECT event_trigger, name, is_active 
FROM email_templates 
ORDER BY event_trigger;
```

### Variables Not Replacing

**Check:**
1. Edge function has variable replacement logic
2. Variable names match exactly (case-sensitive)
3. Data is being passed to replacement function

**Debug:**
```typescript
console.log('Template:', template.body_html);
console.log('Data:', emailData);
console.log('Result:', emailBody);
```

### Preview Not Showing

**Check:**
1. HTML is valid
2. No unclosed tags
3. Inline styles are used (not external CSS)

**Fix:** Use browser dev tools to inspect preview iframe

---

## 📚 Additional Resources

- **Admin Panel:** Your template editor UI
- **Email System Docs:** `EMAIL_SYSTEM_FINAL_STATUS.md`
- **Order Structure:** `types.ts` (Order interface)
- **Edge Function:** `dynamic-endpoint` function

---

## 🎉 You're Done!

Your email templates are now:
- ✅ Installed in database
- ✅ Editable via Admin Panel
- ✅ Responsive for mobile
- ✅ Professional design
- ✅ Ready to use

**Next:** Edit templates in Admin Panel to match your brand!
