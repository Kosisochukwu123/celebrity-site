import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/home.css';

export default function Home() {
  const [content, setContent] = useState({});
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    axios.get(`${API}/api/content`).then(res => {
      const map = {};
      res.data.forEach(c => { map[c.section] = c; });
      setContent(map);
    }).catch(() => {});
  }, []);

  const h  = content['hero']    || {};
  const a  = content['about']   || {};
  const q  = content['quote']   || {};
  const c1 = content['cause_1'] || {};
  const c2 = content['cause_2'] || {};
  const c3 = content['cause_3'] || {};

  const causes = [
    { num:'01', sec:c1, title:'Equal Rights for All',  body:'Championing gender equity, LGBTQ+ protections, and racial justice across 40+ countries through legislative advocacy and community-led programs.' },
    { num:'02', sec:c2, title:'Child Protection',       body:"Every child deserves safety, education, and love. Alex's foundation supports shelters, legal aid, and educational programs for vulnerable children." },
    { num:'03', sec:c3, title:'Saving the Planet',      body:'From ocean conservation to reforestation, Alex leads campaigns pressuring governments and corporations to act on the climate crisis with urgency.' },
  ];

  return (
    <main className="home-page">

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <span className="hero-eyebrow">Actor · Activist · Advocate</span>
          <h1 className="hero-name">
            {h.heading || 'Alex'}<br />
            <span>{h.subheading || 'Sterling'}</span>
          </h1>
          <p className="hero-tagline">
            {h.body || 'Fighting for equal rights, child protection, and a sustainable planet — because silence is never an option.'}
          </p>
          <div className="hero-actions">
            <button className="btn btn--primary" onClick={() => navigate('/register')}>Join the Movement</button>
            <button className="btn btn--outline" onClick={() => document.getElementById('causes')?.scrollIntoView({ behavior:'smooth' })}>Explore Causes</button>
          </div>
        </div>
        <div className="hero-scroll-hint">Scroll</div>
        <div className="hero-stats">
          {[['14M+','Lives Reached'],['3','Global Causes'],['120+','Partner NGOs'],['18 Yrs','Of Advocacy']].map(([num, lbl]) => (
            <div key={lbl} className="hero-stat">
              <div className="hero-stat-num">{num}</div>
              <div className="hero-stat-label">{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO */}
      <section className="video-section">
        <div className="video-section-text">
          <span className="video-section-label">Featured Documentary</span>
          <h2 className="video-section-heading">{a.heading || 'A Voice for Those Who Cannot Speak'}</h2>
          <p className="video-section-body">{a.body || 'From the halls of the United Nations to grassroots communities in the Global South, this documentary captures the work behind the headlines.'}</p>
          <button className="btn btn--primary" onClick={() => navigate('/members')}>Watch Full Documentary</button>
        </div>
        <div>
          <div className="video-frame" onClick={() => navigate('/members')}>
            <div className="video-frame-overlay" />
            <div className="video-play-btn">
              <div className="video-play-circle">
                <div className="video-play-triangle" />
              </div>
            </div>
          </div>
          <p className="video-caption">Runtime: 1h 28min · Members Only</p>
        </div>
      </section>

      {/* CAUSES */}
      <section className="causes-section" id="causes">
        <div className="causes-intro">
          <span className="causes-intro-eyebrow">The Mission</span>
          <h2 className="causes-intro-heading">Three Causes.<br /><em>One Voice.</em></h2>
        </div>
        <div className="causes-grid">
          {causes.map(({ num, sec, title, body }) => (
            <div key={num} className="cause-card">
              <div className="cause-card-number">{num}</div>
              <div className="cause-card-bar" />
              <h3 className="cause-card-title">{sec.heading || title}</h3>
              <p className="cause-card-body">{sec.body || body}</p>
              <button className="cause-card-link">Learn more →</button>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section className="quote-section">
        <div className="quote-section-bg">"</div>
        <blockquote>{q.body || '"Justice is not a gift — it is a right. And rights are only real when everyone fights for them."'}</blockquote>
        <p className="quote-section-attr">{q.subheading || '— Alex Sterling, UN General Assembly, 2023'}</p>
      </section>

      {/* IMPACT */}
      <section className="impact-section" id="impact">
        <div className="impact-image">
          {a.imageUrl
            ? <img src={a.imageUrl} alt="Impact" />
            : <div className="impact-image-placeholder" />
          }
          <div className="impact-image-caption">
            <strong>Field Work · 2024</strong>
            <span>Southern Africa Climate Initiative</span>
          </div>
        </div>
        <div className="impact-content">
          <span className="impact-eyebrow">Real Impact</span>
          <h2 className="impact-heading">Beyond the Spotlight</h2>
          <p className="impact-body">Alex doesn't just speak — he shows up. From refugee camps to climate summits, the work happens on the ground, in communities that need it most.</p>
          <ul className="impact-list">
            {['Co-founded the Sterling Child Safety Act, now ratified in 12 nations.',
              'Planted over 2 million trees across sub-Saharan Africa with local cooperatives.',
              'Provided legal support to 8,000+ individuals facing discrimination in 2023.',
              'Annual Global Forum unites activists and lawmakers from 60+ countries.'].map(item => (
              <li key={item} className="impact-list-item">
                <span className="impact-list-dot" />
                {item}
              </li>
            ))}
          </ul>
          <button className="btn btn--primary" onClick={() => navigate('/members')}>View Full Impact Report</button>
        </div>
      </section>

      {/* JOIN */}
      <section className="join-section">
        <span className="join-eyebrow">Become Part of It</span>
        <h2 className="join-heading">Join the Movement</h2>
        <p className="join-body">Get early access to documentaries, exclusive events, and member-only content. Your membership directly funds the causes.</p>
        <div className="join-form">
          <input type="email" placeholder="Your email address" />
          <button className="join-form-btn">Get Access</button>
        </div>
        <p className="join-signin-link">
          Already a member? <span onClick={() => navigate('/login')}>Sign in with your code →</span>
        </p>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <span className="site-footer-logo">ALEX STERLING</span>
        <div className="site-footer-links">
          {['Privacy','Terms','Press','Contact'].map(l => <a key={l} href="#">{l}</a>)}
        </div>
        <span className="site-footer-copy">© 2025 Alex Sterling Foundation</span>
      </footer>

    </main>
  );
}
