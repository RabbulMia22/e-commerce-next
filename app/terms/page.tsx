import React from 'react'
import Link from 'next/link'

const TermsOfServicePage = () => {
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

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using ShopMate, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, you should 
                not use this platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                ShopMate is an e-commerce platform that allows users to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Browse and purchase products online</li>
                <li>Create user accounts and manage profiles</li>
                <li>Leave reviews and ratings for products</li>
                <li>Track orders and manage purchases</li>
                <li>Sign in using Google OAuth for convenience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Keep your account information updated</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Google OAuth Integration</h2>
              <p className="text-gray-700 mb-4">
                When you choose to sign in with Google:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You authorize us to access your basic Google profile information</li>
                <li>We only collect your name and email address</li>
                <li>You can revoke this access at any time through your Google account settings</li>
                <li>Your Google account credentials are never stored on our servers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our platform to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious software or harmful content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Orders and Payments</h2>
              <p className="text-gray-700 mb-4">
                By placing an order, you agree that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All information provided is accurate</li>
                <li>You are authorized to use the payment method</li>
                <li>You will pay all charges incurred</li>
                <li>Prices and availability are subject to change</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our{' '}
                <Link href="/privacy" className="text-orange-600 hover:text-orange-500 underline">
                  Privacy Policy
                </Link>{' '}
                to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                ShopMate shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Changes will be 
                effective immediately upon posting. Your continued use of the platform 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, please contact us at:
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

export default TermsOfServicePage