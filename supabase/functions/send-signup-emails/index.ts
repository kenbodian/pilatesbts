import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SignupEmailPayload {
  userEmail: string;
  userName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userEmail, userName }: SignupEmailPayload = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "pilatesbts@gmail.com";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const displayName = userName || userEmail.split("@")[0];

    // Send welcome email to the new user
    const welcomeEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Pilates by the Sea <noreply@pilatesbythesea.com>",
        to: [userEmail],
        subject: "Welcome to Pilates by the Sea!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(to right, #2563eb, #0d9488); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Pilates by the Sea</h1>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Hi ${displayName},</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Thank you for joining Pilates by the Sea! We're thrilled to have you as part of our coastal wellness community.
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Your account has been successfully created, and you can now:
                </p>
                
                <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Book your personalized Pilates sessions</li>
                  <li style="margin-bottom: 10px;">View our class offerings and studio information</li>
                  <li style="margin-bottom: 10px;">Access your dashboard anytime</li>
                </ul>
                
                <div style="background: #f0f9ff; border-left: 4px solid #0d9488; padding: 15px; margin: 25px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #1e40af;">
                    <strong>Studio Location:</strong><br>
                    140 Via Madrid Drive<br>
                    Ormond Beach, FL 32176
                  </p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; color: #1e40af;">
                    <strong>Contact:</strong><br>
                    Phone: (386) 387-1738<br>
                    Email: pilatesbts@gmail.com
                  </p>
                </div>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We look forward to seeing you in the studio soon!
                </p>
                
                <p style="font-size: 16px; margin-bottom: 5px;">
                  Warm regards,<br>
                  <strong>Noël Bethea</strong><br>
                  Pilates by the Sea
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                <p style="margin: 0;">© 2025 Pilates by the Sea. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!welcomeEmailResponse.ok) {
      const error = await welcomeEmailResponse.text();
      console.error("Failed to send welcome email:", error);
    }

    // Send notification email to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Pilates by the Sea <noreply@pilatesbythesea.com>",
        to: [adminEmail],
        subject: "New User Registration - Pilates by the Sea",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #1f2937; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="color: white; margin: 0; font-size: 20px;">New User Registration</h2>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  A new user has registered on the Pilates by the Sea platform.
                </p>
                
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 0 0 10px 0; font-size: 14px;">
                    <strong>Email:</strong> ${userEmail}
                  </p>
                  ${userName ? `<p style="margin: 0; font-size: 14px;"><strong>Name:</strong> ${userName}</p>` : ''}
                  <p style="margin: 10px 0 0 0; font-size: 14px;">
                    <strong>Registration Date:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  This is an automated notification from your Pilates by the Sea platform.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      const error = await adminEmailResponse.text();
      console.error("Failed to send admin notification:", error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully" 
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
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