import '../../styles/Legal.css';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <span className="legal-eyebrow">Legal</span>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-sub">Last updated: January 2025</p>
      </div>

      <div className="legal-body">
        <div className="legal-intro">
          <p>By accessing the Alex Sterling Foundation member platform and purchasing a membership, you agree to be bound by these Terms of Service. Please read them carefully.</p>
        </div>

        <section className="legal-section">
          <h2>1. Membership</h2>
          <h3>Eligibility</h3>
          <p>Membership is by invitation only. To register, you must possess a valid, unused membership code distributed by the foundation. You must be at least 16 years of age.</p>

          <h3>Account Responsibility</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted under your account is your responsibility. Notify us immediately at <strong>support@alexsterlingfoundation.org</strong> if you suspect unauthorised access.</p>

          <h3>One Account per Person</h3>
          <p>Each membership code may only be used once. Creating multiple accounts is prohibited and may result in all associated accounts being terminated.</p>
        </section>

        <section className="legal-section">
          <h2>2. Payments</h2>
          <h3>Manual Verification</h3>
          <p>All payments are manually verified by our team. This process typically takes 24–48 hours. Submitting a payment does not guarantee approval — we reserve the right to reject fraudulent or unverifiable submissions.</p>

          <h3>Accepted Payment Methods</h3>
          <ul>
            <li><strong>Cryptocurrency:</strong> Bitcoin (BTC), Ethereum (ETH), and USDT. You must send the correct currency to the correct wallet address and provide a valid transaction hash. Sending the wrong currency to a crypto address may result in permanent, unrecoverable loss.</li>
            <li><strong>Gift Cards:</strong> Amazon, Apple, Google Play, and other approved brands. Cards must not have been previously redeemed. The PIN must be clearly visible in the photograph you submit.</li>
          </ul>

          <h3>Refund Policy</h3>
          <p>Due to the nature of cryptocurrency and gift card payments, all payments are final and non-refundable once verified and approved. If your payment is rejected, you retain the asset (the crypto or gift card) and may resubmit with corrected information.</p>
        </section>

        <section className="legal-section">
          <h2>3. Member Content and Conduct</h2>
          <p>Members who have access to the live chat and community features agree not to:</p>
          <ul>
            <li>Post content that is abusive, threatening, harassing, discriminatory, or illegal.</li>
            <li>Share personal information of other members without their consent.</li>
            <li>Attempt to gain unauthorised access to any part of the platform.</li>
            <li>Use the platform for commercial solicitation without express written permission.</li>
            <li>Impersonate Alex Sterling, foundation staff, or other members.</li>
          </ul>
          <p>Violation of these rules may result in immediate account termination without refund.</p>
        </section>

        <section className="legal-section">
          <h2>4. Intellectual Property</h2>
          <p>All content on this platform — including text, images, videos, logos, and the platform design — is the property of the Alex Sterling Foundation and is protected by copyright and trademark law. Members may not reproduce, distribute, or create derivative works from platform content without explicit written permission.</p>
          <p>Content in the Private Gallery is for personal viewing only and may not be downloaded, shared, or published on any other platform.</p>
        </section>

        <section className="legal-section">
          <h2>5. Membership Benefits</h2>
          <p>Membership benefits are as described on the Membership page at the time of purchase. We reserve the right to:</p>
          <ul>
            <li>Add new benefits to membership tiers at any time.</li>
            <li>Modify or discontinue benefits with reasonable notice.</li>
            <li>Adjust pricing for renewal at the end of a membership year.</li>
          </ul>
          <p>Physical membership card delivery is subject to address accuracy. The foundation is not responsible for cards lost due to an incorrect delivery address provided by the member.</p>
        </section>

        <section className="legal-section">
          <h2>6. Disclaimers and Limitation of Liability</h2>
          <p>The platform is provided "as is" without warranties of any kind. The foundation is not liable for:</p>
          <ul>
            <li>Loss of cryptocurrency funds due to incorrect wallet addresses or network errors.</li>
            <li>Gift card losses due to premature redemption or illegible submission photos.</li>
            <li>Service interruptions, technical errors, or data loss beyond our reasonable control.</li>
          </ul>
          <p>Our total liability to any member is limited to the amount paid for their current membership year.</p>
        </section>

        <section className="legal-section">
          <h2>7. Termination</h2>
          <p>We may terminate or suspend your account at any time if you violate these terms. You may cancel your membership at any time by contacting us, though no refunds will be issued for unused portions of the membership year.</p>
        </section>

        <section className="legal-section">
          <h2>8. Governing Law</h2>
          <p>These terms are governed by and construed in accordance with applicable international law. Any disputes shall be resolved through good-faith negotiation before any legal proceedings are initiated.</p>
        </section>

        <section className="legal-section">
          <h2>9. Contact</h2>
          <p>For questions about these terms:</p>
          <div className="legal-contact">
            <p><strong>Email:</strong> legal@alexsterlingfoundation.org</p>
          </div>
        </section>
      </div>
    </div>
  );
}