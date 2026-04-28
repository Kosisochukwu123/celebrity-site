import { useState } from 'react';
// import '../styles/contact.css';

const TOPICS = [
  'General Enquiry',
  'Membership Support',
  'Payment Issue',
  'Membership Card Delivery',
  'Speaking & Appearances',
  'Press & Media',
  'Partnership & NGO Collaboration',
  'Technical Issue',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate — wire to a real endpoint or Formspree in production
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setSending(false);
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-eyebrow">Get in Touch</span>
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-sub">
            We're a small, dedicated team. We read every message and respond to all genuine enquiries within two business days.
          </p>
        </div>
      </section>

      <div className="contact-container">

        <div className="contact-grid">

          {/* Form */}
          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="28" stroke="#1D9E75" strokeWidth="2"/><path d="M18 30l9 9 15-15" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3>Message Sent</h3>
                <p>Thank you, {form.name.split(' ')[0]}. We'll respond to <strong>{form.email}</strong> within two business days.</p>
                <button className="contact-reset-btn" onClick={() => { setForm({ name:'', email:'', topic:'', message:'' }); setSubmitted(false); }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit}>
                <h2 className="contact-form-title">Send a Message</h2>

                <div className="contact-field-row">
                  <div className="contact-field">
                    <label className="contact-label">Full Name *</label>
                    <input className="contact-input" value={form.name}
                      onChange={e => set('name', e.target.value)}
                      placeholder="Your full name" required />
                  </div>
                  <div className="contact-field">
                    <label className="contact-label">Email Address *</label>
                    <input className="contact-input" type="email" value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="your@email.com" required />
                  </div>
                </div>

                <div className="contact-field">
                  <label className="contact-label">Topic *</label>
                  <select className="contact-input contact-select" value={form.topic}
                    onChange={e => set('topic', e.target.value)} required>
                    <option value="">Select a topic...</option>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="contact-field">
                  <label className="contact-label">Message *</label>
                  <textarea className="contact-input contact-textarea" value={form.message}
                    onChange={e => set('message', e.target.value)}
                    placeholder="Please describe your enquiry in as much detail as possible..."
                    required rows={6} />
                </div>

                <button className="contact-submit-btn" type="submit" disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'}
                </button>

                <p className="contact-note">
                  For urgent membership or payment issues, please use the live chat in your member portal — it's faster.
                </p>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="contact-sidebar">
            <div className="contact-info-card">
              <h3 className="contact-info-title">Direct Contacts</h3>
              <div className="contact-info-list">
                {[
                  { label: 'Member Support', email: 'support@alexsterlingfoundation.org', note: 'Membership, payments, card delivery' },
                  { label: 'Press & Media', email: 'press@alexsterlingfoundation.org', note: 'Interviews, features, assets' },
                  { label: 'Partnerships', email: 'partnerships@alexsterlingfoundation.org', note: 'NGOs, corporate, institutional' },
                  { label: 'Privacy & Legal', email: 'privacy@alexsterlingfoundation.org', note: 'Data requests, legal notices' },
                ].map(c => (
                  <div key={c.label} className="contact-info-item">
                    <span className="contact-info-label">{c.label}</span>
                    <a href={`mailto:${c.email}`} className="contact-info-email">{c.email}</a>
                    <span className="contact-info-note">{c.note}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-response-card">
              <h3 className="contact-response-title">Response Times</h3>
              <div className="contact-response-list">
                <div className="contact-response-item">
                  <span className="contact-response-type">General enquiries</span>
                  <span className="contact-response-time">2 business days</span>
                </div>
                <div className="contact-response-item">
                  <span className="contact-response-type">Payment reviews</span>
                  <span className="contact-response-time">24–48 hours</span>
                </div>
                <div className="contact-response-item">
                  <span className="contact-response-type">Live chat (members)</span>
                  <span className="contact-response-time">Within hours</span>
                </div>
                <div className="contact-response-item">
                  <span className="contact-response-type">Press enquiries</span>
                  <span className="contact-response-time">1 business day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}