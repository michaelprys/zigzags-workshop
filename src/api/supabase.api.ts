import { createClient } from '@supabase/supabase-js';

const env = import.meta.env as unknown as Record<string, string | undefined>;
const supabaseUrl = String(env.VITE_SUPABASE_URL ?? '');
const supabaseKey = String(env.VITE_SUPABASE_KEY ?? '');
const supabaseApi = createClient(supabaseUrl, supabaseKey);

export default supabaseApi;
