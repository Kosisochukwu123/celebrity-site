import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/membership.css";
import PaymentModal from "../components/PaymentModal";

/* ── TIER DATA ──────────────────────────────────────────────────────────── */
const TIERS = [
  {
    id: "silver",
    name: "Silver",
    sub: "Member",
    price: "$49",
    period: "/ year",
    tag: "Foundation Member",
    desc: "Begin your journey as an advocate. Access essential content, newsletters, and community forums.",
    cardClass: "mem-card--silver",
    btnClass: "mem-cta-btn--silver",
    watermark: "MEMBER",
    stars: 2,
    benefits: [
      {
        name: "Member Newsletter",
        desc: "Monthly advocacy updates",
        badge: null,
        icon: "newsletter",
      },
      {
        name: "Digital Card",
        desc: "Official digital ID",
        badge: "Free",
        icon: "card",
      },
      {
        name: "Community Forum",
        desc: "Connect with members",
        badge: null,
        icon: "forum",
      },
      {
        name: "Impact Reports",
        desc: "Annual PDF reports",
        badge: null,
        icon: "report",
      },
      {
        name: "Event Updates",
        desc: "Early event notices",
        badge: null,
        icon: "event",
      },
      {
        name: "Online Screenings",
        desc: "Select documentaries",
        badge: null,
        icon: "film",
      },
    ],
    compareCol: 0,
  },
  {
    id: "gold",
    name: "Gold",
    sub: "5-Star Member",
    price: "$149",
    period: "/ year",
    tag: "Premier Member",
    desc: "Elevated access for dedicated advocates. Priority events, exclusive content, and a physical membership card.",
    cardClass: "mem-card--gold",
    btnClass: "mem-cta-btn--gold",
    watermark: "PREMIER",
    stars: 4,
    benefits: [
      {
        name: "All Silver",
        desc: "Everything in Silver",
        badge: null,
        icon: "check",
      },
      {
        name: "Physical Card",
        desc: "Collector's edition card",
        badge: "Free",
        icon: "card",
      },
      {
        name: "Priority Events",
        desc: "First-access registration",
        badge: "Excl",
        icon: "star",
      },
      {
        name: "Full Library",
        desc: "All documentaries",
        badge: null,
        icon: "film",
      },
      {
        name: "Private Gallery",
        desc: "Behind-the-scenes archive",
        badge: "Excl",
        icon: "gallery",
      },
      {
        name: "Quarterly Call",
        desc: "Live Q&A with team",
        badge: "Excl",
        icon: "call",
      },
    ],
    compareCol: 1,
  },
  {
    id: "black",
    name: "Elite",
    sub: "Founding Member",
    price: "$499",
    period: "/ year",
    tag: "Elite Founding Member",
    desc: "The pinnacle of membership. Rare, exclusive, and reserved for those committed to leading change at the highest level.",
    cardClass: "mem-card--black",
    btnClass: "mem-cta-btn--black",
    watermark: "ELITE",
    stars: 5,
    benefits: [
      {
        name: "All Gold",
        desc: "Everything in Gold",
        badge: null,
        icon: "check",
      },
      {
        name: "VIP Events",
        desc: "Galas & private dinners",
        badge: "Excl",
        icon: "vip",
      },
      {
        name: "Name on Wall",
        desc: "Foundation donor wall",
        badge: "Excl",
        icon: "honor",
      },
      {
        name: "Meet & Greet",
        desc: "Annual private session",
        badge: "Excl",
        icon: "star",
      },
      {
        name: "Legal Fund",
        desc: "Priority case support",
        badge: "Excl",
        icon: "legal",
      },
      {
        name: "Founding Plaque",
        desc: "Personalised keepsake",
        badge: "Free",
        icon: "award",
      },
    ],
    compareCol: 2,
  },
];

const COMPARE_ROWS = [
  { label: "Digital Membership Card", vals: [true, true, true] },
  { label: "Physical Card", vals: [false, true, true] },
  { label: "Monthly Newsletter", vals: [true, true, true] },
  { label: "Full Documentary Library", vals: [false, true, true] },
  { label: "Priority Event Access", vals: [false, true, true] },
  { label: "Private Gallery", vals: [false, true, true] },
  { label: "Quarterly Live Q&A", vals: [false, true, true] },
  { label: "VIP Galas & Dinners", vals: [false, false, true] },
  { label: "Meet & Greet Session", vals: [false, false, true] },
  { label: "Founding Donor Wall", vals: [false, false, true] },
  { label: "Legal Fund Priority", vals: [false, false, true] },
];

/* ── ICONS ──────────────────────────────────────────────────────────────── */
function BenefitIcon({ type, color }) {
  const s = {
    stroke: color,
    fill: "none",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const icons = {
    newsletter: (
      <>
        <rect x="3" y="5" width="14" height="14" rx="2" {...s} />
        <path d="M7 9h6M7 12h4" {...s} />
      </>
    ),
    card: (
      <>
        <rect x="2" y="5" width="16" height="12" rx="2" {...s} />
        <path d="M2 9h16" {...s} />
      </>
    ),
    forum: (
      <>
        <path d="M4 4h12v10H4z" {...s} />
        <path d="M8 18l2-4h6l2 4" {...s} />
      </>
    ),
    report: (
      <>
        <path d="M6 2h8l4 4v14H6V2z" {...s} />
        <path d="M14 2v4h4M9 10h6M9 13h6M9 16h4" {...s} />
      </>
    ),
    event: (
      <>
        <rect x="3" y="4" width="14" height="14" rx="2" {...s} />
        <path d="M7 2v2M13 2v2M3 10h14" {...s} />
      </>
    ),
    film: (
      <>
        <rect x="2" y="5" width="16" height="12" rx="2" {...s} />
        <path
          d="M2 9h16M2 13h16M6 5v2M10 5v2M14 5v2M6 13v2M10 13v2M14 13v2"
          {...s}
        />
      </>
    ),
    check: (
      <>
        <path d="M4 10l5 5 8-8" {...s} />
      </>
    ),
    star: (
      <>
        <path
          d="M10 2l2.4 4.8 5.3.8-3.8 3.7.9 5.2L10 14l-4.8 2.5.9-5.2L2.3 7.6l5.3-.8L10 2z"
          {...s}
        />
      </>
    ),
    gallery: (
      <>
        <rect x="3" y="3" width="14" height="14" rx="2" {...s} />
        <circle cx="7.5" cy="7.5" r="1.5" {...s} />
        <path d="M3 14l4-4 3 3 2-2 5 5" {...s} />
      </>
    ),
    call: (
      <>
        <path
          d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-1z"
          {...s}
        />
      </>
    ),
    vip: (
      <>
        <path d="M3 7l7 10 7-10H3z" {...s} />
        <path d="M3 7h14" {...s} />
      </>
    ),
    honor: (
      <>
        <circle cx="10" cy="8" r="5" {...s} />
        <path d="M6.5 14.5L5 19l5-2 5 2-1.5-4.5" {...s} />
      </>
    ),
    legal: (
      <>
        <path
          d="M10 2l1.5 4.5H16L12 9.5l1.5 4.5L10 11l-3.5 3 1.5-4.5L4 7h4.5L10 2z"
          {...s}
        />
      </>
    ),
    award: (
      <>
        <path
          d="M6 9H4a2 2 0 00-2 2v7h16v-7a2 2 0 00-2-2h-2M10 3v6M7 6l3-3 3 3"
          {...s}
        />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 20 20" width="20" height="20">
      {icons[type] || icons.check}
    </svg>
  );
}

/* ── BADGE SVG (hexagon + stars + M letter) ─────────────────────────────── */
function CardBadge({ stars }) {
  const starPositions = [
    [26, 14],
    [34, 14],
    [18, 22],
    [26, 22],
    [34, 22],
  ].slice(0, stars);

  return (
    <svg className="mem-card-badge" viewBox="0 0 52 60">
      {/* Hexagon */}
      <polygon
        className="mem-card-badge-hex"
        points="26,4 48,16 48,40 26,52 4,40 4,16"
        strokeWidth="1.5"
      />
      {/* Stars */}
      {starPositions.map(([x, y], i) => (
        <polygon
          key={i}
          className="mem-card-badge-stars"
          points={`${x},${y - 3} ${x + 1.2},${y - 0.5} ${x + 3},${y - 0.5} ${x + 1.5},${y + 1} ${x + 2},${y + 3} ${x},${y + 1.8} ${x - 2},${y + 3} ${x - 1.5},${y + 1} ${x - 3},${y - 0.5} ${x - 1.2},${y - 0.5}`}
        />
      ))}
      {/* M letter */}
      <text
        className="mem-card-badge-letter"
        x="26"
        y="50"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Cormorant Garamond, serif"
        fontWeight="700"
      >
        M
      </text>
    </svg>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function MembershipPage() {
  const [active, setActive] = useState(1); // start on Gold (index 1)
  const [paymentTier, setPaymentTier] = useState(null);
  const trackRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const goTo = (idx) => {
    if (idx < 0 || idx > TIERS.length - 1) return;
    setActive(idx);
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${idx * 100}%)`;
    }
  };

  // Touch / swipe support
  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? active + 1 : active - 1);
    touchStart.current = null;
  };

  const tier = TIERS[active];
  const iconColor =
    active === 0 ? "#C8C8C8" : active === 1 ? "#C9A84C" : "#E8C97A";

  const handlePurchase = () => {
    if (!user) {
      navigate("/login");
    } else {
      setPaymentTier(tier);
    }
  };

  return (
    <div className="membership-page">
      {/* ── HEADER ─────────────────────────────────────── */}
      <header className="mem-header">
        <p className="mem-eyebrow">Alex Sterling Foundation</p>
        <h1 className="mem-title">
          Choose Your
          <br />
          <em>Membership</em>
        </h1>
        <p className="mem-subtitle">
          Every tier directly funds equal rights, child protection, and climate
          action. Select the level that matches your commitment.
        </p>
      </header>

      {/* ── CARD CAROUSEL ──────────────────────────────── */}
      <section className="mem-carousel-section">
        <div
          className="mem-carousel-track-outer"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="mem-carousel-track"
            ref={trackRef}
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {TIERS.map((t) => (
              <div key={t.id} className="mem-card-slide">
                <div className={`mem-card ${t.cardClass}`}>
                  <div className="mem-card-pattern" />
                  <div className="mem-card-shine" />
                  <div className="mem-card-watermark">{t.watermark}</div>
                  <div className="mem-card-inner">
                    <div className="mem-card-top">
                      <div>
                        <div className="mem-card-tier-name">{t.name}</div>
                        <div className="mem-card-tier-sub">{t.sub}</div>
                      </div>
                      <CardBadge stars={t.stars} />
                    </div>
                    <div className="mem-card-bottom">
                      <div className="mem-card-price">
                        <span className="mem-card-price-val">{t.price}</span>
                        <span className="mem-card-price-period">
                          {t.period}
                        </span>
                      </div>
                      <div className="mem-card-chip" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="mem-dots">
          {TIERS.map((_, i) => (
            <button
              key={i}
              className={`mem-dot ${i === active ? "active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to ${TIERS[i].name} tier`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="mem-arrows">
          <button
            className="mem-arrow"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
          >
            ←
          </button>
          <button
            className="mem-arrow"
            onClick={() => goTo(active + 1)}
            disabled={active === TIERS.length - 1}
          >
            →
          </button>
        </div>
      </section>

      {/* ── TIER LABEL ─────────────────────────────────── */}
      <div className="mem-tier-label">
        <div className="mem-tier-label-tag">{tier.tag}</div>
        <div className="mem-tier-label-name">{tier.name} Membership</div>
        <p className="mem-tier-label-desc">{tier.desc}</p>
      </div>

      {/* ── DIVIDER ────────────────────────────────────── */}
      <div className="mem-divider">
        <div className="mem-divider-line" />
        <span className="mem-divider-text">Member Benefits</span>
        <div className="mem-divider-line" />
      </div>

      {/* ── BENEFITS GRID ──────────────────────────────── */}
      <section className="mem-benefits">
        <div className="mem-benefits-grid">
          {tier.benefits.map((b) => (
            <div key={b.name} className="mem-benefit-item">
              {b.badge && (
                <span
                  className={`mem-benefit-badge mem-benefit-badge--${b.badge === "Free" ? "free" : "excl"}`}
                >
                  {b.badge}
                </span>
              )}
              <div className="mem-benefit-icon">
                <BenefitIcon type={b.icon} color={iconColor} />
              </div>
              <div className="mem-benefit-name">{b.name}</div>
              <div className="mem-benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <div className="mem-cta-section">
        <button
          className={`mem-cta-btn ${tier.btnClass}`}
          onClick={handlePurchase}
        >
          Get {tier.name} Membership — {tier.price}
        </button>
        <p className="mem-cta-note">
          Secure checkout · Cancel anytime · All funds support the causes
        </p>
      </div>

      {/* ── COMPARE TABLE ──────────────────────────────── */}
      <div className="mem-compare">
        <h3 className="mem-compare-title">Compare All Tiers</h3>
        <table className="mem-compare-table">
          <thead>
            <tr>
              <th>Benefit</th>
              {TIERS.map((t, i) => (
                <th
                  key={t.id}
                  className={i === active ? "active-col" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={() => goTo(i)}
                >
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                {row.vals.map((v, i) => (
                  <td key={i} className={i === active ? "active-col" : ""}>
                    {v ? (
                      <span className="mem-check">✦</span>
                    ) : (
                      <span className="mem-cross">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paymentTier && (
        <PaymentModal tier={paymentTier} onClose={() => setPaymentTier(null)} />
      )}
    </div>
  );
}
