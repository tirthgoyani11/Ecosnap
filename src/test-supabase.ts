import { supabase } from './integrations/supabase/client';

// Test Supabase connection
console.log('Testing Supabase connection...');

// Test if environment variables are loaded
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// Test connection
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful:', data.session ? 'Session exists' : 'No session');
    }
  })
  .catch((error) => {
    console.error('Supabase connection failed:', error);
  });
