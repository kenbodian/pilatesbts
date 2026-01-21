import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactEmailPayload {
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userEmail, userName, subject, message }: ContactEmailPayload = await req.json();

    // Validate required fields
    if (!userEmail || !userName || !subject || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "pilatesbts@gmail.com";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Send email to admin with user's question
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Pilates by the Sea <onboarding@resend.dev>",
        to: [adminEmail],
        replyTo: userEmail,
        subject: `Contact Form: ${subject}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #1f2937; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="color: white; margin: 0; font-size: 20px;">New Contact Form Message</h2>
              </div>

              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0d9488;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;">
                    <strong>From:</strong> ${userName}
                  </p>
                  <p style="margin: 0 0 10px 0; font-size: 14px;">
                    <strong>Email:</strong> <a href="mailto:${userEmail}" style="color: #0d9488;">${userEmail}</a>
                  </p>
                  <p style="margin: 0; font-size: 14px;">
                    <strong>Subject:</strong> ${subject}
                  </p>
                </div>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #1f2937;">Message:</h3>
                  <p style="margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>

                <div style="padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; font-size: 13px; color: #92400e;">
                    <strong>💡 Tip:</strong> You can reply directly to this email to respond to ${userName}.
                  </p>
                </div>

                <p style="font-size: 12px; color: #6b7280; margin: 20px 0 0 0;">
                  Sent: ${new Date().toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      const error = await adminEmailResponse.text();
      console.error("Failed to send contact email to admin:", error);
      throw new Error("Failed to send email");
    }

    // Send confirmation email to user
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Pilates by the Sea <onboarding@resend.dev>",
        to: [userEmail],
        subject: "We received your message - Pilates by the Sea",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(to right, #2563eb, #0d9488); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300;">Thank You for Reaching Out</h1>
              </div>

              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  Thank you for contacting Pilates by the Sea. We've received your message and will get back to you as soon as possible.
                </p>

                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;">
                    <strong>Your Message:</strong>
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #1e40af;">
                    Subject: ${subject}
                  </p>
                </div>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  We typically respond within 24 hours. If you need immediate assistance, please call us at
                  <strong style="color: #0d9488;">(386) 387-1738</strong>.
                </p>

                <p style="font-size: 16px; margin-bottom: 5px;">
                  Warm regards,<br>
                  <strong>Noël Bethea</strong><br>
                  Pilates by the Sea
                </p>
              </div>

              <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                <p style="margin: 0 0 10px 0;">
                  140 Via Madrid Drive, Ormond Beach, FL 32176<br>
                  (386) 387-1738 | pilatesbts@gmail.com
                </p>
                <p style="margin: 0;">© 2025 Pilates by the Sea. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const error = await userEmailResponse.text();
      console.error("Failed to send confirmation email to user:", error);
      // Don't throw error here - admin email was sent successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your message has been sent successfully!"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to send message. Please try again."
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
