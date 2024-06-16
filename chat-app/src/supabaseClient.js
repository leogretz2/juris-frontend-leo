// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gpazmihhssffmeyfmsey.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwYXptaWhoc3NmZm1leWZtc2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1MDIzMjEsImV4cCI6MjAyOTA3ODMyMX0.a8nrDdTF5pVh_LKmSAZNCcq83CjIMIf7gO0dH1nMnj0';

export const supabase = createClient(supabaseUrl, supabaseKey);
