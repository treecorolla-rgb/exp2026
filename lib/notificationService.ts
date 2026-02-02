
// --- SUPABASE CLIENT IMPORT ---
import { supabase } from './supabaseClient';
import { CARRIERS } from '../constants';
import { Order, OrderStatus, NotificationLog } from '../types';

/**
 * Notification Service
 * Handles the logic for generating tracking URLs and triggers REAL emails via Supabase Edge Functions.
 * 
 * ARCHITECTURE:
 * 1. App inserts row into 'email_logs' with status 'PENDING'
 * 2. Supabase Webhook triggers 'send-email' Edge Function
 * 3. Edge Function calls Resend API -> Updates 'email_logs' to 'SENT' or 'FAILED'
 */

const MAX_RETRIES = 3;

// --- DYNAMIC URL GENERATOR ---
export const generateTrackingUrl = (carrier: string, trackingNumber: string): string => {
  const pattern = CARRIERS[carrier];
  if (!pattern) return '#';
  return pattern.replace('{TRACKING_NUMBER}', trackingNumber);
};

// --- REAL EMAIL TRIGGER COMPATIBILITY NOTE ---
// Since we have a Database Trigger (on_order_email_v2) that automatically 
// inserts into 'email_logs' on ORDER INSERT/UPDATE, we should NOT 
// insert from the client side for standard events to avoid duplicate emails.
//
// This function is kept for custom events NOT handled by DB triggers, 
// or if we disable DB triggers in the future.

const triggerRealEmail = async (
  recipientEmail: string,
  recipientName: string,
  eventTrigger: string,
  contextData: any
): Promise<boolean> => {
  // DB Trigger handles these now. Preventing client-side duplicate.
  if (['ORDER_CREATED', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'PAYMENT_RECEIVED'].includes(eventTrigger)) {
    console.log(`[EMAIL SERVICE] Skipping client-side trigger for ${eventTrigger} (Handled by DB Trigger)`);
    return true;
  }

  if (!supabase) {
    console.error('[EMAIL SERVICE] Supabase client not initialized. Cannot send real email.');
    return false;
  }

  console.log(`[EMAIL SERVICE] Triggering email for ${recipientEmail} (Event: ${eventTrigger})`);

  try {
    // 1. Fetch Template ID first (UUID)
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('id')
      .eq('event_trigger', eventTrigger)
      .single();

    if (templateError || !template) {
      console.warn(`[EMAIL SERVICE] Template not found for trigger '${eventTrigger}'.`);
      return false;
    }

    // 2. Insert into Logs
    const { error: insertError } = await supabase.from('email_logs').insert({
      status: 'PENDING',
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      template_id: template.id,
      context_data: contextData
    });

    if (insertError) {
      console.error('[EMAIL SERVICE] Failed to insert email log:', insertError);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[EMAIL SERVICE] Unexpected error:', err);
    return false;
  }
};

// --- SIMULATED SMS/WHATSAPP (Keep simulated for now unless Gateway is added) ---
const sendSMS = async (to: string, message: string): Promise<boolean> => {
  console.log(`[SMS SERVICE] Sending to ${to}: ${message}`);
  await new Promise(r => setTimeout(r, 500));
  return true;
};

const sendWhatsApp = async (to: string, template: string, vars: any): Promise<boolean> => {
  console.log(`[WHATSAPP SERVICE] Sending to ${to} using template ${template}`, vars);
  await new Promise(r => setTimeout(r, 600));
  return true;
};

// --- RETRY LOGIC WRAPPER ---
const withRetry = async (fn: () => Promise<boolean>, retries = MAX_RETRIES): Promise<boolean> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(`[NOTIFICATION] Failed. Retrying... (${retries} attempts left)`);
      await new Promise(r => setTimeout(r, 1000 * (MAX_RETRIES - retries + 1)));
      return withRetry(fn, retries - 1);
    }
    console.error("[NOTIFICATION] Max retries reached. Failed.");
    return false;
  }
};

// --- WORKFLOW CONTROLLER ---

export const handleOrderNotification = async (
  order: Order,
  newStatus: OrderStatus,
  logCallback: (log: NotificationLog) => void
) => {
  const timestamp = new Date().toLocaleString();
  const email = order.details?.email || order.customerEmail || 'customer@example.com';
  const phone = order.details?.phone || order.customerPhone || '555-0000';
  const name = order.customerName || 'Valued Customer';

  // 1. PENDING (New Order Confirmation)
  if (newStatus === 'Pending') {
    // Send customer confirmation email
    const success = await triggerRealEmail(
      email,
      name,
      'ORDER_CREATED', // Matches 'event_trigger' in SQL
      {
        order_id: order.id,
        total_amount: order.grandTotal?.toFixed(2),
        customer_name: name,
        shipping_address: order.shipAddress || 'Address on file',
        items_html: (order.items || []).map(i => `<li>${i.name} x ${i.quantity}</li>`).join('')
      }
    );

    logCallback({
      id: `log_${Date.now()}_email`,
      orderId: order.id,
      channel: 'Email',
      type: 'Confirmation',
      recipient: email,
      status: success ? 'Sent' : 'Failed',
      timestamp,
      details: `Queued via Supabase (Template: ORDER_CREATED)`
    });

    // 2. SEND ADMIN NOTIFICATION (NEW!)
    await sendAdminNotification(order, logCallback);
  }

  // 2. SHIPPED -> SMS & Email with Tracking
  if (newStatus === 'Shipped') {
    if (!order.trackingNumber || !order.carrier) {
      return;
    }

    const trackingLink = order.trackingUrl || generateTrackingUrl(order.carrier, order.trackingNumber);
    const msg = `Your order ${order.id} has been shipped via ${order.carrier}. Track here: ${trackingLink}`;

    // Send SMS (Simulated)
    const smsSuccess = await withRetry(() => sendSMS(phone, msg));
    logCallback({
      id: `log_${Date.now()}_sms`,
      orderId: order.id,
      channel: 'SMS',
      type: 'Shipped',
      recipient: phone,
      status: smsSuccess ? 'Sent' : 'Failed',
      timestamp,
      details: `Carrier: ${order.carrier}, Track: ${order.trackingNumber}`
    });

    // Send Email (Real)
    const emailSuccess = await triggerRealEmail(
      email,
      name,
      'ORDER_SHIPPED', // Matches 'event_trigger' in SQL
      {
        order_id: order.id,
        tracking_number: order.trackingNumber,
        carrier: order.carrier,
        tracking_link: trackingLink,
        customer_name: name,
        courier_name: order.carrier,
        estimated_delivery_date: '3-5 Business Days'
      }
    );

    logCallback({
      id: `log_${Date.now()}_email_ship`,
      orderId: order.id,
      channel: 'Email',
      type: 'Shipped',
      recipient: email,
      status: emailSuccess ? 'Sent' : 'Failed',
      timestamp,
      details: `Queued via Supabase (Template: ORDER_SHIPPED)`
    });
  }

  // 3. DELIVERED -> WhatsApp Confirmation (Simulated)
  if (newStatus === 'Delivered') {
    const waSuccess = await withRetry(() => sendWhatsApp(
      phone,
      'delivery_confirmation_v1',
      { orderId: order.id, customerName: order.customerName }
    ));

    logCallback({
      id: `log_${Date.now()}_wa`,
      orderId: order.id,
      channel: 'WhatsApp',
      type: 'Delivered',
      recipient: phone,
      status: waSuccess ? 'Sent' : 'Failed',
      timestamp,
      details: `Template: delivery_confirmation_v1`
    });
  }
};

// --- ADMIN NOTIFICATION FUNCTION (NEW!) ---
const sendAdminNotification = async (
  order: Order,
  logCallback: (log: NotificationLog) => void
) => {
  const timestamp = new Date().toLocaleString();

  // Fetch admin profile from Supabase
  if (!supabase) {
    console.warn('[ADMIN NOTIFICATION] Supabase not initialized');
    return;
  }

  try {
    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !settings) {
      console.warn('[ADMIN NOTIFICATION] Admin settings not found:', error);
      return;
    }

    const adminEmail = settings.email || settings.support_email;
    const telegramBotToken = settings.telegram_bot_token;
    const telegramChatId = settings.telegram_chat_id;
    const receiveEmail = settings.receive_email_notifications;
    const receiveTelegram = settings.receive_telegram_notifications;

    // Prepare order details
    const itemsList = (order.items || []).map(i =>
      `- ${i.name} (${i.packageName || 'Std'}) x ${i.quantity}: $${(i.price * i.quantity).toFixed(2)}`
    ).join('\n');

    // 1. Send Telegram Notification
    if (receiveTelegram && telegramBotToken && telegramChatId && telegramBotToken !== 'YOUR_BOT_TOKEN_HERE') {
      const telegramMessage = `
🛒 *NEW ORDER RECEIVED!*
------------------------
*Order ID:* ${order.id}
*Customer:* ${order.customerName}
*Phone:* ${order.customerPhone || order.details?.phone || 'N/A'}
*Email:* ${order.customerEmail || order.details?.email || 'N/A'}

*Shipping Address:*
${order.shipAddress || 'N/A'}
${order.shipCity}, ${order.shipState} ${order.shipZip}
${order.shipCountry}

*Order Details:*
${itemsList}

*Payment Method:* ${order.paymentMethod || 'N/A'}
*Subtotal:* $${order.totalAmount?.toFixed(2) || '0.00'}
*Shipping:* $${order.shippingCost?.toFixed(2) || '0.00'}
*Discount:* -$${order.discount?.toFixed(2) || '0.00'}
*TOTAL:* $${order.grandTotal?.toFixed(2) || '0.00'}
------------------------
      `.trim();

      try {
        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramMessage,
            parse_mode: 'Markdown'
          }),
        });

        const success = response.ok;
        logCallback({
          id: `log_${Date.now()}_admin_telegram`,
          orderId: order.id,
          channel: 'SMS', // Using SMS channel for Telegram
          type: 'Confirmation',
          recipient: `Admin (Telegram: ${telegramChatId})`,
          status: success ? 'Sent' : 'Failed',
          timestamp,
          details: 'Admin Telegram notification'
        });

        console.log('[ADMIN NOTIFICATION] Telegram sent:', success);
      } catch (err) {
        console.error('[ADMIN NOTIFICATION] Telegram failed:', err);
      }
    }

    // 2. Send Email Notification to Admin
    if (receiveEmail && adminEmail) {
      // Create admin notification email template
      const adminEmailSuccess = await triggerRealEmail(
        adminEmail,
        'Admin',
        'ORDER_CREATED', // Reuse ORDER_CREATED template or create ADMIN_ORDER_NOTIFICATION
        {
          order_id: order.id,
          customer_name: order.customerName,
          customer_email: order.customerEmail || order.details?.email || 'N/A',
          customer_phone: order.customerPhone || order.details?.phone || 'N/A',
          total_amount: order.grandTotal?.toFixed(2),
          order_date: order.orderDate || new Date().toLocaleString(),
          shipping_address: `${order.shipAddress}, ${order.shipCity}, ${order.shipState} ${order.shipZip}, ${order.shipCountry}`,
          items_html: (order.items || []).map(i =>
            `<tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px;">${i.name} (${i.packageName || 'Std'})</td>
              <td align="center" style="padding: 8px;">${i.quantity}</td>
              <td align="right" style="padding: 8px;">$${(i.price * i.quantity).toFixed(2)}</td>
            </tr>`
          ).join(''),
          payment_method: order.paymentMethod || 'N/A',
          subtotal: order.totalAmount?.toFixed(2) || '0.00',
          shipping_cost: order.shippingCost?.toFixed(2) || '0.00',
          discount: order.discount?.toFixed(2) || '0.00'
        }
      );

      logCallback({
        id: `log_${Date.now()}_admin_email`,
        orderId: order.id,
        channel: 'Email',
        type: 'Confirmation',
        recipient: `Admin (${adminEmail})`,
        status: adminEmailSuccess ? 'Sent' : 'Failed',
        timestamp,
        details: 'Admin email notification'
      });

      console.log('[ADMIN NOTIFICATION] Email queued:', adminEmailSuccess);
    }

  } catch (err) {
    console.error('[ADMIN NOTIFICATION] Error:', err);
  }
};
