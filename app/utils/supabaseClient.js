import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kurmbcmdlmzijtxrshtq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1cm1iY21kbG16aWp0eHJzaHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1OTYyNDUsImV4cCI6MjA4MjE3MjI0NX0.jZ2oVWJnzK_ian-mTJpR8kKwhH60Pu3Th6K-e8RwT8U'

export const supabase = createClient(supabaseUrl, supabaseKey)