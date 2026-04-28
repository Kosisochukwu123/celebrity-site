import '../../styles/Legal.css';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <span className="legal-eyebrow">Legal</span>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-sub">Last updated: January 2025</p>
      </div>

      <div className="legal-body">
        <div className="legal-intro">
          <p>The Alex Sterling Foundation ("we", "our", "us") is committed to protecting your personal information. This policy explains what we collect, how we use it, and your rights regarding that data.</p>
        </div>

        <section className="legal-section">
          <h2>1. Information We Collect</h2>
          <h3>Information you provide directly</h3>
          <ul>
            <li><strong>Account information:</strong> Your name, email address, and password when you register for a membership.</li>
            <li><strong>Membership code:</strong> The unique invitation code used to create your account.</li>
            <li><strong>Delivery address:</strong> Your physical address, provided voluntarily for membership card delivery.</li>
            <li><strong>Payment submissions:</strong> Transaction hashes (for crypto payments) or gift card images you submit for membership payment verification. We do not collect credit card numbers or bank details.</li>
            <li><strong>Chat messages:</strong> Messages you send through the member support chat are stored to facilitate communication between you and our team.</li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> Pages visited, time spent, features used — collected in aggregate to improve the platform.</li>
            <li><strong>Device information:</strong> Browser type and operating system, used to ensure compatibility.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To create and manage your member account.</li>
            <li>To process and verify membership payments.</li>
            <li>To send you transactional emails — payment confirmations, approval or rejection notices.</li>
            <li>To deliver your physical membership card to the address you provide.</li>
            <li>To enable member support through the live chat feature.</li>
            <li>To send you updates about events, new content, and foundation news (you may unsubscribe at any time).</li>
            <li>To improve the platform and fix technical issues.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Store Your Information</h2>
          <p>Your data is stored in a secure MongoDB database hosted on MongoDB Atlas with encryption at rest. Images you upload (gift card photos) are stored as encrypted data within our database and are never written to public disk storage. Payment submissions are accessible only to authorised administrators.</p>
          <p>We retain your data for as long as your account is active. You may request deletion at any time by contacting us.</p>
        </section>

        <section className="legal-section">
          <h2>4. Sharing of Information</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share data only in the following limited circumstances:</p>
          <ul>
            <li><strong>Service providers:</strong> Email delivery (SMTP), database hosting — these providers process data only on our behalf and under strict confidentiality agreements.</li>
            <li><strong>Legal requirements:</strong> If required by law or to protect the rights and safety of the foundation or its members.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Cookies</h2>
          <p>We use minimal, functional cookies and browser storage:</p>
          <ul>
            <li><strong>Authentication token:</strong> Stored in <code>localStorage</code> to keep you logged in across sessions.</li>
            <li><strong>Notification dismissals:</strong> Stored in <code>sessionStorage</code> to remember which notifications you have dismissed.</li>
            <li><strong>Image cache:</strong> Gallery and content images are stored in your browser's <code>IndexedDB</code> for up to 7 days to improve performance. This data never leaves your device.</li>
          </ul>
          <p>We do not use advertising cookies or third-party tracking.</p>
        </section>

        <section className="legal-section">
          <h2>6. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Update inaccurate or incomplete data through your account settings.</li>
            <li><strong>Deletion:</strong> Request that we delete your account and all associated data.</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
            <li><strong>Objection:</strong> Object to certain types of processing, including marketing communications.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <strong>privacy@alexsterlingfoundation.org</strong>.</p>
        </section>

        <section className="legal-section">
          <h2>7. Children's Privacy</h2>
          <p>This platform is not directed at children under the age of 16. We do not knowingly collect personal data from minors. If you believe a child has provided us with personal information, please contact us immediately.</p>
        </section>

        <section className="legal-section">
          <h2>8. Changes to This Policy</h2>
          <p>We may update this policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section className="legal-section">
          <h2>9. Contact</h2>
          <p>For privacy-related questions, contact our Data Protection Officer at:</p>
          <div className="legal-contact">
            <p><strong>Email:</strong> privacy@alexsterlingfoundation.org</p>
            <p><strong>Post:</strong> Alex Sterling Foundation, Data Protection Office, c/o Members Services</p>
          </div>
        </section>
      </div>
    </div>
  );
}