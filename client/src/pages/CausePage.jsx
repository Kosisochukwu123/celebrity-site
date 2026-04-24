import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/cause-page.css";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

console.log("API:", API);

const imgSrc = (url) =>
  !url ? null : url.startsWith("http") ? url : `${API}${url}`;

/* ── Static cause content ─────────────────────────────────── */
const CAUSE_DATA = {
  1: {
    sectionId: "cause_1",
    color: "#1B4D8E",
    accentLight: "rgba(27,77,142,0.12)",
    tag: "Human Rights",
    defaultHeading: "Equal Rights for All",
    defaultSubheading: "Because every human life carries the same worth.",
    defaultBody: `For nearly two decades, Alex Sterling has stood at the intersection of art and activism — using his global platform to amplify voices that power rarely hears. The fight for equal rights is not a political abstraction. It is the daily reality of billions of people who face discrimination because of their gender, sexuality, ethnicity, disability, or religion.

Alex's foundation works directly with lawmakers, legal aid organisations, and frontline advocacy groups in more than 40 countries. Since 2006, we have contributed research, funding, and public pressure to 34 pieces of landmark legislation — from anti-discrimination employment law in Kenya to transgender identity protection acts in South America.`,
    defaultBody2: `We believe change happens at every level simultaneously. At the international level, our team participates in UN Human Rights Council sessions, submitting shadow reports and lobbying member states. At the national level, we fund legal challenges to discriminatory legislation. At the community level, we train local advocates and build coalitions between historically divided groups.

No cause is too small. No community is too marginalised. Every year our Annual Global Forum brings together over 2,000 activists, lawmakers, survivors, and citizens from 60+ countries to share strategies, celebrate wins, and recommit to the long road ahead.`,
    stats: [
      { value: "34", label: "Laws Changed" },
      { value: "40+", label: "Countries" },
      { value: "2,000+", label: "Annual Forum Attendees" },
      { value: "18", label: "Years of Work" },
    ],
    milestones: [
      {
        year: "2006",
        event:
          "Foundation established with focus on LGBTQ+ protections in Sub-Saharan Africa.",
      },
      {
        year: "2009",
        event:
          "First landmark bill co-authored — Anti-Discrimination Employment Act, Kenya.",
      },
      {
        year: "2013",
        event:
          "Expanded mandate to include gender equality and disability rights globally.",
      },
      {
        year: "2017",
        event:
          "Partnered with 120 NGOs across 5 continents for coordinated advocacy campaigns.",
      },
      {
        year: "2020",
        event:
          "Launched digital legal aid platform serving 50,000+ users in 28 languages.",
      },
      {
        year: "2023",
        event:
          "Addressed UN General Assembly; secured commitments from 12 member states.",
      },
    ],
  },
  2: {
    sectionId: "cause_2",
    color: "#8B3A3A",
    accentLight: "rgba(139,58,58,0.12)",
    tag: "Child Safety",
    defaultHeading: "Child Protection",
    defaultSubheading: "Every child deserves safety, love, and a future.",
    defaultBody: `Children cannot advocate for themselves. They depend on the adults around them — and when those adults fail, they need organisations willing to step into the breach. Alex Sterling's Child Safety Initiative was born from a single visit to a refugee camp in 2010 where he met children who had survived unimaginable abuse with no legal recourse, no shelter, and no support system.

That encounter changed the direction of the foundation permanently. Today the Child Safety Initiative operates in 28 countries, funding emergency shelters that can house over 3,000 children at any given time, legal representation programmes for abuse survivors navigating complex court systems, and school-building projects in conflict zones where education has been disrupted by war or natural disaster.`,
    defaultBody2: `Our approach is holistic because trauma is holistic. We don't just remove a child from danger — we wrap around them with medical care, psychological support, education, and long-term case management. We train thousands of local child protection officers each year, because sustainable safety requires local capacity, not just international intervention.

We also work upstream — lobbying governments to close legal loopholes that enable exploitation, funding research into early-warning indicators of abuse, and running public awareness campaigns that shift the cultural attitudes that allow abuse to persist in silence.`,
    stats: [
      { value: "140K+", label: "Children Supported" },
      { value: "28", label: "Countries Active" },
      { value: "3,000", label: "Shelter Capacity" },
      { value: "8,000+", label: "Legal Cases Aided (2023)" },
    ],
    milestones: [
      {
        year: "2010",
        event:
          "Alex visits Azraq refugee camp — Child Safety Initiative founded within 6 months.",
      },
      {
        year: "2011",
        event:
          "First emergency shelter opened in Nairobi, capacity 80 children.",
      },
      {
        year: "2014",
        event:
          "Sterling Child Safety Act drafted and submitted to 15 national parliaments.",
      },
      {
        year: "2018",
        event:
          "Act ratified in 12 nations; legal aid programme reaches 50,000 cases.",
      },
      {
        year: "2021",
        event:
          "Digital case-management system launched, used by 4,200 social workers.",
      },
      {
        year: "2023",
        event:
          "140,000th child milestone reached; expanded into Southeast Asia.",
      },
    ],
  },
  3: {
    sectionId: "cause_3",
    color: "#1A5C2A",
    accentLight: "rgba(26,92,42,0.12)",
    tag: "Climate Action",
    defaultHeading: "Saving the Planet",
    defaultSubheading:
      "The climate crisis is not tomorrow's problem. It is today's emergency.",
    defaultBody: `Alex Sterling has been at the frontlines of climate advocacy since before it was fashionable. His first public arrest came in 2008 outside a coal plant in West Virginia. His most recent was in 2023 outside a Paris oil company headquarters. In between, he has testified before the US Senate, addressed three consecutive COP summits, and helped negotiate binding corporate commitments that most thought impossible.

The foundation's Climate Action arm operates across three pillars: direct environmental action, corporate accountability, and policy advocacy. On the direct action side, our reforestation teams have planted over 2 million trees across sub-Saharan Africa and Southeast Asia, working with local cooperatives to ensure trees are planted where ecosystems need them most — not where the optics are best.`,
    defaultBody2: `Our ocean conservation fleet — four vessels operating across the Pacific, Atlantic, and Indian Oceans — has removed over 400 tonnes of plastic from international waters since 2016. We don't just collect plastic; we bring it to shore and work with recycling facilities to turn it into construction materials for communities that need housing.

On the policy front, our team has secured binding net-zero commitments from 12 major corporations and contributed directly to language in the 2022 Global Methane Pledge. We believe corporations must be held accountable not just through public pressure but through legally binding targets — and we pursue both simultaneously.`,
    stats: [
      { value: "2M+", label: "Trees Planted" },
      { value: "400t", label: "Ocean Plastic Removed" },
      { value: "12", label: "Corporate Net-Zero Deals" },
      { value: "3", label: "COP Summits Addressed" },
    ],
    milestones: [
      {
        year: "2008",
        event:
          "Alex arrested at West Virginia coal plant protest — climate focus begins.",
      },
      {
        year: "2012",
        event:
          "Ocean conservation fleet launched; first vessel deployed in Pacific.",
      },
      {
        year: "2016",
        event:
          "Reforestation programme begins in sub-Saharan Africa with 50,000 trees.",
      },
      {
        year: "2019",
        event:
          "Addressed COP25 in Madrid; 100 tonne ocean plastic milestone reached.",
      },
      {
        year: "2022",
        event: "Secured 12 corporate net-zero commitments at COP27.",
      },
      {
        year: "2024",
        event:
          "2 million trees and 400 tonne ocean plastic milestones both reached.",
      },
    ],
  },
};


export default function CausePage() {
  const { id } = useParams(); // "1", "2", or "3"
  const navigate = useNavigate();
  const cause = CAUSE_DATA[id];
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { url, caption, index }
  const [lbImages, setLbImages] = useState([]);

  useEffect(() => {
    if (!cause) return;
    axios
      .get(`/api/content/${cause.sectionId}`)
      .then((res) => setContent(res.data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [id, cause]);

  // Close lightbox on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (!lightbox) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "ArrowLeft") prevImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, lbImages]);

  const openLightbox = useCallback((images, index) => {
    setLbImages(images);
    setLightbox({ ...images[index], index });
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = "";
  };

  const nextImg = useCallback(() => {
    if (!lbImages.length) return;
    const next = (lightbox.index + 1) % lbImages.length;
    setLightbox({ ...lbImages[next], index: next });
  }, [lightbox, lbImages]);

  const prevImg = useCallback(() => {
    if (!lbImages.length) return;
    const prev = (lightbox.index - 1 + lbImages.length) % lbImages.length;
    setLightbox({ ...lbImages[prev], index: prev });
  }, [lightbox, lbImages]);

  if (!cause) {
    return (
      <div className="cause-not-found">
        <h2>Cause not found</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cause-loading">
        <span />
        <span />
        <span />
      </div>
    );
  }

  const heading = content?.heading || cause.defaultHeading;
  const subheading = content?.subheading || cause.defaultSubheading;
  const body = content?.body || cause.defaultBody;
  const coverImg = imgSrc(content?.imageUrl);
  const gallery = (content?.images || []).map((img) => ({
    ...img,
    url: imgSrc(img.url),
  }));
  const stats = content?.stats?.length ? content.stats : cause.stats;

  return (
    <div
      className="cause-page"
      style={{
        "--cause-color": cause.color,
        "--cause-accent": cause.accentLight,
      }}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="cause-hero">
        {coverImg ? (
          <img className="cause-hero-bg" src={coverImg} alt={heading} />
        ) : (
          <div className="cause-hero-bg cause-hero-bg--placeholder" />
        )}
        <div className="cause-hero-overlay" />
        <div className="cause-hero-content">
          <button
            className="cause-back-btn"
            onClick={() => navigate("/#causes")}
          >
            ← Back to Causes
          </button>
          <span className="cause-tag">{cause.tag}</span>
          <h1 className="cause-hero-heading">{heading}</h1>
          <p className="cause-hero-sub">{subheading}</p>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <div className="cause-stats-bar">
        {stats.map((s, i) => (
          <div key={i} className="cause-stat">
            <div className="cause-stat-value">{s.value}</div>
            <div className="cause-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN BODY ────────────────────────────────────── */}
      <div className="cause-container">
        {/* Article — first body block */}
        <article className="cause-article">
          {body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Gallery — first 3 images as featured row */}
        {gallery.length > 0 && (
          <section className="cause-gallery-featured">
            <div
              className={`cause-gallery-featured-grid cause-gallery-featured-grid--${Math.min(gallery.length, 3)}`}
            >
              {gallery.slice(0, 3).map((img, i) => (
                <div
                  key={img._id || i}
                  className="cause-gallery-featured-item"
                  onClick={() => openLightbox(gallery, i)}
                >
                  <img src={img.url} alt={img.caption || heading} />
                  <div className="cause-gallery-item-overlay">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  {img.caption && (
                    <div className="cause-gallery-caption">{img.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Article — second body block */}
        <article className="cause-article">
          {cause.defaultBody2.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        {/* Timeline */}
        <section className="cause-timeline">
          <h2 className="cause-section-heading">Our Journey</h2>
          <div className="cause-timeline-list">
            {cause.milestones.map((m, i) => (
              <div key={i} className="cause-timeline-item">
                <div className="cause-timeline-year">{m.year}</div>
                <div className="cause-timeline-dot" />
                <div className="cause-timeline-text">{m.event}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Full gallery grid — images 4+ */}
        {gallery.length > 3 && (
          <section className="cause-gallery-full">
            <h2 className="cause-section-heading">Gallery</h2>
            <div className="cause-gallery-grid">
              {gallery.map((img, i) => (
                <div
                  key={img._id || i}
                  className="cause-gallery-grid-item"
                  onClick={() => openLightbox(gallery, i)}
                >
                  <img src={img.url} alt={img.caption || `Photo ${i + 1}`} />
                  <div className="cause-gallery-item-overlay">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  {img.caption && (
                    <div className="cause-gallery-caption">{img.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="cause-cta">
          <h2 className="cause-cta-heading">Ready to Make a Difference?</h2>
          <p className="cause-cta-body">
            Join thousands of members funding this cause directly. Every
            membership tier contributes to this work.
          </p>
          <div className="cause-cta-actions">
            <button
              className="btn btn--primary"
              onClick={() => navigate("/membership")}
            >
              Become a Member
            </button>
            <button
              className="btn btn--outline"
              onClick={() => navigate("/#causes")}
            >
              View All Causes
            </button>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────── */}
      {lightbox && (
        <div className="cause-lightbox" onClick={closeLightbox}>
          <button className="cause-lightbox-close" onClick={closeLightbox}>
            ✕
          </button>
          <button
            className="cause-lightbox-arrow cause-lightbox-arrow--prev"
            onClick={(e) => {
              e.stopPropagation();
              prevImg();
            }}
          >
            ‹
          </button>
          <div
            className="cause-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={imgSrc(lightbox.url)} alt={lightbox.caption || ""} />
            {lightbox.caption && (
              <p className="cause-lightbox-caption">{lightbox.caption}</p>
            )}
            <p className="cause-lightbox-count">
              {lightbox.index + 1} / {lbImages.length}
            </p>
          </div>
          <button
            className="cause-lightbox-arrow cause-lightbox-arrow--next"
            onClick={(e) => {
              e.stopPropagation();
              nextImg();
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
