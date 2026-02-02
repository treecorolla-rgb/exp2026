# 🚀 QUICK START - Email Templates Installation

## ⚡ 3-Minute Setup

### Step 1: Preview (30 seconds)
Open this file in your browser:
```
EMAIL_TEMPLATES_PREVIEW.html
```
You'll see all 6 templates rendered.

### Step 2: Install (1 minute)
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open file: `EMAIL_TEMPLATES_PROFESSIONAL.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click **Run**
7. ✅ Done!

### Step 3: Verify (30 seconds)
Run this query in Supabase:
```sql
SELECT event_trigger, name, is_active 
FROM email_templates 
ORDER BY event_trigger;
```

You should see 6 templates:
- ORDER_CREATED
- ORDER_DELIVERED
- ORDER_SHIPPED
- ORDER_CANCELED
- PAYMENT_RECEIVED
- WELCOME_EMAIL

### Step 4: Test (1 minute)
Place a test order in your app and check `email_logs` table:
```sql
SELECT * FROM email_logs 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📧 What You Get

✅ **6 Professional Email Templates**
- Order Confirmation
- Payment Receipt (matches your screenshot!)
- Welcome Email
- Shipping Notification
- Delivery Confirmation
- Cancellation Notice

✅ **Mobile Responsive**
- Perfect on desktop
- Perfect on mobile
- Works in all major email clients

✅ **Production Ready**
- No additional setup needed
- Works with your existing triggers
- Fully tested and verified

---

## 🎨 Optional Customization

### Change Company Name
Edit the SQL file before running:
```html
<!-- Find this line in each template -->
<h1 class="company-name">COMPANY</h1>

<!-- Change to -->
<h1 class="company-name">YOUR COMPANY NAME</h1>
```

### Add Your Logo
Replace company name with logo:
```html
<img src="https://yourdomain.com/logo.png" alt="Logo" style="max-width: 200px;">
```

### Update Support Email
Find and replace:
```
support@company.com
→
your-support@yourdomain.com
```

---

## 📚 Full Documentation

For detailed information, see:
- **EMAIL_TEMPLATES_README.md** - Complete overview
- **EMAIL_TEMPLATES_GUIDE.md** - Detailed documentation
- **EMAIL_TEMPLATES_VISUAL_GUIDE.md** - Quick reference

---

## ✅ That's It!

Your email templates are now installed and ready to use. They will automatically trigger based on order events.

**Questions?** Check the documentation files above.

---

## 🎯 Template Triggers

| Template | Triggers When |
|----------|---------------|
| ORDER_CREATED | New order placed |
| PAYMENT_RECEIVED | Payment processed |
| WELCOME_EMAIL | First-time customer |
| ORDER_SHIPPED | Status → 'Shipped' |
| ORDER_DELIVERED | Status → 'Delivered' |
| ORDER_CANCELED | Status → 'Cancelled' |

---

**Happy emailing! 📧**
