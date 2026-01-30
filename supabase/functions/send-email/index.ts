
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailLog {
    id: string;
    template_id: string;
    recipient_email: string;
    recipient_name: string;
    context_data: Record<string, any>;
    status: string;
}

interface Template {
    subject: string;
    body_html: string;
    body_text: string;
}

// Simple helper to replace {{variables}} in string
const renderTemplate = (content: string, data: Record<string, any>) => {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return data[key] || "";
    });
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();

        // Webhook payload structure from Supabase Database Webhooks
        // type: 'INSERT', table: 'email_logs', record: { ... }, old_record: null, schema: 'public'
        const { record } = payload;

        if (!record || !record.id) {
            throw new Error("No record found in payload");
        }

        const emailLog = record as EmailLog;

        // Only process PENDING emails (Idempotency check)
        // Note: The webhook triggers on INSERT, so it should be PENDING.
        // If you trigger on UPDATE, make sure to filter.
        if (emailLog.status !== 'PENDING') {
            return new Response(JSON.stringify({ message: "Email not pending" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // 1. Fetch the Template
        const { data: templateData, error: templateError } = await supabase
            .from("email_templates")
            .select("subject, body_html, body_text")
            .eq("id", emailLog.template_id)
            .single();

        if (templateError || !templateData) {
            throw new Error(`Template not found: ${templateError?.message}`);
        }

        const template = templateData as Template;

        // 2. Render Content
        const subject = renderTemplate(template.subject, emailLog.context_data);
        const html = renderTemplate(template.body_html, emailLog.context_data);
        const text = renderTemplate(template.body_text || "", emailLog.context_data);

        // 3. Send Email via Resend
        // NOTE: 'from' address must be verified in your Resend dashboard.
        // Use a default specific to the project or env var.
        const fromEmail = "AirMail Chemist <noreply@airmailchemist.com>"; // UPDATE THIS

        const { data: emailResponse, error: emailError } = await resend.emails.send({
            from: fromEmail,
            to: [emailLog.recipient_email],
            subject: subject,
            html: html,
            text: text,
        });

        if (emailError) {
            throw new Error(`Resend API Error: ${emailError.message}`);
        }

        // 4. Update Log to SENT
        await supabase
            .from("email_logs")
            .update({
                status: "SENT",
                sent_at: new Date().toISOString(),
                subject: subject, // Save snapshot of subject
            })
            .eq("id", emailLog.id);

        return new Response(JSON.stringify({ success: true, id: emailResponse?.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("Error processing email:", error);

        // Attempt to update log to FAILED
        // Requires getting the ID from payload if possible, but inside catch it's tricky if parsing failed.
        // Assuming simple errors:

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500, // or 400
        });
    }
});
