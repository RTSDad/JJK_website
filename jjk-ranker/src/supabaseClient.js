import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fduybwjgbcshhjtkzcrn.supabase.co';
const supabaseAnonKey = 'sb_publishable_yUpnRbZlUhGQ5hubP8QNxA_hoSSsR2E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
