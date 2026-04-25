cat > /home/claude/celebrity-site/client/src/pages/MembersArea.jsx << 'ENDFILE'
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EventBoard from '../components/EventBoard';
import PrivateGallery from '../components/PrivateGallery';
import '../styles/members.css';

const ALL_CARDS = [
  { id: 'card',    title: 'Membership Card',      body: "Purchase your official physical membership card — a collector's item that grants priority access to live events and galas worldwide.", cta: 'Buy Membership Card', soon: true,  hasPanel: false },
  { id: 'doc',     title: 'Exclusive Documentary', body: 'Watch the full-length documentary available only to members. Behind-the-scenes access to field work and impact stories. Runtime: 1h 28min.', cta: 'Watch Now', soon: false, hasPanel: false },
  { id: 'events',  title: 'Event Access',          body: 'Priority registration for upcoming forums, galas, and advocacy summits — with live countdowns to every event.', cta: 'View Events', soon: false, hasPanel: true  },
  { id: 'reports', title: 'Impact Reports',        body: 'Read detailed annual reports on how membership funds are used, lives impacted, and legislation influenced.', cta: 'Read Reports', soon: false, hasPanel: false },
  { id: 'gallery', title: 'Private Gallery',       body: 'Access the exclusive photo archive — behind-the-scenes moments, field work, galas, and advocacy campaigns from across 40+ countries.', cta: 'Open Gallery', soon: false, hasPanel: true  },
  { id: 'forum',   title: 'Member Forum',          body: 'Connect with other members, share ideas, and participate in discussions on equality, child protection, and climate action.', cta: 'Join Discussions', soon: true,  hasPanel: false },
];

export default function MembersArea() {
  const { user } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [activating, setActivating]             = useState(false);
  const [activePanel, setActivePanel]           = useState(null); // 'events' | 'gallery'

  useEffect(() => {
    axios.get('/api/membership/status')
      .then(res => setMembershipStatus(res.data))
      .catch(() => {});
  }, []);

  const activate = async () => {
    setActivating(true);
    try {
      await axios.post('/api/membership/activate');
      setMembershipStatus(prev => ({ ...prev, membershipActive: true }));
    } finally { setActivating(false); }
  };

  const handleCardClick = (card) => {
    if (card.soon) return;
    if (card.hasPanel) {
      setActivePanel(prev => prev === card.id ? null : card.id);
    }
  };

  return (
    <div className="members-page">

      {/* ── HEADER ───────────────────────────────────── */}
      <header className="members-header">
        <span className="members-eyebrow">Members Area</span>
        <h1 className="members-greeting">
          Welcome back, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="members-sub">
          {user?.email} · {user?.role === 'admin' ? 'Administrator' : 'Member'}
        </p>

        {membershipStatus && !membershipStatus.membershipActive && (
          <div className="members-status-inactive">
            <div className="members-status-inactive-text">
              <span className="members-status-inactive-tag">Activate Full Membership</span>
              <span className="members-status-inactive-desc">
                Unlock your physical card, events, and all premium content.
              </span>
            </div>
            <button
              className="members-status-inactive-btn"
              onClick={activate}
              disabled={activating}
            >
              {activating ? 'Activating...' : 'Activate Now'}
            </button>
          </div>
        )}

        {membershipStatus?.membershipActive && (
          <div className="members-status-active">
            <span className="members-status-active-dot" />
            <span className="members-status-active-text">Full Membership Active</span>
          </div>
        )}
      </header>

      {/* ── CARD GRID ────────────────────────────────── */}
      <div className="members-grid">
        {ALL_CARDS.map(card => (
          <div
            key={card.id}
            className={`members-card ${card.soon ? 'members-card--soon' : ''} ${activePanel === card.id ? 'members-card--active' : ''}`}
            onClick={() => handleCardClick(card)}
            style={{ cursor: card.soon ? 'default' : card.hasPanel ? 'pointer' : 'default' }}
          >
            {card.soon && <span className="members-card-badge">Coming Soon</span>}
            {activePanel === card.id && <span className="members-card-badge members-card-badge--open">Open ↑</span>}
            <h3 className="members-card-title">{card.title}</h3>
            <p className="members-card-body">{card.body}</p>
            {!card.soon && !card.hasPanel && (
              <button className="members-card-btn">{card.cta}</button>
            )}
            {!card.soon && card.hasPanel && (
              <button className="members-card-btn">
                {activePanel === card.id ? `Close ${card.title}` : card.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── EVENTS PANEL ─────────────────────────────── */}
      {activePanel === 'events' && (
        <section className="members-panel">
          <div className="members-panel-header">
            <h2 className="members-panel-title">Upcoming Events</h2>
            <button className="members-panel-close" onClick={() => setActivePanel(null)}>✕ Close</button>
          </div>
          <EventBoard />
        </section>
      )}

      {/* ── GALLERY PANEL ────────────────────────────── */}
      {activePanel === 'gallery' && (
        <section className="members-panel">
          <div className="members-panel-header">
            <h2 className="members-panel-title">Private Gallery</h2>
            <button className="members-panel-close" onClick={() => setActivePanel(null)}>✕ Close</button>
          </div>
          <PrivateGallery />
        </section>
      )}

    </div>
  );
}
ENDFILE
echo "MembersArea.jsx updated"
Output

MembersArea.jsx updated