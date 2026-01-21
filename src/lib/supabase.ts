import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are present
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables.\n\n' +
    'Please ensure you have created a .env file in the project root with:\n' +
    '  VITE_SUPABASE_URL=your_supabase_url\n' +
    '  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n' +
    'See .env.example for a template.'
  );
}

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
  throw new Error(
    'Invalid VITE_SUPABASE_URL: must start with https://'
  );
}

// Validate that the anon key is not a placeholder
if (supabaseKey.includes('placeholder') || supabaseKey.length < 20) {
  throw new Error(
    'Invalid VITE_SUPABASE_ANON_KEY: appears to be a placeholder value.\n' +
    'Please use your actual Supabase anon key.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const auth = supabase.auth;