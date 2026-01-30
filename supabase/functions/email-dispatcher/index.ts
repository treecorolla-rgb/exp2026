
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface DispatchRequest {
    trigger: string;      // e.g. 'ORDER_CREATED'
    recipient: string;    // Customer Email
    payload: Record<string, any>; // Variables { order_id: 123, ... }
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 1. Parse Request
        const { trigger, recipient, payload }: DispatchRequest = await req.json();

        if (!trigger || !recipient) {
            throw new Error("Missing 'trigger' or 'recipient'");
        }

        // 2. Init Database Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 3. Fetch Configuration & Template from Database
        // We strictly check 'is_active' = true. If false, we skip sending.
        const { data: template, error } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('event_trigger', trigger)
            .eq('is_active', true)
            .single();

        if (error || !template) {
            console.log(`[Dispatcher] Trigger '${trigger}' is disabled or not found. Skipping.`);
            return new Response(JSON.stringify({ skipped: true, reason: 'Disabled or Not Found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 4. Render Template (Replace variables)
        let body = template.body_html;
        let subject = template.subject;

        Object.keys(payload).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            const val = payload[key] !== null ? String(payload[key]) : '';
            body = body.replace(regex, val);
            subject = subject.replace(regex, val);
        });

        // Cleanup unused tags
        body = body.replace(/{{.*?}}/g, '');

        // 5. Send via Resend
        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (!resendKey) throw new Error("Missing RESEND_API_KEY");

        const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'AirMail Chemist <orders@resend.dev>', // Replace with your domain
                to: [recipient],
                subject: subject,
                html: body
            })
        });

        if (!emailRes.ok) {
            const err = await emailRes.text();
            throw new Error(`Resend Error: ${err}`);
        }

        const result = await emailRes.json();

        // 6. Log success (Optional: You could insert into email_logs here if you want history)

        return new Response(JSON.stringify({ success: true, id: result.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
