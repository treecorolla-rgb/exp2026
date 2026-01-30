
import { supabase } from './supabaseClient';
import { Order } from '../types';

/**
 * EMAIL BACKEND CLIENT
 * 
 * Usage:
 * import { EmailBackend } from '../lib/EmailBackend';
 * await EmailBackend.trigger('ORDER_CREATED', { ... });
 */

// Global Variables injected into every email
const GLOBAL_VARS = {
    // You can replace this with a real logo upload URL from AdminSettings in the future
    logo_url: 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png',
    store_name: 'Anti Gravity Store',
    support_email: 'support@antigravity.com',
    year: new Date().getFullYear().toString()
};

export const EmailBackend = {
    /**
     * Generic Trigger Function
     * @param triggerName The Event Name (must match DB 'event_trigger')
     * @param recipient Customer Email
     * @param payload key-value pairs to fill the template
     */
    async trigger(triggerName: string, recipient: string, payload: Record<string, any>) {
        try {
            console.log(`[EmailBackend] Triggering '${triggerName}' for ${recipient}...`);

            // Merge Global Vars with specific Payload
            const finalPayload = { ...GLOBAL_VARS, ...payload };

            const { data, error } = await supabase.functions.invoke('dynamic-endpoint', {
                body: {
                    trigger: triggerName,
                    recipient,
                    payload: finalPayload
                }
            });

            if (error) {
                console.error('[EmailBackend] Dispatch Failed:', error);

                let msg = error.message || 'Unknown Function Error';
                try {
                    const body = JSON.parse(error);
                    if (body && body.error) msg = body.error;
                } catch (e) { }

                return { success: false, error: msg };
            }

            if (data?.skipped) {
                console.warn(`[EmailBackend] Trigger '${triggerName}' was SKIPPED (Disabled in DB).`);
                return { success: false, error: 'Email Trigger Disabled in System' };
            }

            if (data?.error) {
                return { success: false, error: data.error };
            }

            console.log(`[EmailBackend] Success! Email ID: ${data?.id}`);
            return { success: true, id: data?.id };

        } catch (e: any) {
            console.error('[EmailBackend] Network Error:', e);
            return { success: false, error: e.message || 'Network Exception' };
        }
    },

    // --- Convenience Helpers ---

    async sendOrderConfirmation(order: Order) {
        const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${item.name}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

        return this.trigger('ORDER_CREATED', order.customerEmail, {
            order_id: order.id,
            order_number: order.id.slice(0, 8).toUpperCase(), // Shorter friendly ID
            customer_name: order.customerName,
            total_amount: `$${order.grandTotal.toFixed(2)}`,
            shipping_address: order.shipAddress,
            items_html: itemsHtml
        });
    },

    async sendPaymentReceipt(order: Order, method: string, txnId: string) {
        return this.trigger('PAYMENT_RECEIVED', order.customerEmail, {
            order_id: order.id,
            order_number: order.id.slice(0, 8).toUpperCase(),
            amount_paid: `$${order.grandTotal.toFixed(2)}`,
            payment_method: method,
            transaction_id: txnId
        });
    },

    async sendShippingNotification(order: Order) {
        return this.trigger('ORDER_SHIPPED', order.customerEmail, {
            order_id: order.id,
            order_number: order.id.slice(0, 8).toUpperCase(),
            courier_name: order.carrier || 'Standard',
            tracking_number: order.trackingNumber || 'Pending',
            tracking_link: order.trackingUrl || '#'
        });
    },

    async sendLoginOTP(email: string, otp: string) {
        return this.trigger('LOGIN_OTP', email, {
            otp_code: otp,
            customer_name: 'Valued Customer'
        });
    }
};
