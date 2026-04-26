import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/notification-bar.css';


const API = import.meta.env.VITE_BACKEND_URL;

export default function NotificationBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('dismissed_notifs') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    if (!user || user.role === 'admin') return;

    // Poll for payment updates every 60s
    const check = async () => {
      try {
        const res = await axios.get(`${API}/api/payments/my`);
        const payments = res.data;

        const notifs = [];

        // Pending payments
        const pending = payments.filter(p => p.status === 'pending');
        if (pending.length > 0) {
          notifs.push({
            id:   `pending-${pending[0]._id}`,
            type: 'pending',
            text: `Your ${pending[0].tierLabel || pending[0].tier} membership payment is under review.`,
            sub:  'Our team will verify it within 24–48 hours.',
            cta:  'View Status',
            path: '/settings',
          });
        }

        // Newly approved (approved and membership just became active)
        const approved = payments.filter(p => p.status === 'approved');
        approved.forEach(p => {
          const notifId = `approved-${p._id}`;
          notifs.push({
            id:   notifId,
            type: 'approved',
            text: `🎉 Your ${p.tierLabel || p.tier} membership is now active!`,
            sub:  'Full access has been unlocked.',
            cta:  'Go to Members Area',
            path: '/members',
          });
        });

        // Rejected payments
        const rejected = payments.filter(p => p.status === 'rejected');
        rejected.forEach(p => {
          notifs.push({
            id:   `rejected-${p._id}`,
            type: 'rejected',
            text: `Your ${p.tierLabel || p.tier} membership payment was not approved.`,
            sub:  p.adminNote ? `"${p.adminNote}"` : 'Please resubmit with correct details.',
            cta:  'Try Again',
            path: '/membership',
          });
        });

        // Filter out dismissed ones
        setNotifications(notifs.filter(n => !dismissed.includes(n.id)));
      } catch { /* silent */ }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [user, dismissed]);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    sessionStorage.setItem('dismissed_notifs', JSON.stringify(next));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!user || user.role === 'admin' || notifications.length === 0) return null;

  return (
    <div className="notif-bar-wrap">
      {notifications.map(n => (
        <div key={n.id} className={`notif-bar notif-bar--${n.type}`}>
          <div className="notif-bar-icon">
            {n.type === 'pending'  && <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><polyline points="10 6 10 10 13 12"/></svg>}
            {n.type === 'approved' && <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><polyline points="6 10 9 13 14 8"/></svg>}
            {n.type === 'rejected' && <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><line x1="7" y1="7" x2="13" y2="13"/><line x1="13" y1="7" x2="7" y2="13"/></svg>}
          </div>
          <div className="notif-bar-text">
            <span className="notif-bar-main">{n.text}</span>
            {n.sub && <span className="notif-bar-sub">{n.sub}</span>}
          </div>
          <button className="notif-bar-cta" onClick={() => { navigate(n.path); dismiss(n.id); }}>
            {n.cta}
          </button>
          <button className="notif-bar-dismiss" onClick={() => dismiss(n.id)} aria-label="Dismiss">✕</button>
        </div>
      ))}
    </div>
  );
}