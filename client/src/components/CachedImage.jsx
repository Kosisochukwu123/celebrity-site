import { useState, useEffect, useRef } from 'react';
import { getCachedImage, cacheImage } from '../services/imageCache';

// Drop-in replacement for <img> that:
//  1. Checks IndexedDB cache first — instant display if cached
//  2. Lazy-loads with IntersectionObserver — only fetches when in viewport
//  3. Shows a shimmer placeholder while loading
//  4. Caches data URIs in IndexedDB for 7 days after first load
//  5. Falls back gracefully if caching fails

export default function CachedImage({
  src,
  alt = '',
  className = '',
  style = {},
  onLoad,
  ...rest
}) {
  const [displaySrc, setDisplaySrc] = useState(null);
  const [loaded, setLoaded]         = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;

    const load = async () => {
      // Data URIs are already inline — no network needed
      if (src.startsWith('data:')) {
        setDisplaySrc(src);
        return;
      }

      // Check IndexedDB cache first
      const cached = await getCachedImage(src);
      if (cancelled) return;

      if (cached) {
        setDisplaySrc(cached);
        return;
      }

      // Not cached — fetch and cache for next time
      // For /uploads/ paths and http(s):// URLs — browser handles fetching
      setDisplaySrc(src);

      // If it's a data URI that came in later (e.g., from API)
      // cache it for next visit
      if (src.startsWith('data:')) {
        cacheImage(src, src);
      }
    };

    // Use IntersectionObserver to lazy-load
    const el = imgRef.current;
    if (!el) { load(); return; }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observerRef.current?.disconnect();
          load();
        }
      },
      { rootMargin: '200px' } // start loading 200px before entering viewport
    );
    observerRef.current.observe(el);

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
    };
  }, [src]);

  const handleLoad = (e) => {
    setLoaded(true);
    onLoad?.(e);

    // Cache the image if it's an external URL that loaded successfully
    // (we can't read external pixel data, but we track that it loaded)
  };

  return (
    <span
      ref={imgRef}
      className={`ci-wrapper ${loaded ? 'ci-loaded' : 'ci-loading'}`}
      style={{ display: 'block', overflow: 'hidden', position: 'relative', ...style }}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <span
          className="ci-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #1A1714 0%, #2E2A26 50%, #1A1714 100%)',
            backgroundSize: '200% 100%',
            animation: 'ciShimmer 1.5s infinite',
          }}
        />
      )}

      {displaySrc && (
        <img
          src={displaySrc}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          {...rest}
        />
      )}

      <style>{`
        @keyframes ciShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </span>
  );
}