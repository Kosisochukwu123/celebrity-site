import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/impact-report.css';

const REPORTS = [
  {
    year: '2024',
    tag: 'Latest Report',
    headline: 'A Year of Groundbreaking Change',
    summary: 'In 2024, the Alex Sterling Foundation reached more people, passed more legislation, and planted more trees than in any previous year. This report details every programme, every penny, and every life touched.',
    coverGradient: 'linear-gradient(135deg, #1A1714 0%, #2a1515 40%, #3D1010 100%)',
    stats: [
      { value: '14.2M', label: 'Lives Reached', change: '+18%', up: true },
      { value: '$4.1M', label: 'Funds Deployed', change: '+22%', up: true },
      { value: '8,420', label: 'Legal Cases Aided', change: '+11%', up: true },
      { value: '340K', label: 'Trees Planted', change: '+34%', up: true },
    ],
    sections: [
      {
        cause: 'Equal Rights',
        color: '#1B4D8E',
        icon: '⚖',
        spend: '$1.4M',
        spendPct: 34,
        highlights: [
          'Co-authored 6 pieces of anti-discrimination legislation across 4 continents.',
          'Provided legal representation to 3,200 individuals in gender and LGBTQ+ cases.',
          'Launched a 28-language digital legal aid portal — 50,000 users in first 6 months.',
          'Hosted Annual Global Forum in Nairobi — 2,400 attendees from 62 countries.',
        ],
        quote: { text: 'For the first time in my country, I had someone in my corner who understood my rights.', author: 'Forum participant, Zimbabwe' },
      },
      {
        cause: 'Child Protection',
        color: '#8B3A3A',
        icon: '🛡',
        spend: '$1.8M',
        spendPct: 44,
        highlights: [
          'Expanded emergency shelter network to 28 countries — 3,000 children housed.',
          'Sterling Child Safety Act ratified in 2 additional nations (total: 12).',
          'Trained 4,200 local child protection officers across Sub-Saharan Africa.',
          'Digital case management system processed 8,420 active cases in 2024.',
        ],
        quote: { text: 'The shelter gave my daughter her childhood back. We thought that was lost forever.', author: 'Parent, Kenya' },
      },
      {
        cause: 'Climate Action',
        color: '#1A5C2A',
        icon: '🌍',
        spend: '$0.9M',
        spendPct: 22,
        highlights: [
          'Planted 340,000 trees across Nigeria, Ghana, Indonesia, and Brazil.',
          'Ocean plastic fleet removed 87 tonnes from the Atlantic and Indian Oceans.',
          'Secured net-zero commitments from 3 additional corporations.',
          'Addressed COP29 — contributed language to the binding methane reduction accord.',
        ],
        quote: { text: "We've planted trees in this community for two years. It's the greenest it's been in my lifetime.", author: 'Cooperative leader, Ogun State' },
      },
    ],
    financials: [
      { label: 'Child Protection',  pct: 44, color: '#8B3A3A' },
      { label: 'Equal Rights',      pct: 34, color: '#1B4D8E' },
      { label: 'Climate Action',    pct: 22, color: '#1A5C2A' },
    ],
    closingNote: 'Every membership directly funds these programmes. 92 cents of every dollar raised goes directly to field operations — one of the highest ratios of any advocacy foundation globally.',
  },
  {
    year: '2023',
    tag: 'Previous Report',
    headline: 'Building the Infrastructure for Change',
    summary: 'A year of systems-building — new legal platforms, expanded shelter networks, and landmark UN appearances set the foundation for the record-breaking 2024 that followed.',
    coverGradient: 'linear-gradient(135deg, #1A1714 0%, #1a2040 40%, #0d1a30 100%)',
    stats: [
      { value: '12M',   label: 'Lives Reached',   change: '+14%', up: true },
      { value: '$3.4M', label: 'Funds Deployed',  change: '+19%', up: true },
      { value: '7,600', label: 'Legal Cases',     change: '+8%',  up: true },
      { value: '253K',  label: 'Trees Planted',   change: '+27%', up: true },
    ],
    sections: [
      {
        cause: 'Equal Rights',
        color: '#1B4D8E',
        icon: '⚖',
        spend: '$1.1M', spendPct: 32,
        highlights: [
          'Addressed UN General Assembly — pledges from 12 member states.',
          'Legal aid portal launched in beta — 15,000 early users across 12 languages.',
          'Funded 4 landmark anti-discrimination court cases — 3 won.',
          '1,800 legal cases handled globally.',
        ],
        quote: { text: 'Standing at the UN podium, I thought of every person who had no voice. That day we gave them one.', author: 'Alex Sterling, New York 2023' },
      },
      {
        cause: 'Child Protection',
        color: '#8B3A3A',
        icon: '🛡',
        spend: '$1.6M', spendPct: 47,
        highlights: [
          'Shelter capacity expanded by 40% — 2,100 children housed at peak.',
          'Sterling Act ratified in 10th and 11th nations.',
          'Southeast Asia expansion — first 3 partner organisations onboarded.',
          '7,600 legal cases processed through case management system.',
        ],
        quote: { text: 'The training changed everything. We now know how to spot the signs early.', author: 'Child protection officer, Lagos' },
      },
      {
        cause: 'Climate Action',
        color: '#1A5C2A',
        icon: '🌍',
        spend: '$0.7M', spendPct: 21,
        highlights: [
          'Planted 253,000 trees — first year crossing the 250K milestone.',
          'Ocean fleet expanded to 4 vessels.',
          'COP28 appearance — contributed to methane reduction language.',
          '9 corporate sustainability pledges secured.',
        ],
        quote: { text: "We're not just planting trees. We're planting futures.", author: 'Alex Sterling' },
      },
    ],
    financials: [
      { label: 'Child Protection', pct: 47, color: '#8B3A3A' },
      { label: 'Equal Rights',     pct: 32, color: '#1B4D8E' },
      { label: 'Climate Action',   pct: 21, color: '#1A5C2A' },
    ],
    closingNote: '2023 was the year we built the infrastructure. 2024 was the year we used it. Thank you for being part of both.',
  },
];

export default function ImpactReport() {
  const navigate = useNavigate();
  const [activeYear, setActiveYear] = useState('2024');
  const report = REPORTS.find(r => r.year === activeYear) || REPORTS[0];

  return (
    <div className="ir-page">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="ir-hero" style={{ background: report.coverGradient }}>
        <div className="ir-hero-overlay" />
        <div className="ir-hero-content">
          <span className="ir-eyebrow">Alex Sterling Foundation</span>
          <h1 className="ir-hero-title">
            Annual Impact<br /><em>Report</em>
          </h1>

          {/* Year selector */}
          <div className="ir-year-tabs">
            {REPORTS.map(r => (
              <button
                key={r.year}
                className={`ir-year-tab ${activeYear === r.year ? 'active' : ''}`}
                onClick={() => setActiveYear(r.year)}
              >
                {r.year}
                {r.tag && <span className="ir-year-tag">{r.tag}</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── REPORT HEADER ────────────────────────────────── */}
      <div className="ir-report-header">
        <div className="ir-report-year-label">{report.year} Report</div>
        <h2 className="ir-report-headline">{report.headline}</h2>
        <p className="ir-report-summary">{report.summary}</p>
      </div>

      {/* ── TOP STATS ────────────────────────────────────── */}
      <section className="ir-stats-bar">
        {report.stats.map((s, i) => (
          <div key={i} className="ir-stat">
            <div className="ir-stat-value">{s.value}</div>
            <div className="ir-stat-label">{s.label}</div>
            <div className={`ir-stat-change ${s.up ? 'up' : 'down'}`}>
              {s.up ? '↑' : '↓'} {s.change} vs prior year
            </div>
          </div>
        ))}
      </section>

      {/* ── CAUSE SECTIONS ───────────────────────────────── */}
      <div className="ir-container">
        {report.sections.map((sec, i) => (
          <section key={sec.cause} className={`ir-cause-section ${i % 2 === 1 ? 'ir-cause-section--alt' : ''}`}>
            <div className="ir-cause-inner">

              {/* Left — heading + spend */}
              <div className="ir-cause-left">
                <div className="ir-cause-icon" style={{ background: `${sec.color}22`, border: `1px solid ${sec.color}44` }}>
                  <span>{sec.icon}</span>
                </div>
                <h3 className="ir-cause-title" style={{ color: sec.color }}>{sec.cause}</h3>

                {/* Spend card */}
                <div className="ir-spend-card">
                  <div className="ir-spend-amount">{sec.spend}</div>
                  <div className="ir-spend-label">deployed in {report.year}</div>
                  <div className="ir-spend-bar">
                    <div className="ir-spend-fill" style={{ width: `${sec.spendPct}%`, background: sec.color }} />
                  </div>
                  <div className="ir-spend-pct">{sec.spendPct}% of total budget</div>
                </div>

                {/* Quote */}
                <blockquote className="ir-cause-quote" style={{ borderColor: `${sec.color}55` }}>
                  <p>"{sec.quote.text}"</p>
                  <cite>— {sec.quote.author}</cite>
                </blockquote>
              </div>

              {/* Right — highlights */}
              <div className="ir-cause-right">
                <h4 className="ir-highlights-title">Key Achievements</h4>
                <ul className="ir-highlights">
                  {sec.highlights.map((h, j) => (
                    <li key={j} className="ir-highlight-item">
                      <span className="ir-highlight-dot" style={{ background: sec.color }} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </section>
        ))}

        {/* ── FINANCIALS ───────────────────────────────── */}
        <section className="ir-financials">
          <h2 className="ir-section-heading">How Funds Were Allocated</h2>
          <p className="ir-financials-sub">
            92% of all funds raised go directly to field operations. The remaining 8% covers administration and platform costs.
          </p>
          <div className="ir-financials-grid">
            {/* Bar chart */}
            <div className="ir-bar-chart">
              {report.financials.map(f => (
                <div key={f.label} className="ir-bar-row">
                  <div className="ir-bar-label">{f.label}</div>
                  <div className="ir-bar-track">
                    <div
                      className="ir-bar-fill"
                      style={{ width: `${f.pct}%`, background: f.color }}
                    />
                  </div>
                  <div className="ir-bar-pct">{f.pct}%</div>
                </div>
              ))}
            </div>

            {/* Donut chart (CSS) */}
            <div className="ir-donut-wrap">
              <svg className="ir-donut" viewBox="0 0 160 160">
                {(() => {
                  let offset = 0;
                  const r = 60;
                  const circ = 2 * Math.PI * r;
                  return report.financials.map(f => {
                    const dash = (f.pct / 100) * circ;
                    const gap  = circ - dash;
                    const el = (
                      <circle
                        key={f.label}
                        cx="80" cy="80" r={r}
                        fill="none"
                        stroke={f.color}
                        strokeWidth="22"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 80 80)"
                        opacity="0.9"
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
                <text x="80" y="74" textAnchor="middle" fill="#F5F0E8" fontSize="18" fontWeight="700" fontFamily="Playfair Display, serif">92%</text>
                <text x="80" y="92" textAnchor="middle" fill="rgba(245,240,232,0.4)" fontSize="9" fontFamily="Barlow Condensed, sans-serif" letterSpacing="2">TO FIELD OPS</text>
              </svg>
              <div className="ir-donut-legend">
                {report.financials.map(f => (
                  <div key={f.label} className="ir-legend-item">
                    <span className="ir-legend-dot" style={{ background: f.color }} />
                    <span>{f.label} — {f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CLOSING ──────────────────────────────────── */}
        <section className="ir-closing">
          <div className="ir-closing-quote-mark">"</div>
          <p className="ir-closing-text">{report.closingNote}</p>
          <div className="ir-closing-sig">
            <span className="ir-sig-name">Alex Sterling</span>
            <span className="ir-sig-title">Founder, Alex Sterling Foundation</span>
          </div>
          <div className="ir-closing-actions">
            <button className="btn btn--primary" onClick={() => navigate('/membership')}>
              Support This Work
            </button>
            <button className="btn btn--outline" onClick={() => navigate('/members')}>
              Back to Members Area
            </button>
          </div>
        </section>
      </div>

    </div>
  );
}