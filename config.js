// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://ejvywluehxoirwealiey.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdnl3bHVlaHhvaXJ3ZWFsaWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTk0NzAsImV4cCI6MjA4MDI3NTQ3MH0.65YF8_Led74ahja0vKQsnC0f4120W-5WCMEIF2e-R7I';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

