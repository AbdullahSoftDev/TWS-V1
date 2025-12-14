import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://rrgtapdrkvpfkfboimlx.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZ3RhcGRya3ZwZmtmYm9pbWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzEzNDIsImV4cCI6MjA4MDgwNzM0Mn0.aRmnwEoAPUeWlg5OJejFosx32jSm_mgi8fl_JcD44cU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);