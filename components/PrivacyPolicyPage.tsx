
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 md:px-8 bg-gray-900 rounded-xl shadow-2xl my-10">
      <h1 className="text-4xl font-luckiest text-center mb-3 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
        Privacy Policy
      </h1>
      <p className="text-center text-sm text-gray-500 mb-10">Last updated: 03/06/2025</p>

      <div className="text-gray-300 space-y-6">
        <p className="leading-relaxed">
          Sipocalypse (“we”, “us”, or “our”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website (www.sipocalypse.fun), including when you submit your email to receive a custom cocktail recipe or join our mailing list.
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">1. What We Collect</h2>
          <p className="mb-2 leading-relaxed">
            We may collect and store the following personal information:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-5 text-gray-400">
            <li>Email address – when you enter it to receive a cocktail recipe or join our mailing list</li>
            <li>Activity input – used solely to generate your custom cocktail</li>
            <li>IP address and usage data – collected anonymously to help us improve the website</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="mb-2 leading-relaxed">
            We use your information to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-5 text-gray-400">
            <li>Email you a custom cocktail based on your chosen activity</li>
            <li>Send occasional updates, offers, or marketing emails related to Sipocalypse</li>
            <li>Improve and optimize the functionality of our website</li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">3. Legal Basis for Processing</h2>
          <p className="mb-2 leading-relaxed">
            Under the GDPR, we rely on:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-5 text-gray-400">
            <li>Consent – when you enter your email and agree to receive emails</li>
            <li>Legitimate interest – to maintain and improve our service</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">4. How We Store and Protect Your Data</h2>
          <p className="mb-2 leading-relaxed">
            Your data is securely stored using industry-standard practices. We do not share, sell, or rent your information to third parties.
          </p>
          <p className="leading-relaxed">
            We use Make.com (formerly Integromat) to automate our email system. You can read Make.com’s Privacy Policy for more info on their data handling.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">5. Your Rights</h2>
          <p className="mb-2 leading-relaxed">
            Under GDPR, you have the right to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-5 text-gray-400">
            <li>Access the data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with your local data protection authority</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            To exercise your rights, contact us at: <a href="mailto:hello@sipocalypse.fun" className="text-pink-400 hover:text-pink-300 underline">hello@sipocalypse.fun</a>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">6. Unsubscribing</h2>
          <p className="leading-relaxed">
            Every marketing email we send includes an unsubscribe link. You can also contact us directly to be removed from our list.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">7. Cookies</h2>
          <p className="leading-relaxed">
            We may use cookies to enhance your experience on our website. You can disable cookies in your browser settings.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">8. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with a new “Last updated” date.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
