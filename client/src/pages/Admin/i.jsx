bash

cat /home/claude/celebrity-site/client/src/pages/MembersArea.jsx
Output

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/members.css';

const CARDS = [
  { id: 'card',    title: 'Membership Card',      body: "Purchase your official physical membership card — a collector's item that grants priority access to live events and galas worldwide.", cta: 'Buy Membership Card', soon: true },
  { id: 'doc',     title: 'Exclusive Documentary', body: 'Watch the full-length documentary available only to members. Behind-the-scenes access to field work and impact stories. Runtime: 1h 28min.', cta: 'Watch Now', soon: false },
  { id: 'events',  title: 'Event Access',          body: 'Priority registration for upcoming forums, galas, and advocacy summits. Members get first access before public announcements.', cta: 'View Events', soon: true },
  { id: 'reports', title: 'Impact Reports',        body: 'Read detailed annual reports on how membership funds are used, lives impacted, legislation influenced, and goals ahead.', cta: 'Read Reports', soon: false },
  { id: 'gallery', title: 'Private Gallery',       body: 'Access the private photo and video archive from field work, events, and advocacy campaigns across 40+ countries.', cta: 'Open Gallery', soon: true },
  { id: 'forum',   title: 'Member Forum',          body: 'Connect with other members, share ideas, and participate in discussions on equality, child protection, and climate action.', cta: 'Join Discussions', soon: true },
];

export default function MembersArea() {
  const { user } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    axios.get('/api/membership/status').then(res => setMembershipStatus(res.data)).catch(() => {});
  }, []);

  const activate = async () => {
    setActivating(true);
    try {
      await axios.post('/api/membership/activate');
      setMembershipStatus(prev => ({ ...prev, membershipActive: true }));
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="members-page">
      <header className="members-header">
        <span className="members-eyebrow">Members Area</span>
        <h1 className="members-greeting">
          Welcome back, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="members-sub">{user?.email} · {user?.role === 'admin' ? 'Administrator' : 'Member'}</p>

        {membershipStatus && !membershipStatus.membershipActive && (
          <div className="members-status-inactive">
            <div className="members-status-inactive-text">
              <span className="members-status-inactive-tag">Activate Full Membership</span>
              <span className="members-status-inactive-desc">Unlock your physical card, events, and all premium content.</span>
            </div>
            <button className="members-status-inactive-btn" onClick={activate} disabled={activating}>
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
        {CARDS.map(({ id, title, body, cta, soon }) => (
          <div key={id} className="members-card">
            {soon && <span className="members-card-badge">Coming Soon</span>}
            <h3 className="members-card-title">{title}</h3>
            <p className="members-card-body">{body}</p>
            <button className="members-card-btn" disabled={soon}>{cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
