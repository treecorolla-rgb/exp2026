
import { supabase } from './supabaseClient';
import { Order } from '../types';

/**
 * EMAIL BACKEND CLIENT
 * 
 * Usage:
 * import { EmailBackend } from '../lib/EmailBackend';
 * await EmailBackend.trigger('ORDER_CREATED', { ... });
 */

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

            const { data, error } = await supabase.functions.invoke('dynamic-endpoint', {
                body: {
                    trigger: triggerName,
                    recipient,
                    payload
                }
            });

            if (error) {
                console.error('[EmailBackend] Dispatch Failed:', error);
                // Extract useful message from Supabase error if possible
                let msg = error.message || 'Unknown Function Error';
                try {
                    // Sometimes error body is JSON string
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
            customer_name: order.customerName,
            total_amount: `$${order.grandTotal.toFixed(2)}`,
            shipping_address: order.shipAddress,
            items_html: itemsHtml
        });
    },

    async sendPaymentReceipt(order: Order, method: string, txnId: string) {
        return this.trigger('PAYMENT_SUCCESS', order.customerEmail, {
            order_id: order.id,
            amount_paid: `$${order.grandTotal.toFixed(2)}`,
            payment_method: method,
            transaction_id: txnId
        });
    },

    async sendShippingNotification(order: Order) {
        return this.trigger('ORDER_SHIPPED', order.customerEmail, {
            order_id: order.id,
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
