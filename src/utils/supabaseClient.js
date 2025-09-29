import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create a mock client for development when Supabase is not configured
const mockSupabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } }) }) })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Please configure Supabase environment variables' } }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/300x200?text=Demo+Image' } })
    })
  }
};

// Check if environment variables are properly set
let supabase;
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your-supabase-url-here' || 
    supabaseAnonKey === 'your-supabase-anon-key-here') {
  console.warn('⚠️ Supabase environment variables not configured. Using mock client for demo purposes.');
  console.warn('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
  supabase = mockSupabase;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;
