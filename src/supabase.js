import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mhirpjvtcjhjzvzteduo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oaXJwanZ0Y2poanp2enRlZHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjM4MTQsImV4cCI6MjA5NjEzOTgxNH0.6S7oM2GZIDi-1YYoKC8FNIrkjagQLOhMFxj1lA2Cw8A'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)