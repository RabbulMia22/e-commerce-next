'use client'
import React, { useState } from 'react'
import { Plus, Trash2, Copy, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'

const GoogleOAuthManager = () => {
  const [testUsers, setTestUsers] = useState([
    'mdrabbulmia24@gmail.com' // Current working email
  ])
  const [newEmail, setNewEmail] = useState('')
  const [copyMessage, setCopyMessage] = useState('')

  const addTestUser = () => {
    if (newEmail && !testUsers.includes(newEmail)) {
      setTestUsers([...testUsers, newEmail])
      setNewEmail('')
    }
  }

  const removeTestUser = (email: string) => {
    setTestUsers(testUsers.filter(user => user !== email))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopyMessage(`Copied: ${text}`)
    setTimeout(() => setCopyMessage(''), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Google OAuth Manager</h1>
        <p className="text-gray-600">Manage your Google OAuth test users and configuration</p>
      </div>

      {copyMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {copyMessage}
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm border-l-4 border-l-amber-500">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-amber-800">OAuth App Status: Testing Mode</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Your Google OAuth app is currently in testing mode, restricting access to authorized test users only.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Limitation:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Only test users can sign in</li>
                <li>• Maximum 100 test users allowed</li>
                <li>• Other emails get "Access denied"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">To Fix:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add users as test users (quick fix)</li>
                <li>• Or publish your OAuth app</li>
                <li>• Complete verification process</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Current Test Users */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Authorized Test Users ({testUsers.length}/100)</h3>
          </div>
          <p className="text-gray-600 mb-4">
            These email addresses can successfully sign in with Google OAuth
          </p>
          {testUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No test users added yet</p>
          ) : (
            <div className="space-y-2">
              {testUsers.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      email === 'mdrabbulmia24@gmail.com' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {email === 'mdrabbulmia24@gmail.com' ? 'Primary' : 'Test User'}
                    </span>
                    <span className="text-sm font-medium">{email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(email)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Copy email"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {email !== 'mdrabbulmia24@gmail.com' && (
                      <button
                        onClick={() => removeTestUser(email)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Test User */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Add Test User</h3>
          <p className="text-gray-600 mb-4">
            Add email addresses that should be able to sign in with Google OAuth
          </p>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="user@gmail.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTestUser()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={addTestUser} 
              disabled={!newEmail || testUsers.includes(newEmail)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: You'll need to add these emails in Google Cloud Console for them to actually work
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p className="text-gray-600 mb-4">
            Links to manage your Google OAuth configuration
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <ExternalLink className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">Google Cloud Console</div>
                <div className="text-xs text-gray-500">Manage OAuth credentials</div>
              </div>
            </button>

            <button
              onClick={() => window.open('https://console.cloud.google.com/apis/credentials/consent', '_blank')}
              className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <ExternalLink className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium">OAuth Consent Screen</div>
                <div className="text-xs text-gray-500">Add test users & publish app</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Step-by-Step Instructions</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">Method 1</span>
                Add Test Users (Quick Fix)
              </h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" className="text-blue-600 underline">OAuth consent screen</a></li>
                <li>Scroll down to "Test users" section</li>
                <li>Click "+ ADD USERS"</li>
                <li>Add the email addresses from above</li>
                <li>Click "SAVE"</li>
              </ol>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">Method 2</span>
                Publish App (Recommended)
              </h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Complete all required fields in OAuth consent screen</li>
                <li>Add privacy policy and terms of service URLs</li>
                <li>Click "PUBLISH APP"</li>
                <li>Submit for verification (1-7 days)</li>
                <li>Once approved, any Google account can sign in</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <span className="text-gray-600 font-medium">Client ID:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all">
                740472634347-7u2m75cbg972mjm6bbc6mmbajn38nh56.apps.googleusercontent.com
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Status:</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">Testing Mode</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Authorized Users:</span>
              <span className="font-medium">{testUsers.length} of 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h3>
          <p className="text-blue-700 text-sm mb-3">
            If you need immediate access for multiple users, here are your options:
          </p>
          <ul className="text-blue-700 text-sm space-y-1 mb-4">
            <li>✅ Add them as test users (quickest solution - works immediately)</li>
            <li>🔄 Temporarily disable Google OAuth and use email/password only</li>
            <li>📈 Work on publishing the app for long-term solution</li>
          </ul>
          <div className="text-xs text-blue-600">
            <p><strong>Tip:</strong> The test user method works instantly, while publishing can take 1-7 days for review.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleOAuthManager