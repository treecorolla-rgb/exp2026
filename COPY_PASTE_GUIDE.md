# 🎯 COPY & PASTE GUIDE - Email Templates

## ✅ What You Have Now

**7 separate HTML files** in the `templates/` folder - one for each email trigger!

```
📁 templates/
   ├── ORDER_CREATED.html       ✅ Ready to copy
   ├── PAYMENT_RECEIVED.html    ✅ Ready to copy
   ├── WELCOME_EMAIL.html       ✅ Ready to copy
   ├── ORDER_SHIPPED.html       ✅ Ready to copy
   ├── ORDER_DELIVERED.html     ✅ Ready to copy
   ├── ORDER_CANCELED.html      ✅ Ready to copy
   └── LOGIN_OTP.html           ✅ Ready to copy
```

---

## 🚀 Step-by-Step Instructions

### Example: Updating ORDER_CREATED Template

#### Step 1: Open the HTML File
```
📂 Navigate to: templates/ORDER_CREATED.html
🖱️ Double-click to open in your code editor (VS Code, etc.)
```

#### Step 2: Select All HTML
```
⌨️ Press: Ctrl+A (Windows) or Cmd+A (Mac)
📋 Press: Ctrl+C (Windows) or Cmd+C (Mac)
```

#### Step 3: Open Admin Panel
```
🌐 Open your app in browser
🔐 Login to Admin Panel
📧 Click: Email System
📝 Click: Templates tab
```

#### Step 4: Select Template
```
👈 Left Sidebar: Click "Order Placed Confirmation"
```

You'll see this layout:
```
┌─────────────────────────────────────────────────────────┐
│ Email Subject                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Thank you for your order #{{order_id}}              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Available Variables                                     │
│ {{order_id}} {{customer_name}} {{total_amount}} ...    │
│                                                         │
│ ┌──────────────────────┬──────────────────────────────┐ │
│ │ HTML Source          │ Live Preview                 │ │
│ │                      │                              │ │
│ │ <div style="...">    │ [Preview of email]           │ │
│ │   ...                │                              │ │
│ │ </div>               │                              │ │
│ │                      │                              │ │
│ └──────────────────────┴──────────────────────────────┘ │
│                                                         │
│ [💾 Save Template]                                      │
└─────────────────────────────────────────────────────────┘
```

#### Step 5: Paste HTML
```
🖱️ Click in the "HTML Source" pane (left side)
⌨️ Press: Ctrl+A (select all existing code)
⌨️ Press: Ctrl+V (paste new code)
👀 Check: Live Preview pane updates (right side)
```

#### Step 6: Save
```
🖱️ Click: "Save Template" button
✅ Done!
```

---

## 📋 Complete Checklist

Copy and paste each file into its corresponding template:

### 1️⃣ ORDER_CREATED.html
- [ ] Open file: `templates/ORDER_CREATED.html`
- [ ] Copy all HTML (Ctrl+A, Ctrl+C)
- [ ] Admin Panel → Templates → "Order Placed Confirmation"
- [ ] Paste in HTML Source pane (Ctrl+V)
- [ ] Click "Save Template"

### 2️⃣ PAYMENT_RECEIVED.html
- [ ] Open file: `templates/PAYMENT_RECEIVED.html`
- [ ] Copy all HTML
- [ ] Admin Panel → Templates → "Payment Receipt"
- [ ] Paste in HTML Source pane
- [ ] Click "Save Template"

### 3️⃣ WELCOME_EMAIL.html
- [ ] Open file: `templates/WELCOME_EMAIL.html`
- [ ] Copy all HTML
- [ ] Admin Panel → Templates → "Welcome to Our Store"
- [ ] Paste in HTML Source pane
- [ ] Click "Save Template"

### 4️⃣ ORDER_SHIPPED.html
- [ ] Open file: `templates/ORDER_SHIPPED.html`
- [ ] Copy all HTML
- [ ] Admin Panel → Templates → "Order Shipped Notification"
- [ ] Paste in HTML Source pane
- [ ] Click "Save Template"

### 5️⃣ ORDER_DELIVERED.html
- [ ] Open file: `templates/ORDER_DELIVERED.html`
- [ ] Copy all HTML
- [ ] Admin Panel → Templates → "Order Delivered"
- [ ] Paste in HTML Source pane
- [ ] Click "Save Template"

### 6️⃣ ORDER_CANCELED.html
- [ ] Open file: `templates/ORDER_CANCELED.html`
- [ ] Copy all HTML
- [ ] Admin Panel → Templates → "Order Canceled"
- [ ] Paste in HTML Source pane
- [ ] Click "Save Template"

### 7️⃣ LOGIN_OTP.html
- [ ] Open file: `templates/LOGIN_OTP.html`
- [ ] Copy all HTML
- [ ] Admin Panel → Templates → "Login OTP Code"
- [ ] Paste in HTML Source pane
- [ ] Click "Save Template"

---

## 🎨 Quick Customizations

After pasting, you can edit directly in the Admin Panel:

### Change Company Name
1. Find: `COMPANY` (in the HTML Source pane)
2. Replace with: `Your Company Name`
3. Save

### Change Support Email
1. Find: `support@company.com`
2. Replace with: `your-email@domain.com`
3. Save

### Change Colors
1. Find color codes like: `#10b981` (green)
2. Replace with your brand color
3. Save

---

## 👀 Preview

As you paste each template, check the **Live Preview** pane on the right to see:
- ✅ How the email looks
- ✅ Layout and formatting
- ✅ Colors and styling
- ✅ Mobile responsiveness

---

## ⚡ Pro Tips

1. **Do One at a Time**: Update one template, save, then move to next
2. **Check Preview**: Always verify in Live Preview before saving
3. **Keep Backups**: The HTML files are your backup copies
4. **Test After**: Send a test email after updating all templates
5. **Mobile Check**: View test email on mobile device

---

## 🔧 Troubleshooting

### Preview Not Updating?
- Click in HTML Source pane
- Make a small edit (add a space)
- Preview should refresh

### Can't Find Template?
- Check you're on "Templates" tab (not "Triggers" or "Server Config")
- Template names in Admin Panel might be slightly different
- Look for matching trigger event (ORDER_CREATED, etc.)

### HTML Looks Wrong?
- Make sure you copied ALL the HTML (from `<!DOCTYPE html>` to `</html>`)
- Check for any missing closing tags
- Try copying again

---

## ✅ Verification

After updating all templates:

1. **Check Template List**: All 7 templates should show in left sidebar
2. **Check Preview**: Each template should show correctly in Live Preview
3. **Test Email**: Place a test order to verify emails send correctly
4. **Mobile Test**: Check email on mobile device

---

## 📚 Files Reference

| HTML File | Template Name in Admin Panel | Trigger |
|-----------|------------------------------|---------|
| ORDER_CREATED.html | Order Placed Confirmation | ORDER_CREATED |
| PAYMENT_RECEIVED.html | Payment Receipt | PAYMENT_RECEIVED |
| WELCOME_EMAIL.html | Welcome to Our Store | WELCOME_EMAIL |
| ORDER_SHIPPED.html | Order Shipped Notification | ORDER_SHIPPED |
| ORDER_DELIVERED.html | Order Delivered | ORDER_DELIVERED |
| ORDER_CANCELED.html | Order Canceled | ORDER_CANCELED |
| LOGIN_OTP.html | Login OTP Code | LOGIN_OTP |

---

**You're all set! Just copy & paste each file into your Admin Panel! 🎉**

Estimated time: **5-10 minutes** to update all 7 templates.
