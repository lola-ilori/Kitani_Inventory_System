import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qxsgkevbvvmjrjogkonn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4c2drZXZidnZtanJqb2drb25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDU1NTMsImV4cCI6MjA4MTIyMTU1M30.qILAT4W9qNetZKOHks2FBPa24ZVL2jbV000fwq_hC4Q'

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

export const supabase = createClient(supabaseUrl, supabaseKey)

console.log('Supabase client created:', supabase);