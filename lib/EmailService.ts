
import { supabase } from './supabaseClient';
import { Order } from '../types';

/**
 * EMAIL SERVICE
 * 
 * Logic:
 * 1. Fetch the raw HTML template from Supabase for a specific event (e.g. ORDER_CREATED).
 * 2. Replace {{variables}} with actual order data.
 * 3. Call the 'send-email' Edge Function to deliver it.
 */

// Helper to replace {{key}} with value
const replaceVariables = (template: string, variables: Record<string, string | number>) => {
    let result = template;
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, String(variables[key] || ''));
    });
    return result;
};

// Generic Send Function
const sendEmail = async (to: string, eventTrigger: string, context: Record<string, any>) => {
    try {
        console.log(`[EmailService] Preparing to send '${eventTrigger}' to ${to}...`);

        // 1. Fetch Template
        const { data: template, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('event_trigger', eventTrigger)
            .single();

        if (error || !template) {
            console.error(`[EmailService] Template '${eventTrigger}' not found.`);
            return false;
        }

        // 2. Hydrate Template
        let html = replaceVariables(template.body_html, context);
        let subject = replaceVariables(template.subject, context);

        // 3. Send via Edge Function (Secure)
        const { data: result, error: fnError } = await supabase.functions.invoke('send-email', {
            body: {
                to,
                subject,
                html,
                from: 'AirMail Chemist <orders@resend.dev>' // Update later
            }
        });

        if (fnError) {
            console.error('[EmailService] Edge Function Error:', fnError);
            return false;
        }

        console.log(`[EmailService] Email sent successfully! ID: ${result?.id}`);
        return true;

    } catch (err) {
        console.error('[EmailService] Unexpected error:', err);
        return false;
    }
};

// --- PUBLIC METHODS ---

export const sendOrderPlacedEmail = async (order: Order) => {
    const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px;">${item.name}</td>
      <td style="padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

    const context = {
        order_id: order.id,
        customer_name: order.customerName || 'Valued Customer',
        total_amount: `$${order.grandTotal.toFixed(2)}`,
        shipping_address: order.shipAddress,
        items_html: itemsHtml
    };

    return sendEmail(order.customerEmail, 'ORDER_CREATED', context);
};

export const sendPaymentSuccessEmail = async (order: Order, paymentMeta: { method: string, txnId: string }) => {
    const context = {
        order_id: order.id,
        amount_paid: `$${order.grandTotal.toFixed(2)}`,
        payment_method: paymentMeta.method,
        transaction_id: paymentMeta.txnId
    };

    return sendEmail(order.customerEmail, 'PAYMENT_SUCCESS', context);
};

export const sendOrderShippedEmail = async (order: Order) => {
    const context = {
        order_id: order.id,
        courier_name: order.carrier || 'Standard Shipping',
        tracking_number: order.trackingNumber || 'N/A',
        tracking_link: order.trackingUrl || '#',
        estimated_delivery_date: '3-5 Business Days' // Could be dynamic
    };

    return sendEmail(order.customerEmail, 'ORDER_SHIPPED', context);
};
