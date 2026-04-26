import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "../styles/private-gallery.css";

const API = import.meta.env.VITE_BACKEND_URL;
// Gallery images are data URIs (base64) — return as-is, no prefix needed
const imgSrc = (url) => url || '';

/* ── Modern Masonry Layout ──────────────────────────── */
function createMasonryLayout(images, columns = 3) {
  const columnHeights = new Array(columns).fill(0);
  const layout = new Array(columns).fill().map(() => []);
  
  images.forEach((img) => {
    // Find the shortest column
    let shortestCol = 0;
    for (let i = 1; i < columns; i++) {
      if (columnHeights[i] < columnHeights[shortestCol]) {
        shortestCol = i;
      }
    }
    
    layout[shortestCol].push(img);
    // Add random height between 0.8 and 1.2 for visual variety
    const heightFactor = 0.8 + Math.random() * 0.4;
    columnHeights[shortestCol] += heightFactor;
  });
  
  return layout;
}

/* ── Lightbox with Swipe Support ───────────────────── */
function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);
  const [touchStart, setTouchStart] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const prev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((c) => (c - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);
  
  const next = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((c) => (c + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

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

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    setTouchStart(null);
  };

  const img = images[current];

  return (
    <div className="pg-lb-backdrop" onClick={onClose}>
      <button className="pg-lb-close" onClick={onClose}>✕</button>
      
      <button className="pg-lb-arrow pg-lb-arrow--prev" onClick={(e) => { e.stopPropagation(); prev(); }}>
        ‹
      </button>
      
      <div className="pg-lb-inner" onClick={(e) => e.stopPropagation()}>
        <div className="pg-lb-image-container">
          <img
            key={img._id}
            src={imgSrc(img.url)}
            alt={img.caption || "Gallery image"}
            className="pg-lb-img"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
          {img.caption && <div className="pg-lb-caption">{img.caption}</div>}
        </div>
      </div>
      
      <button className="pg-lb-arrow pg-lb-arrow--next" onClick={(e) => { e.stopPropagation(); next(); }}>
        ›
      </button>
      
      <div className="pg-lb-counter">
        {current + 1} / {images.length}
      </div>
      
      {/* Thumbnail navigation */}
      <div className="pg-lb-thumbnails">
        {images.map((thumb, idx) => (
          <button
            key={thumb._id}
            className={`pg-lb-thumb ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
          >
            <img src={imgSrc(thumb.url)} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ───────────────────────────────────────── */
export default function PrivateGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [loaded, setLoaded] = useState({});
  const [columns, setColumns] = useState(3);
  const galleryRef = useRef(null);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(3);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/api/gallery`)
      .then((res) => setImages(res.data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  const markLoaded = (id) => setLoaded((prev) => ({ ...prev, [id]: true }));
  
  const masonryLayout = createMasonryLayout(images, columns);

  if (loading) {
    return (
      <div className="pg-loading">
        <div className="pg-spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="pg-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <h3>Gallery Coming Soon</h3>
        <p>Exclusive behind-the-scenes images will appear here for members only.</p>
      </div>
    );
  }

  return (
    <div className="pg-wrap">
      {/* Header */}
      <div className="pg-header">
        <div className="pg-header-left">
          <h1 className="pg-title">Private Gallery</h1>
          <p className="pg-subtitle">Exclusive behind-the-scenes moments</p>
        </div>
        <div className="pg-header-right">
          <span className="pg-badge">Members Only</span>
          <span className="pg-count">{images.length} photos</span>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="pg-masonry" ref={galleryRef}>
        {masonryLayout.map((column, colIdx) => (
          <div key={colIdx} className="pg-column">
            {column.map((img, imgIdx) => {
              const globalIdx = images.findIndex(i => i._id === img._id);
              return (
                <div
                  key={img._id}
                  className={`pg-card ${loaded[img._id] ? 'loaded' : ''}`}
                  onClick={() => setLightbox(globalIdx)}
                >
                  <div className="pg-card-inner">
                    <img
                      src={imgSrc(img.url)}
                      alt={img.caption || ""}
                      loading="lazy"
                      onLoad={() => markLoaded(img._id)}
                    />
                    <div className="pg-card-overlay">
                      <div className="pg-card-hover-content">
                        <svg className="pg-zoom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                        {img.caption && <p className="pg-card-caption">{img.caption}</p>}
                      </div>
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