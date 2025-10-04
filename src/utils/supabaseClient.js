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
  console.log('✅ Supabase client initialized with URL:', supabaseUrl);
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: {
      schema: 'public'
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  
  // Test the connection
  supabase.from('user_profiles').select('count', { count: 'exact', head: true })
    .then(({ data, error, count }) => {
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connection test successful. User profiles table accessible.');
      }
    })
    .catch(err => {
      console.error('❌ Supabase connection error:', err);
    });
}

export default supabase;
