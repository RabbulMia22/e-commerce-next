'use client';

export default function OAuthDebugPage() {
  const openGoogleConsole = () => {
    window.open('https://console.cloud.google.com/apis/credentials/consent', '_blank');
  };

  const testLogin = () => {
    window.open(window.location.origin + '/authentication/login', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
             Google OAuth Access Denied Fix
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-red-800 mb-4">
               Issue: Access Denied Error
            </h2>
            <p className="text-red-700 mb-4">
              Your Google OAuth app is in <strong>Testing Mode</strong>, restricting access to authorized test users only.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-4">
               Quick Fix: Add Test Users
            </h2>
            <ol className="list-decimal list-inside text-green-700 mb-4 space-y-1">
              <li>Click the button below to open Google Console</li>
              <li>Scroll to "Test users" section</li>
              <li>Click "+ ADD USERS"</li>
              <li>Add email addresses that need access</li>
              <li>Click "SAVE"</li>
            </ol>
            <button 
              onClick={openGoogleConsole}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mr-4"
            >
               Open Google Console
            </button>
            <button 
              onClick={testLogin}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
               Test Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
