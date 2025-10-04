import React from 'react'
import Link from 'next/link'

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg px-8 py-6">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-orange-600 hover:text-orange-500"
            >
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                When you use ShopMate, we collect the following information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and phone number when you register</li>
                <li><strong>Google OAuth:</strong> Basic profile information (name, email) when you sign in with Google</li>
                <li><strong>Order Information:</strong> Purchase history, delivery addresses, payment preferences</li>
                <li><strong>Usage Data:</strong> How you interact with our platform for improving user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Process your orders and manage your account</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order updates and important notifications</li>
                <li>Improve our products and services</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Google OAuth Integration</h2>
              <p className="text-gray-700 mb-4">
                When you sign in with Google, we only access:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your basic profile information (name, email)</li>
                <li>Your email address for account creation and authentication</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We do not access your Google Drive, Gmail, or other Google services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information. We may share information only:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>With payment processors for order completion</li>
                <li>With delivery partners for order fulfillment</li>
                <li>When required by law or to protect our rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your information against 
                unauthorized access, alteration, disclosure, or destruction. Your data is stored 
                securely using industry-standard encryption.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8" id="cookies">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies & Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your browsing experience and analyze site traffic. These include
                essential cookies required for the site to function, as well as optional analytics cookies that help us improve our services.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Enable core functionality such as secure login, shopping cart management, and checkout.</li>
                <li><strong>Performance Cookies:</strong> Collect anonymous statistics about site usage to help us optimize performance.</li>
                <li><strong>Advertising Cookies:</strong> Used only with your consent to provide personalized offers and measure campaign effectiveness.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can manage your cookie preferences through your browser settings at any time. Disabling certain cookies may affect site functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 text-gray-700">
                <p><strong>Email:</strong> mdrabbulmia24@gmail.com</p>
                <p><strong>Website:</strong> ShopMate E-commerce Platform</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage