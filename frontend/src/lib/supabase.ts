import { createClient } from '@supabase/supabase-js';

// Environment variables should ideally be used here, but for this task/demo we use the values directly as requested/available.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hvoaslnjlvpdydxjinuj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2b2FzbG5qbHZwZHlkeGppbnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNzc2NzcsImV4cCI6MjA4NDY1MzY3N30.eVTDnMJllIocOahjVipM8FBHzwK1XpDW9KDK362lClE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
