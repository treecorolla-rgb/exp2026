
// Import Deno modules
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Types
interface EmailLog {
    id: string;
    template_id: string;
    recipient_email: string;
    recipient_name: string;
    context_data: Record<string, any>;
    status: string;
}

interface WebhookPayload {
    type: 'INSERT';
    table: string;
    record: EmailLog;
    schema: string;
    old_record: null | EmailLog;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main function
serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload: WebhookPayload = await req.json();
        const { record } = payload;

        // Only process PENDING logs
        if (record.status !== 'PENDING') {
            return new Response(JSON.stringify({ message: "Skipping non-pending log" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize Supabase Client (Service Role needed for DB access)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Fetch Template
        const { data: template, error: templateError } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('id', record.template_id)
            .single();

        if (templateError || !template) {
            throw new Error(`Template not found: ${templateError?.message}`);
        }

        // 2. Render Template (Replace {{key}} with value)
        let emailBody = template.body_html;
        let emailSubject = template.subject;
        const context = record.context_data || {};

        // Basic Handlebars-like replacement
        // Replace simple keys: {{customer_name}}
        Object.keys(context).forEach((key) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            const val = context[key] !== null && context[key] !== undefined ? String(context[key]) : '';
            emailBody = emailBody.replace(regex, val);
            emailSubject = emailSubject.replace(regex, val);
        });

        // Special handling for {{#each items}} block for Order Items
        // This is a simplified regex implementation for the specific table structure in our templates
        if (context.items && Array.isArray(context.items)) {
            const listStart = '{{#each items}}';
            const listEnd = '{{/each}}';
            const startIndex = emailBody.indexOf(listStart);
            const endIndex = emailBody.indexOf(listEnd);

            if (startIndex !== -1 && endIndex !== -1) {
                const itemTemplate = emailBody.substring(startIndex + listStart.length, endIndex);

                const generatedItemsHtml = context.items.map((item: any) => {
                    let row = itemTemplate;
                    // Replace item properties
                    Object.keys(item).forEach((key) => {
                        const regex = new RegExp(`{{${key}}}`, 'g');
                        row = row.replace(regex, item[key] || '');
                    });
                    // Handle 'price' formatting if needed (assuming it's formatted in backend SQL or here)
                    // Fallback for missing keys
                    row = row.replace(/{{.*?}}/g, '');
                    return row;
                }).join('');

                // Replace the entire block
                emailBody = emailBody.substring(0, startIndex) + generatedItemsHtml + emailBody.substring(endIndex + listEnd.length);
            }
        }

        // Cleanup any remaining tags
        emailBody = emailBody.replace(/{{.*?}}/g, '');

        // 3. Send Email (Provider: Resend)
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
            throw new Error("RESEND_API_KEY is missing in Edge Function secrets.");
        }

        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
                from: 'AirMail Chemist <orders@yourdomain.com>', // Replace with verified domain
                to: [record.recipient_email],
                subject: emailSubject,
                html: emailBody,
            }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
            throw new Error(`Resend API Error: ${JSON.stringify(emailResult)}`);
        }

        // 4. Update Log Status -> SENT
        await supabaseAdmin
            .from('email_logs')
            .update({
                status: 'SENT',
                sent_at: new Date().toISOString(),
            })
            .eq('id', record.id);

        return new Response(JSON.stringify({ success: true, id: emailResult.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        // Log Failure
        const errorMessage = err.message || 'Unknown error';
        console.error(errorMessage);

        // Try to update DB with failure
        try {
            const payload: WebhookPayload = await req.json(); // Re-read might fail if stream consumed, use cached if possible or just log
            if (payload?.record?.id) {
                const supabaseAdmin = createClient(
                    Deno.env.get('SUPABASE_URL') ?? '',
                    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
                );
                await supabaseAdmin
                    .from('email_logs')
                    .update({
                        status: 'FAILED',
                        error_message: errorMessage,
                    })
                    .eq('id', payload.record.id);
            }
        } catch (e) {
            // Ignore inner error
        }

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
