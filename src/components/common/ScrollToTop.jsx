// src/components/common/ScrollToTop.jsx
//
// React Router does NOT reset scroll position between route changes.
// Mobile browsers also do their own automatic "scroll restoration" on
// navigation, which can run AFTER our scrollTo(0,0) and silently
// override it — that's why a manual scrollTo alone wasn't enough.
//
// Fix: disable the browser's native scrollRestoration once, then
// manually force scroll to top on every route change.
//
// Mount this once inside <BrowserRouter>, anywhere — it renders nothing.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  // Disable the browser's own scroll-restoration so it can't race
  // with (and override) the manual reset below.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Set scrollTop directly on both possible scroll containers
    // (different browsers use documentElement vs body) — more
    // reliable on mobile than window.scrollTo alone, and avoids any
    // animated "smooth" scroll-behavior fighting the reset.
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
