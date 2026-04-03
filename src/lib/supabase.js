import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vjtgrxflathoftctarxi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdGdyeGZsYXRob2Z0Y3RhcnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzIwODIsImV4cCI6MjA5MDgwODA4Mn0.xdnrPOcU2hIPlGNK3LsEQoJSOtTfEFndgeWiAuIFtw4'

export const supabase = createClient(supabaseUrl, supabaseKey)
