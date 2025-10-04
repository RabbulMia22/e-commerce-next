import React from 'react'
import Link from 'next/link'

const LAST_UPDATED = 'October 4, 2025'

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
              <strong>Last updated:</strong> {LAST_UPDATED}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using the ShopMate platform, mobile applications, or any related services (collectively, the “Services”), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must discontinue your use of the Services immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Overview of Our Services</h2>
              <p className="text-gray-700 mb-4">
                ShopMate provides a digital marketplace where customers can discover, review, and purchase products. Core functionality includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Product browsing, search, and categorization</li>
                <li>Account registration and profile management</li>
                <li>Shopping cart, checkout, and order tracking workflows</li>
                <li>User-generated reviews and ratings</li>
                <li>Optional social sign-in via Google OAuth 2.0</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Eligibility & Account Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                To create an account or place orders, you must be at least 18 years old or the age of majority in your jurisdiction. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate, current, and complete registration details</li>
                <li>Maintain the confidentiality of your login credentials</li>
                <li>Promptly update any information that changes</li>
                <li>Accept responsibility for all activities conducted under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Google OAuth & Data Usage</h2>
              <p className="text-gray-700 mb-4">
                ShopMate integrates Google OAuth to provide a quick sign-in option. When you choose "Continue with Google":
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>We request access to your Google account’s basic profile (name and email address) solely for authentication and account creation.</li>
                <li>Your Google password is never transmitted to or stored by ShopMate.</li>
                <li>You may revoke our access at any time through your Google security settings.</li>
                <li>We comply with Google API Services User Data Policy, including the Limited Use requirements.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Additional details about how we store and protect OAuth data can be found in our{' '}
                <Link href="/privacy" className="text-orange-600 hover:text-orange-500 underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Permitted & Prohibited Activities</h2>
              <p className="text-gray-700 mb-4">You agree that you will not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate applicable local, state, national, or international laws</li>
                <li>Infringe upon or misappropriate intellectual property rights</li>
                <li>Upload viruses, malware, or other harmful code</li>
                <li>Attempt to gain unauthorized access to our systems or user data</li>
                <li>Use automated scripts or scrapers without written permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Product Listings, Orders & Payments</h2>
              <p className="text-gray-700 mb-4">
                By placing an order, you confirm that all information provided is accurate and that you are authorized to use the selected payment method. Prices, availability, promotions, and shipping estimates are subject to change without notice. We reserve the right to refuse or cancel orders for any reason, including suspected fraud.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Shipping, Returns & Refunds</h2>
              <p className="text-gray-700 mb-4">
                Shipping timelines are estimates and may vary based on carrier delays or unforeseen circumstances. Our return and refund policies are detailed during checkout and in your order confirmation. Products must be returned in their original condition unless otherwise specified.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700">
                All content, trademarks, logos, and software associated with ShopMate are the property of their respective owners. You may not reproduce, distribute, or create derivative works from any portion of the Services without prior written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Privacy & Data Protection</h2>
              <p className="text-gray-700">
                We manage your personal data in accordance with our{' '}
                <Link href="/privacy" className="text-orange-600 hover:text-orange-500 underline">
                  Privacy Policy
                </Link>. This includes details on data collection, storage, use, retention, and your rights to access or delete information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination of Services</h2>
              <p className="text-gray-700">
                We may suspend or terminate your account with or without notice if you breach these Terms or if required by law. Upon termination, your right to access the Services will cease immediately, though certain obligations (including payment of outstanding balances) will survive.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Disclaimers & Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                The Services are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. To the fullest extent permitted by law, ShopMate disclaims all warranties, and will not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to These Terms</h2>
              <p className="text-gray-700">
                We may update these Terms from time to time. Material changes will be posted on this page with an updated date. Continued use of the Services after changes are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700">
                If you have questions about these Terms of Service or need to exercise your legal rights, please contact us using the details below:
              </p>
              <div className="mt-4 text-gray-700">
                <p><strong>Email:</strong> mdrabbulmia24@gmail.com</p>
                <p><strong>Business Name:</strong> ShopMate E-commerce Platform</p>
                <p><strong>Location:</strong> Dhaka, Bangladesh</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage