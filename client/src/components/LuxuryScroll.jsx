import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Luxury smooth scroll — eased, weighted, cinematic feel
// Works by intercepting wheel events and animating scroll manually
// Disabled on touch devices (they have native momentum scroll)

const EASE_FACTOR   = 0.385;  // lower = slower/heavier, higher = snappier
const WHEEL_MULT    = 1.2;    // scroll distance multiplier per wheel tick
const MAX_DELTA     = 120;    // cap per frame to prevent jumps on trackpad

export default function LuxuryScroll() {
  const { pathname } = useLocation();
  const currentY  = useRef(0);   // actual rendered position
  const targetY   = useRef(0);   // where we want to be
  const rafId     = useRef(null);
  const enabled   = useRef(false);

  useEffect(() => {
    // Disable on touch/mobile — native momentum is already luxury
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    // Disable on browsers that don't support smooth well (Firefox has its own)
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    if (isFirefox) return;

    enabled.current = true;

    // Sync positions on route change
    currentY.current = 0;
    targetY.current  = 0;

    const onWheel = (e) => {
      if (!enabled.current) return;
      e.preventDefault();

      const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * WHEEL_MULT, MAX_DELTA);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY.current = Math.max(0, Math.min(targetY.current + delta, maxScroll));

      if (!rafId.current) animate();
    };

    const animate = () => {
      const diff = targetY.current - currentY.current;

      if (Math.abs(diff) < 0.5) {
        // Close enough — snap and stop
        currentY.current = targetY.current;
        window.scrollTo(0, currentY.current);
        rafId.current = null;
        return;
      }

      currentY.current += diff * EASE_FACTOR;
      window.scrollTo(0, currentY.current);
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    };
  }, [pathname]);

  return null;
}