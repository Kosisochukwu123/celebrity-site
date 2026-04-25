import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "../styles/private-gallery.css";

const API = "http://localhost:5000";
const imgSrc = (url) =>
  !url ? "" : url.startsWith("http") ? url : `${API}${url}`;

/* ── Masonry-style layout groups ──────────────────────────── */
function chunkIntoRows(images) {
  // Creates rows of 3 with varying aspect ratios for visual variety
  const patterns = [
    [2, 1], // wide, wide, tall
    [1, 1, 1], // three equal
    [3, 1, 1], // very wide + two small
    [1, 2, 1], // small, wide, small
  ];
  const rows = [];
  let i = 0;
  let patternIdx = 0;
  while (i < images.length) {
    const pattern = patterns[patternIdx % patterns.length];
    const rowImages = images.slice(i, i + pattern.length);
    if (rowImages.length > 0) rows.push({ images: rowImages, spans: pattern });
    i += pattern.length;
    patternIdx++;
  }
  return rows;
}

/* ── Lightbox ─────────────────────────────────────────────── */
function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const img = images[current];

  return (
    <div className="pg-lb-backdrop" onClick={onClose}>
      <button className="pg-lb-close" onClick={onClose}>
        ✕
      </button>

      <button
        className="pg-lb-arrow pg-lb-arrow--prev"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
      >
        ‹
      </button>

      <div className="pg-lb-inner" onClick={(e) => e.stopPropagation()}>
        <img
          key={img._id}
          src={imgSrc(img.url)}
          alt={img.caption || ""}
          className="pg-lb-img"
        />
        {img.caption && <p className="pg-lb-caption">{img.caption}</p>}
      </div>

      <button
        className="pg-lb-arrow pg-lb-arrow--next"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
      >
        ›
      </button>

      <div className="pg-lb-counter">
        {current + 1} / {images.length}
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ───────────────────────────────────────── */
export default function PrivateGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // index
  const [loaded, setLoaded] = useState({}); // track which images have loaded

  useEffect(() => {
    axios
      .get("/api/gallery")
      .then((res) => setImages(res.data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  const openLightbox = (index) => {
    setLightbox(index);
  };

  const markLoaded = (id) => setLoaded((prev) => ({ ...prev, [id]: true }));

  const rows = chunkIntoRows(images);

  if (loading) {
    return (
      <div className="pg-loading">
        <div className="pg-spinner" />
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="pg-empty">
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(245,240,232,0.15)"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <h3>Gallery coming soon</h3>
        <p>
          Exclusive behind-the-scenes images will appear here for members only.
        </p>
      </div>
    );
  }

  return (
    <div className="pg-wrap">
      {/* Count */}
      <div className="pg-meta">
        <span className="pg-count">
          {images.length} {images.length === 1 ? "photo" : "photos"}
        </span>
        <span className="pg-exclusive-tag">Members Only</span>
      </div>

      {/* Mosaic grid */}
      <div className="pg-mosaic">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="pg-row"
            style={{ "--cols": row.images.length }}
          >
            {row.images.map((img, ii) => {
              const globalIdx = images.findIndex((i) => i._id === img._id);
              const span = row.spans[ii] || 1;
              return (
                <div
                  key={img._id}
                  className={`pg-cell pg-cell--span-${span} ${loaded[img._id] ? "pg-cell--loaded" : ""}`}
                  onClick={() => openLightbox(globalIdx)}
                  style={{ "--span": span }}
                >
                  <div className="pg-cell-inner">
                    <img
                      src={imgSrc(img.url)}
                      alt={img.caption || ""}
                      loading="lazy"
                      onLoad={() => markLoaded(img._id)}
                    />
                    <div className="pg-cell-overlay">
                      <svg
                        className="pg-zoom-icon"
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
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          images={images}
          index={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
