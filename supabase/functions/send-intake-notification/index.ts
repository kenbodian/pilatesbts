import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const defaultAllowedOrigins = [
  "https://pilatesbts.com",
  "https://www.pilatesbts.com",
  "https://pilatesbts.vercel.app",
];

// Comma-separated override, e.g. to add a preview deployment.
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || defaultAllowedOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Echo the caller's origin only when it is on the allow-list.
function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
    "Vary": "Origin",
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface IntakeNotificationPayload {
  /** "submitted" for a first intake form, "updated" when a client edits theirs. */
  event?: "submitted" | "updated";
}

/** Rows of the intake email, in the order Noël reads them. Optional fields are skipped when empty. */
const SECTIONS: Array<{ title: string; fields: Array<[label: string, column: string]> }> = [
  { title: "About", fields: [["Name", "full_name"], ["Email", "email"], ["Phone", "phone"], ["Date of birth", "date_of_birth"], ["Occupation", "occupation"]] },
  { title: "Emergency contact", fields: [["Name", "emergency_contact_name"], ["Phone", "emergency_contact_phone"], ["Relationship", "emergency_contact_relationship"]] },
  { title: "Health", fields: [["Medical conditions", "medical_conditions"], ["Previous injuries", "previous_injuries"], ["Current pain", "current_pain"], ["Pregnancy", "pregnancy_status"]] },
  { title: "Movement background", fields: [["Activity level", "fitness_level"], ["Exercise history", "exercise_history"], ["Pilates experience", "pilates_experience"], ["Goals", "fitness_goals"]] },
  { title: "Preferences", fields: [["Preferred times", "preferred_schedule"], ["Heard about the studio", "how_did_you_hear"], ["Notes", "additional_notes"]] },
];

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // The caller must be the signed-in client. Their token also scopes the waiver query
    // through row-level security, so the email can only ever contain their own form.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ success: false, error: "Missing authorization" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ success: false, error: "Invalid or expired token" }, 401);
    }

    const { event = "submitted" }: IntakeNotificationPayload = await req.json().catch(() => ({}));

    const { data: waiver, error: waiverError } = await supabase
      .from("waivers")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (waiverError || !waiver) {
      return json({ success: false, error: "No intake form found for this account" }, 404);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "pilatesbts@gmail.com";
    // Resend's sandbox sender only delivers to the account owner. Set EMAIL_FROM to an
    // address on a verified domain (resend.com/domains) to reach clients.
    const emailFrom = Deno.env.get("EMAIL_FROM") || "Pilates by the Sea <onboarding@resend.dev>";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const clientName = escapeHtml(waiver.full_name || user.email || "A client");
    const verb = event === "updated" ? "updated their intake form" : "completed their intake form";

    const sectionsHtml = SECTIONS.map(({ title, fields }) => {
      const rows = fields
        .filter(([, column]) => waiver[column] !== null && waiver[column] !== undefined && String(waiver[column]).trim() !== "")
        .map(([label, column]) => `
          <tr>
            <td style="padding: 6px 12px 6px 0; vertical-align: top; color: #4E5F64; white-space: nowrap;">${escapeHtml(label)}</td>
            <td style="padding: 6px 0; vertical-align: top; color: #1C2B30; white-space: pre-wrap;">${escapeHtml(String(waiver[column]))}</td>
          </tr>`)
        .join("");
      if (!rows) return "";
      return `
        <h3 style="margin: 24px 0 8px; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; color: #7B8B8F;">${escapeHtml(title)}</h3>
        <table style="border-collapse: collapse; font-size: 14px; width: 100%;">${rows}</table>`;
    }).join("");

    const signedAt = new Date(waiver.signed_at).toLocaleString("en-US", {
      timeZone: "America/New_York", dateStyle: "long", timeStyle: "short",
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [adminEmail],
        replyTo: user.email,
        subject: `${waiver.full_name || user.email} ${verb}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1C2B30; max-width: 600px; margin: 0 auto; padding: 24px;">
              <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #7B8B8F;">Pilates by the Sea</p>
              <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 400;">${clientName} ${verb}</h1>
              <p style="margin: 0 0 8px; font-size: 14px; color: #4E5F64;">Signed ${escapeHtml(signedAt)}. Reply to this email to reach them directly.</p>
              ${sectionsHtml}
              <p style="margin: 28px 0 0; font-size: 12px; color: #7B8B8F;">The full form is also in the Waivers tab of the admin dashboard.</p>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send intake notification:", error);
      throw new Error("Failed to send email");
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error sending intake notification:", error);
    return json({ success: false, error: "Failed to send notification" }, 500);
  }
});
