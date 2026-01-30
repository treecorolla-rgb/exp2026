
// Import Deno modules
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface SendRequest {
    to: string;
    subject: string;
    html: string;
    from?: string;
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
        const { to, subject, html, from }: SendRequest = await req.json();

        if (!to || !html) {
            throw new Error("Missing 'to' or 'html' in request body");
        }

        // Direct Sending via Resend API
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
                from: from || 'AirMail Chemist <orders@resend.dev>', // Update with your verified domain
                to: [to],
                subject: subject || 'Notification',
                html: html,
            }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
            throw new Error(`Resend API Error: ${JSON.stringify(emailResult)}`);
        }

        return new Response(JSON.stringify({ success: true, id: emailResult.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
