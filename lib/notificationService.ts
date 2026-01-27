
import { CARRIERS } from '../constants';
import { Order, OrderStatus, NotificationLog } from '../types';

/**
 * Notification Service
 * Handles the logic for generating tracking URLs, managing retry queues,
 * and dispatching notifications via different channels (simulated).
 */

const MAX_RETRIES = 3;

// --- DYNAMIC URL GENERATOR ---
export const generateTrackingUrl = (carrier: string, trackingNumber: string): string => {
  const pattern = CARRIERS[carrier];
  if (!pattern) return '#';
  return pattern.replace('{TRACKING_NUMBER}', trackingNumber);
};

// --- SIMULATED PROVIDERS ---

// Simulated Email Provider (e.g., SendGrid/AWS SES)
const sendEmail = async (to: string, subject: string, htmlBody: string): Promise<boolean> => {
  console.log(`[EMAIL SERVICE] Sending to ${to}: ${subject}`);
  // Simulate API latency and random failure (95% success rate)
  await new Promise(r => setTimeout(r, 800));
  if (Math.random() > 0.95) throw new Error("SMTP Connection Timeout");
  return true;
};

// Simulated SMS Provider (e.g., Twilio)
const sendSMS = async (to: string, message: string): Promise<boolean> => {
  console.log(`[SMS SERVICE] Sending to ${to}: ${message}`);
  // Simulate API latency
  await new Promise(r => setTimeout(r, 500));
  return true;
};

// Simulated WhatsApp Provider (e.g., Meta/Twilio WhatsApp API)
const sendWhatsApp = async (to: string, template: string, vars: any): Promise<boolean> => {
  console.log(`[WHATSAPP SERVICE] Sending to ${to} using template ${template}`, vars);
  // Simulate API latency
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
      await new Promise(r => setTimeout(r, 1000 * (MAX_RETRIES - retries + 1))); // Exponentialish backoff
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
  const email = order.details?.email || 'customer@example.com';
  const phone = order.details?.phone || '555-0000';

  // 1. PENDING / PAID -> Email Confirmation
  if (newStatus === 'Pending' || newStatus === 'Paid') {
    const success = await withRetry(() => sendEmail(
      email, 
      `Order Confirmation ${order.id}`, 
      `<h1>Thank you for your order!</h1><p>Status: ${newStatus}</p>`
    ));
    
    logCallback({
      id: `log_${Date.now()}_email`,
      orderId: order.id,
      channel: 'Email',
      type: 'Confirmation',
      recipient: email,
      status: success ? 'Sent' : 'Failed',
      timestamp,
      details: `Status update: ${newStatus}`
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

    // Send SMS
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

    // Send Email
    const emailSuccess = await withRetry(() => sendEmail(
      email, 
      `Order Shipped! ${order.id}`, 
      `<h1>Good News!</h1><p>${msg}</p><a href="${trackingLink}" style="padding:10px;background:blue;color:white;">Track My Order</a>`
    ));
    logCallback({
      id: `log_${Date.now()}_email_ship`,
      orderId: order.id,
      channel: 'Email',
      type: 'Shipped',
      recipient: email,
      status: emailSuccess ? 'Sent' : 'Failed',
      timestamp,
      details: `HTML Template sent with Tracking Button`
    });
  }

  // 3. DELIVERED -> WhatsApp Confirmation
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
