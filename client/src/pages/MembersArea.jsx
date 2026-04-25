import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EventBoard from '../components/AdminEventManager';
import PrivateGallery from '../components/PrivateGallery';
import '../styles/members.css';
import { useNavigate } from 'react-router-dom';

const CARDS = [
  { id: 'card', routes: '/membership', title: 'Membership Card', body: "Purchase your official physical membership card — a collector's item that grants priority access to live events and galas worldwide.", cta: 'Buy Membership Card', soon: false, hasPanel: false },
  { id: 'doc', routes: '/membership/doc', title: 'Exclusive Documentary', body: 'Watch the full-length documentary available only to members. Behind-the-scenes access to field work and impact stories. Runtime: 1h 28min.', cta: 'Watch Now', soon: true, hasPanel: false },
  { id: 'events', routes: '/membership/events', title: 'Event Access', body: 'Priority registration for upcoming forums, galas, and advocacy summits. Members get first access before public announcements.', cta: 'View Events', soon: false, hasPanel: false },
  { id: 'reports', routes: '/membership/reports', title: 'Impact Reports', body: 'Read detailed annual reports on how membership funds are used, lives impacted, legislation influenced, and goals ahead.', cta: 'Read Reports', soon: false, hasPanel: false },
  { id: 'gallery', routes: '/membership/gallery', title: 'Private Gallery', body: 'Access the private photo and video archive from field work, events, and advocacy campaigns across 40+ countries.', cta: 'Open Gallery', soon: false, hasPanel: false },
  { id: 'forum', routes: '/membership/forum', title: 'Member Forum', body: 'Connect with other members, share ideas, and participate in discussions on equality, child protection, and climate action.', cta: 'Join Discussions', soon: true, hasPanel: false },
];

const API = import.meta.env.VITE_BACKEND_URL;

export default function MembersArea() {
  const { user } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [activating, setActivating] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'events' | 'gallery'
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/membership/status`)
      .then(res => setMembershipStatus(res.data))
      .catch(() => {});
  }, []);

  const activate = async () => {
    setActivating(true);
    try {
      await axios.post(`${API}/api/membership/activate`);
      setMembershipStatus(prev => ({ ...prev, membershipActive: true }));
    } finally {
      setActivating(false);
    }
  };

  const handleCardClick = (card) => {
    if (card.soon) return;
    if (card.hasPanel) {
      setActivePanel(prev => prev === card.id ? null : card.id);
    } else {
      navigate(card.routes);
    }
  };

  return (
    <div className="members-page">

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

      <div className="members-grid">
        {CARDS.map(({ id, routes, title, body, cta, soon, hasPanel }) => (
          <div
            key={id}
            className={`members-card ${soon ? 'members-card--soon' : ''} ${activePanel === id ? 'members-card--active' : ''}`}
            onClick={() => handleCardClick({ id, routes, soon, hasPanel })}
            style={{ cursor: soon ? 'default' : hasPanel ? 'pointer' : 'pointer' }}
          >
            {soon && <span className="members-card-badge">Coming Soon</span>}
            {activePanel === id && <span className="members-card-badge members-card-badge--open">Open ↑</span>}
            <h3 className="members-card-title">{title}</h3>
            <p className="members-card-body">{body}</p>
            {!soon && !hasPanel && (
              <button className="members-card-btn" onClick={() => navigate(routes)}>
                {cta}
              </button>
            )}
            {!soon && hasPanel && (
              <button className="members-card-btn">
                {activePanel === id ? `Close ${title}` : cta}
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