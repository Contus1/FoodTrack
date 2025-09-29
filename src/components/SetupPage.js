import React from 'react';

const SetupPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🍽️ Food Diary</h1>
          <p className="text-gray-600">Setup Required</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Supabase Configuration Needed</h3>
            <p className="text-sm text-yellow-700">
              To use this app, you need to configure Supabase credentials.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Setup Steps:</h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
              <li>Create a project at <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
              <li>Get your project URL and anon key from the API settings</li>
              <li>Update your <code className="bg-gray-100 px-1 rounded">.env</code> file:</li>
            </ol>
            
            <div className="bg-gray-800 text-green-400 p-3 rounded-md text-sm font-mono">
              <div>REACT_APP_SUPABASE_URL=your-project-url</div>
              <div>REACT_APP_SUPABASE_ANON_KEY=your-anon-key</div>
            </div>
            
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2" start="4">
              <li>Run the SQL setup commands from the README.md</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              The app is currently running in demo mode with mock data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
