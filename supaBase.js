
import { createClient } from
"https://esm.sh/@supabase/supabase-js@2";

// Your supabase project URL
const SUPABASE_URL = "https://ebvltipzbkmngbagervh.supabase.co";

// Your Supabase publishable key
const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_L2Llv01VXZUes_dHEC1mNg_r7IcxBm3";

// Initialize Supabase
export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("supabase client initialized!");
