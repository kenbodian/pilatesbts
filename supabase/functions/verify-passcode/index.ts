import { createClient } from 'npm:@supabase/supabase-js@2';

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

interface PasscodeRequest {
  code: string;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code }: PasscodeRequest = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Passcode is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { data, error } = await supabase
      .from('passcodes')
      .select('id, is_active, expires_at')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Verification failed' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ valid: false }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const isValid = data.is_active && 
      (!data.expires_at || new Date(data.expires_at) > new Date());

    return new Response(
      JSON.stringify({ valid: isValid }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});