import React, { useState } from 'react';
import supabase from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const DatabaseDebug = () => {
  const { user } = useAuth();
  const [results, setResults] = useState('');

  const checkFriendships = async () => {
    try {
      console.log('Current user ID:', user?.id);
      
      // Get all friendships in the database
      const { data: allFriendships, error: allError } = await supabase
        .from('friendships')
        .select('*');
      
      console.log('All friendships:', allFriendships);
      
      // Get friendships for current user
      const { data: userFriendships, error: userError } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:user_profiles!friendships_requester_id_fkey(*),
          addressee:user_profiles!friendships_addressee_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
      
      console.log('User friendships:', userFriendships);
      
      // Get pending requests for user
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:user_profiles!friendships_requester_id_fkey(*)
        `)
        .eq('addressee_id', user.id)
        .eq('status', 'pending');
      
      console.log('Pending requests for user:', pendingRequests);
      
      // Get sent requests by user
      const { data: sentRequests, error: sentError } = await supabase
        .from('friendships')
        .select(`
          *,
          addressee:user_profiles!friendships_addressee_id_fkey(*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');
      
      console.log('Sent requests by user:', sentRequests);
      
      setResults(`
All Friendships: ${JSON.stringify(allFriendships, null, 2)}

User Friendships: ${JSON.stringify(userFriendships, null, 2)}

Pending Requests for User: ${JSON.stringify(pendingRequests, null, 2)}

Sent Requests by User: ${JSON.stringify(sentRequests, null, 2)}

Errors: 
- All: ${allError?.message || 'None'}
- User: ${userError?.message || 'None'}
- Pending: ${pendingError?.message || 'None'}
- Sent: ${sentError?.message || 'None'}
      `);
      
    } catch (error) {
      console.error('Debug error:', error);
      setResults(`Error: ${error.message}`);
    }
  };

  const checkUserProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      console.log('All user profiles:', profiles);
      setResults(`User Profiles: ${JSON.stringify(profiles, null, 2)}\n\nError: ${error?.message || 'None'}`);
    } catch (error) {
      console.error('Profile debug error:', error);
      setResults(`Error: ${error.message}`);
    }
  };

  if (!user) return <div>Please log in first</div>;

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 m-4">
      <h3 className="text-lg font-bold mb-4">Database Debug</h3>
      <p className="mb-4">Current User ID: {user.id}</p>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={checkFriendships}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Check Friendships
        </button>
        <button
          onClick={checkUserProfiles}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Check User Profiles
        </button>
      </div>
      
      {results && (
        <pre className="bg-white p-4 rounded border text-sm overflow-auto max-h-96">
          {results}
        </pre>
      )}
    </div>
  );
};

export default DatabaseDebug;