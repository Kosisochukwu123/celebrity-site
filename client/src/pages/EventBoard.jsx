import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import '../styles/event-board.css';

const API = import.meta.env.VITE_BACKEND_URL;
const imgSrc = (url) => (!url ? null : url.startsWith('http') ? url : `${API}${url}`);

const CATEGORY_LABELS = {
  gala: 'Gala',
  forum: 'Global Forum',
  summit: 'Summit',
  screening: 'Screening',
  fundraiser: 'Fundraiser',
  other: 'Event',
};

const CATEGORY_COLORS = {
  gala:       '#C9A84C',
  forum:      '#4C8BC9',
  summit:     '#8B4CC9',
  screening:  '#C94C6B',
  fundraiser: '#4CC98B',
  other:      '#C0152A',
};

/* ── Countdown hook ──────────────────────────────────────── */
function useCountdown(targetDate) {
  const calc = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      over: false,
    };
  }, [targetDate]);

  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return time;
}

/* ── Countdown display ───────────────────────────────────── */
function CountdownUnit({ value, label }) {
  const display = String(value).padStart(2, '0');
  return (
    <div className="eb-cd-unit">
      <div className="eb-cd-digits">
        <span className="eb-cd-num">{display}</span>
      </div>
      <div className="eb-cd-label">{label}</div>
    </div>
  );
}

function Countdown({ date, status }) {
  const t = useCountdown(date);

  if (status === 'live') {
    return (
      <div className="eb-cd-live">
        <span className="eb-cd-live-dot" />
        Happening Now
      </div>
    );
  }
  if (t.over) {
    return <div className="eb-cd-over">Event has ended</div>;
  }
  return (
    <div className="eb-cd-wrap">
      <CountdownUnit value={t.days}    label="Days"    />
      <div className="eb-cd-sep">:</div>
      <CountdownUnit value={t.hours}   label="Hours"   />
      <div className="eb-cd-sep">:</div>
      <CountdownUnit value={t.minutes} label="Minutes" />
      <div className="eb-cd-sep">:</div>
      <CountdownUnit value={t.seconds} label="Seconds" />
    </div>
  );
}

/* ── Event detail modal ──────────────────────────────────── */
function EventModal({ event, onClose }) {
  const color = CATEGORY_COLORS[event.category] || '#C0152A';

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeStr = eventDate.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="eb-modal-backdrop" onClick={onClose}>
      <div className="eb-modal" onClick={e => e.stopPropagation()} style={{ '--event-color': color }}>
        <button className="eb-modal-close" onClick={onClose}>✕</button>

        {/* Cover image */}
        {event.coverImage && (
          <div className="eb-modal-cover">
            <img src={imgSrc(event.coverImage)} alt={event.title} />
            <div className="eb-modal-cover-overlay" />
            <div className="eb-modal-cover-meta">
              <span className="eb-modal-cat"
                style={{ background: color }}>
                {CATEGORY_LABELS[event.category]}
              </span>
              {event.status === 'live' && <span className="eb-modal-live-chip">● Live Now</span>}
            </div>
          </div>
        )}

        <div className="eb-modal-body">
          {!event.coverImage && (
            <span className="eb-modal-cat" style={{ background: color }}>
              {CATEGORY_LABELS[event.category]}
            </span>
          )}

          <h2 className="eb-modal-title">{event.title}</h2>
          {event.subtitle && <p className="eb-modal-subtitle">{event.subtitle}</p>}

          {/* Countdown inside modal */}
          <div className="eb-modal-countdown">
            <p className="eb-modal-countdown-label">
              {event.status === 'live' ? 'Status' : 'Countdown to event'}
            </p>
            <Countdown date={event.date} status={event.status} />
          </div>

          {/* Details grid */}
          <div className="eb-modal-details">
            <div className="eb-modal-detail-item">
              <svg className="eb-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <span className="eb-modal-detail-label">Date</span>
                <span className="eb-modal-detail-value">{dateStr}</span>
              </div>
            </div>
            <div className="eb-modal-detail-item">
              <svg className="eb-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <span className="eb-modal-detail-label">Time</span>
                <span className="eb-modal-detail-value">{timeStr} {event.timezone && `· ${event.timezone}`}</span>
              </div>
            </div>
            {event.venue && (
              <div className="eb-modal-detail-item">
                <svg className="eb-icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <span className="eb-modal-detail-label">Venue</span>
                  <span className="eb-modal-detail-value">{event.venue}{event.city ? `, ${event.city}` : ''}{event.country ? `, ${event.country}` : ''}</span>
                </div>
              </div>
            )}
            {event.ticketPrice && (
              <div className="eb-modal-detail-item">
                <svg className="eb-icon" viewBox="0 0 24 24"><path d="M20 12V6a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4m8-4v8"/></svg>
                <div>
                  <span className="eb-modal-detail-label">Tickets</span>
                  <span className="eb-modal-detail-value">{event.ticketPrice}</span>
                </div>
              </div>
            )}
            {event.capacity > 0 && (
              <div className="eb-modal-detail-item">
                <svg className="eb-icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                <div>
                  <span className="eb-modal-detail-label">Capacity</span>
                  <span className="eb-modal-detail-value">{event.capacity.toLocaleString()} guests</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="eb-modal-desc">
              <p>{event.description}</p>
            </div>
          )}

          {/* Highlights */}
          {event.highlights?.length > 0 && (
            <div className="eb-modal-highlights">
              <p className="eb-modal-highlights-title">What to Expect</p>
              <ul>
                {event.highlights.map((h, i) => (
                  <li key={i}>
                    <span className="eb-highlight-dot" style={{ background: color }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Map link */}
          {event.mapUrl && (
            <a className="eb-modal-map-btn" href={event.mapUrl} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Get Directions
            </a>
          )}

          {/* CTA */}
          <div className="eb-modal-actions">
            {event.ticketUrl
              ? <a className="eb-modal-cta" href={event.ticketUrl} target="_blank" rel="noreferrer"
                  style={{ background: color }}>
                  Register for this Event
                </a>
              : <button className="eb-modal-cta" style={{ background: color }}>
                  Register Interest
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Featured event hero card ────────────────────────────── */
function FeaturedEvent({ event, onClick }) {
  const color = CATEGORY_COLORS[event.category] || '#C0152A';
  const eventDate = new Date(event.date);

  return (
    <div className="eb-featured" onClick={onClick} style={{ '--event-color': color }}>
      {event.coverImage
        ? <img className="eb-featured-bg" src={imgSrc(event.coverImage)} alt={event.title} />
        : <div className="eb-featured-bg eb-featured-bg--placeholder" />
      }
      <div className="eb-featured-overlay" />

      <div className="eb-featured-content">
        <div className="eb-featured-top">
          <span className="eb-cat-chip" style={{ background: color }}>
            {CATEGORY_LABELS[event.category]}
          </span>
          {event.status === 'live' && <span className="eb-live-chip">● Live Now</span>}
        </div>

        <h2 className="eb-featured-title">{event.title}</h2>
        {event.subtitle && <p className="eb-featured-sub">{event.subtitle}</p>}

        <div className="eb-featured-meta">
          {event.venue && (
            <span className="eb-featured-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {event.venue}{event.city ? `, ${event.city}` : ''}
            </span>
          )}
          <span className="eb-featured-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="eb-featured-countdown">
          <p className="eb-featured-countdown-label">
            {event.status === 'live' ? 'Happening Now' : 'Starts in'}
          </p>
          <Countdown date={event.date} status={event.status} />
        </div>

        <button className="eb-featured-btn" style={{ background: color }}>
          View Event Details →
        </button>
      </div>
    </div>
  );
}

/* ── Small event card ────────────────────────────────────── */
function EventCard({ event, onClick }) {
  const color = CATEGORY_COLORS[event.category] || '#C0152A';
  const eventDate = new Date(event.date);

  return (
    <div className="eb-card" onClick={onClick} style={{ '--event-color': color }}>
      <div className="eb-card-image">
        {event.coverImage
          ? <img src={imgSrc(event.coverImage)} alt={event.title} />
          : <div className="eb-card-image-placeholder" style={{ '--event-color': color }} />
        }
        <span className="eb-card-cat" style={{ background: color }}>
          {CATEGORY_LABELS[event.category]}
        </span>
        {event.status === 'live' && <span className="eb-card-live">● Live</span>}
      </div>

      <div className="eb-card-body">
        <h3 className="eb-card-title">{event.title}</h3>

        <div className="eb-card-meta">
          {event.city && (
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {event.city}{event.country ? `, ${event.country}` : ''}
            </span>
          )}
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="eb-card-countdown">
          <Countdown date={event.date} status={event.status} />
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ──────────────────────────────────────── */
export default function EventBoard() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filter, setFilter]       = useState('all');

  useEffect(() => {
    axios.get(`${API}/api/events`)
      .then(res => setEvents(res.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = events.find(e => e.featured) || events[0];
  const others   = events.filter(e => e._id !== featured?._id);

  const categories = ['all', ...new Set(events.map(e => e.category))];
  const filtered = filter === 'all' ? others : others.filter(e => e.category === filter);

  if (loading) {
    return (
      <div className="eb-loading">
        <div className="eb-loading-spinner" />
        <p>Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="eb-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.2)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <h3>No upcoming events</h3>
        <p>Check back soon — new events will be announced exclusively to members first.</p>
      </div>
    );
  }

  return (
    <div className="eb-wrap">

      {/* Featured hero */}
      {featured && (
        <FeaturedEvent
          event={featured}
          onClick={() => setSelected(featured)}
        />
      )}

      {/* Filter tabs */}
      {categories.length > 2 && (
        <div className="eb-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`eb-filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All Events' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid of other events */}
      {filtered.length > 0 && (
        <div className="eb-grid">
          {filtered.map(event => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => setSelected(event)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <EventModal event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}