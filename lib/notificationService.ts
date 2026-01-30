
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

// --- REAL EMAIL TRIGGER ---
const triggerRealEmail = async (
  recipientEmail: string,
  recipientName: string,
  templateId: string,
  contextData: any
): Promise<boolean> => {
  if (!supabase) {
    console.error('[EMAIL SERVICE] Supabase client not initialized. Cannot send real email.');
    return false;
  }

  console.log(`[EMAIL SERVICE] Triggering email for ${recipientEmail} (Template: ${templateId})`);

  try {
    const { error } = await supabase.from('email_logs').insert({
      status: 'PENDING',
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      template_id: templateId, // Must match an ID in 'email_templates' table
      context_data: contextData
    });

    if (error) {
      console.error('[EMAIL SERVICE] Failed to insert email log:', error);
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
  // Triggered when order is placed
  if (newStatus === 'Pending') {
    const success = await triggerRealEmail(
      email,
      name,
      'order_confirmation', // Ensure this ID exists in your 'email_templates' table
      {
        order_id: order.id,
        total_amount: order.grandTotal?.toFixed(2),
        customer_name: name,
        items_html: (order.items || []).map(i => `<li>${i.name} x ${i.quantity}</li>`).join('')
      }
    );

    logCallback({
      id: `log_${Date.now()}_email`,
      orderId: order.id,
      channel: 'Email',
      type: 'Confirmation',
      recipient: email,
      status: success ? 'Sent' : 'Failed', // 'Sent' means successfully queued in DB
      timestamp,
      details: `Queued via Supabase (Template: order_confirmation)`
    });
  }

  // 2. SHIPPED -> SMS & Email with Tracking
  if (newStatus === 'Shipped') {
    if (!order.trackingNumber || !order.carrier) {
      console.warn("[NOTIFICATION] Skipping Shipped notification: Missing tracking info.");
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
      'order_shipped', // Ensure this ID exists in 'email_templates'
      {
        order_id: order.id,
        tracking_number: order.trackingNumber,
        carrier: order.carrier,
        tracking_link: trackingLink,
        customer_name: name
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
      details: `Queued via Supabase (Template: order_shipped)`
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
