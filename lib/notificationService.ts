
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
