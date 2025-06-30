import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Create Supabase client with service key for admin operations
export const supabaseAdmin = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create Supabase client with anon key for public operations
export const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseAnonKey
);