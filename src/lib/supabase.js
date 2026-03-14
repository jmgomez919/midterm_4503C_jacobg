import { createClient } from '@supabase/supabase-js'

// These values come from your .env file (prefixed with VITE_ so Vite exposes them).
// Never commit real credentials — copy .env.example to .env and fill in your values.
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

// Singleton client — import { supabase } wherever you need to query Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)
