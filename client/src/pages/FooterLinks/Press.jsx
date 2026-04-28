import { useNavigate } from 'react-router-dom';
// import '../styles/press.css';

const PRESS_ITEMS = [
  {
    outlet: 'The Guardian',
    category: 'Long Read',
    date: 'November 2024',
    headline: '"From Hollywood to the frontlines: Alex Sterling\'s unlikely journey to becoming one of the world\'s most effective advocates"',
    excerpt: 'In a rare extended interview, Sterling speaks candidly about the moment that changed everything — a 2010 visit to a refugee camp that led him to pivot his entire platform toward child protection.',
    link: '#',
  },
  {
    outlet: 'BBC World Service',
    category: 'Interview',
    date: 'September 2024',
    headline: '"The Sterling Child Safety Act: How one celebrity changed the law in twelve countries"',
    excerpt: 'An in-depth look at how the foundation\'s decade-long legislative campaign resulted in ratification across twelve nations, with interviews from lawmakers and beneficiaries.',
    link: '#',
  },
  {
    outlet: 'Time Magazine',
    category: 'Feature',
    date: 'July 2024',
    headline: '"Alex Sterling Named Among Time\'s 100 Most Influential Advocates"',
    excerpt: 'The annual list recognises individuals making meaningful impact on the world\'s most pressing challenges. Sterling is cited for his work at the intersection of entertainment, policy, and grassroots action.',
    link: '#',
  },
  {
    outlet: 'Reuters',
    category: 'News',
    date: 'May 2024',
    headline: '"Sterling Foundation reaches 2 million trees planted milestone at COP side event"',
    excerpt: 'At a side event during international climate talks, the foundation announced it had planted its two millionth tree, partnering with 14 local cooperatives across Sub-Saharan Africa and Southeast Asia.',
    link: '#',
  },
  {
    outlet: 'Al Jazeera English',
    category: 'Documentary',
    date: 'March 2024',
    headline: '"Equal Ground: Inside the Sterling Foundation\'s global rights campaign"',
    excerpt: 'A documentary feature following the foundation\'s legal aid teams across Kenya, Brazil, and the Philippines as they navigate complex discrimination cases.',
    link: '#',
  },
  {
    outlet: 'Vanguard Nigeria',
    category: 'Interview',
    date: 'January 2024',
    headline: '"Why Africa is central to the Sterling Foundation\'s mission — an exclusive interview"',
    excerpt: 'Speaking from Lagos ahead of the foundation\'s West Africa forum, Sterling explains why more than 40% of the foundation\'s field operations are concentrated on the African continent.',
    link: '#',
  },
];

const PRESS_CONTACTS = [
  { name: 'Media Enquiries', email: 'press@alexsterlingfoundation.org', role: 'General media and interview requests' },
  { name: 'Image & Asset Requests', email: 'assets@alexsterlingfoundation.org', role: 'Photography, logos, and approved media assets' },
  { name: 'Documentary & Film', email: 'film@alexsterlingfoundation.org', role: 'Film and documentary collaboration requests' },
];

export default function Press() {
  const navigate = useNavigate();

  return (
    <div className="press-page">

      {/* Hero */}
      <section className="press-hero">
        <div className="press-hero-overlay" />
        <div className="press-hero-content">
          <span className="press-eyebrow">Newsroom</span>
          <h1 className="press-title">Press & Media</h1>
          <p className="press-sub">
            Coverage, interviews, and media resources for journalists and documentary makers working on stories related to the Alex Sterling Foundation and its three core causes.
          </p>
        </div>
      </section>

      <div className="press-container">

        {/* Recent coverage */}
        <section className="press-section">
          <h2 className="press-section-title">Recent Coverage</h2>
          <div className="press-grid">
            {PRESS_ITEMS.map((item, i) => (
              <article key={i} className="press-card">
                <div className="press-card-top">
                  <span className="press-outlet">{item.outlet}</span>
                  <span className="press-category">{item.category}</span>
                </div>
                <span className="press-date">{item.date}</span>
                <h3 className="press-headline">{item.headline}</h3>
                <p className="press-excerpt">{item.excerpt}</p>
                <a href={item.link} className="press-read-link">
                  Read coverage →
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Press kit */}
        <section className="press-kit-section">
          <div className="press-kit-inner">
            <div className="press-kit-text">
              <h2 className="press-kit-title">Press Kit</h2>
              <p className="press-kit-desc">
                Download our official press kit containing approved photography, logo files, biography, and key facts about the foundation's work and impact.
              </p>
              <div className="press-kit-items">
                {['Official Biography', 'High-Resolution Photography', 'Logo Package (SVG, PNG)', 'Foundation Fact Sheet', 'Impact Report 2024 (PDF)'].map(item => (
                  <div key={item} className="press-kit-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C0152A" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {item}
                  </div>
                ))}
              </div>
              <button className="press-kit-btn">Download Full Press Kit</button>
            </div>
            <div className="press-kit-visual">
              <div className="press-kit-badge">
                <span className="press-kit-badge-num">18</span>
                <span className="press-kit-badge-label">Years of<br />Advocacy</span>
              </div>
              <div className="press-kit-badge press-kit-badge--sm">
                <span className="press-kit-badge-num">120+</span>
                <span className="press-kit-badge-label">Media<br />Features</span>
              </div>
            </div>
          </div>
        </section>

        {/* Press contacts */}
        <section className="press-section">
          <h2 className="press-section-title">Press Contacts</h2>
          <p className="press-contacts-desc">
            Our media team responds to all enquiries within one business day. For urgent requests, please indicate "URGENT" in your subject line.
          </p>
          <div className="press-contacts-grid">
            {PRESS_CONTACTS.map((c, i) => (
              <div key={i} className="press-contact-card">
                <h3 className="press-contact-name">{c.name}</h3>
                <p className="press-contact-role">{c.role}</p>
                <a href={`mailto:${c.email}`} className="press-contact-email">{c.email}</a>
              </div>
            ))}
          </div>
        </section>

        {/* Speaking requests */}
        <section className="press-speaking">
          <h2 className="press-speaking-title">Speaking & Appearances</h2>
          <p className="press-speaking-desc">
            Alex Sterling accepts a limited number of speaking engagements each year — primarily for forums, summits, and events directly related to the foundation's three causes. All commercial speaking enquiries are declined. To enquire about a speaking engagement, please email <strong>speaking@alexsterlingfoundation.org</strong> with full event details, expected audience, and cause relevance.
          </p>
          <button
            className="press-speaking-btn"
            onClick={() => navigate('/contact')}
          >
            Submit Enquiry
          </button>
        </section>

      </div>
    </div>
  );
}