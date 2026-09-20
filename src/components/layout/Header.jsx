// src/components/layout/Header.jsx
//
// Two distinct compositions, not one shrunk down:
//   Desktop — logo left, nav centre, actions right, full search bar
//   Mobile  — ☰ | logo | 🔍 | 🛒, slide-out drawer for navigation
//
// The header sits on a solid surface at all times (never transparent
// over the hero) because the hero is dark and the nav needs to stay
// legible without a colour-flip dance.

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon, ShoppingBagIcon, HeartIcon,
  Bars3Icon, XMarkIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useCartStore, useUIStore, useWishlistStore } from '../../store';
import { shopAPI } from '../../services/api';
import AnnouncementBar from './AnnouncementBar';
import { fmt, priceOf } from '../ui';
import { SHOP_NAME, SHOP_TAGLINE, SHOP_PHONES } from '../../config/tenant';

const NAV = [
  ['Home',       '/'],
  ['Shop',       '/products'],
  ['Combos',     '/products?combo=1'],
  ['Offers',     '/offers'],
  ['Price List', '/price-list'],
  ['About',      '/about'],
];

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { getCount }                    = useCartStore();
  const { openCart }                    = useUIStore();
  const wishCount = useWishlistStore(s => s.items.length);

  const [scrolled,   setScrolled]   = useState(false);
  const [drawer,     setDrawer]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q,          setQ]          = useState('');
  const [sugg,       setSugg]       = useState([]);
  const [bump,       setBump]       = useState(false);

  const searchRef = useRef(null);
  const count     = getCount();
  const prevCount = useRef(count);

  /* Bounce the cart badge whenever the count grows */
  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close everything on navigation */
  useEffect(() => { setDrawer(false); setSearchOpen(false); }, [location.pathname]);

  /* Lock body scroll while the drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawer]);

  /* Debounced suggestions */
  useEffect(() => {
    if (!q || q.length < 2) { setSugg([]); return; }
    const t = setTimeout(async () => {
      try { const r = await shopAPI.searchSuggest(q); setSugg(r.data.data || []); } catch {}
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  const submitSearch = (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    navigate(`/products?search=${encodeURIComponent(q.trim())}`);
    setQ(''); setSugg([]); setSearchOpen(false);
  };

  const Logo = ({ compact }) => (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="Home">
      <div className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'var(--grad-fire)', boxShadow: 'var(--sh-glow)',
        }}>
        {/* Maha Pattasu firework mark — crisp on every device (no emoji) */}
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <g stroke="#fff" strokeWidth="1.9" strokeLinecap="round">
            <line x1="12" y1="2.5" x2="12" y2="7.5" />
            <line x1="12" y1="16.5" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="7.5" y2="12" />
            <line x1="16.5" y1="12" x2="21.5" y2="12" />
            <line x1="5.5" y1="5.5" x2="8.9" y2="8.9" />
            <line x1="15.1" y1="15.1" x2="18.5" y2="18.5" />
            <line x1="18.5" y1="5.5" x2="15.1" y2="8.9" />
            <line x1="8.9" y1="15.1" x2="5.5" y2="18.5" />
          </g>
          <circle cx="12" cy="12" r="2.5" fill="#ffd60a" />
        </svg>
      </div>
      {!compact && (
        <div className="hidden sm:block leading-none">
          <p className="font-display font-black text-[15px]" style={{ color:'var(--text)' }}>
            {SHOP_NAME}
          </p>
          <p style={{ fontSize:'.563rem', fontWeight:800, letterSpacing:'.14em', color:'var(--festival-orange)' }}>
            {SHOP_TAGLINE}
          </p>
        </div>
      )}
    </Link>
  );

  const SuggestionList = ({ onPick }) => (
    <AnimatePresence>
      {sugg.length > 0 && (
        <motion.div
          initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden"
          style={{ background:'var(--surface)', borderRadius:'var(--r-md)', boxShadow:'var(--sh-xl)' }}
        >
          {sugg.map(p => {
            const { now } = priceOf(p);
            return (
              <button key={p.id} onMouseDown={() => onPick(p)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
                style={{ borderBottom:'1px solid rgba(217,4,41,.06)' }}>
                <span className="flex items-center justify-center flex-shrink-0"
                  style={{ width:32, height:32, borderRadius:8, background:'var(--surface-2)', fontSize:16 }}>
                  🎇
                </span>
                <span className="flex-1 text-sm font-semibold truncate">{p.name}</span>
                <span className="text-sm font-extrabold flex-shrink-0" style={{ color:'var(--primary-red)' }}>
                  {fmt(now)}
                </span>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40">
        <AnnouncementBar />

        <div
          style={{
            background: 'var(--surface)',
            height: 'var(--header-h)',
            boxShadow: scrolled ? 'var(--sh-md)' : '0 1px 0 rgba(217,4,41,.07)',
            transition: 'box-shadow .25s',
          }}
        >
          <div className="wrap h-full flex items-center gap-3">

            {/* Mobile menu */}
            <button onClick={() => setDrawer(true)} aria-label="Open menu"
              className="lg:hidden flex items-center justify-center flex-shrink-0"
              style={{ width:40, height:40, borderRadius:10, background:'var(--surface-2)' }}>
              <Bars3Icon className="h-5 w-5" style={{ color:'var(--text)' }} />
            </button>

            <Logo />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-4">
              {NAV.map(([label, path]) => {
                const active = location.pathname === path.split('?')[0] && path !== '/';
                return (
                  <Link key={path} to={path}
                    className="px-3 py-2 text-sm font-bold rounded-lg transition-colors"
                    style={{
                      color: active ? 'var(--primary-red)' : 'var(--text)',
                      background: active ? 'var(--surface-2)' : 'transparent',
                    }}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop search */}
            <div className="hidden md:block relative flex-1 max-w-md ml-auto">
              <form onSubmit={submitSearch}>
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color:'var(--text-muted)' }} />
                <input
                  value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Search sparklers, rockets, combos…"
                  aria-label="Search products"
                  className="w-full pl-10 pr-4 text-sm font-medium outline-none transition-all"
                  style={{
                    height: 42, borderRadius:'var(--r-full)',
                    background:'var(--surface-2)',
                    border:'2px solid transparent', fontSize:'.875rem',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--festival-orange)'; e.target.style.background='#fff'; }}
                  onBlur={e  => { e.target.style.borderColor = 'transparent'; e.target.style.background='var(--surface-2)'; }}
                />
              </form>
              <SuggestionList onPick={p => { navigate(`/product/${p.id}`); setQ(''); setSugg([]); }} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">

              <button onClick={() => setSearchOpen(v => !v)} aria-label="Search"
                className="md:hidden flex items-center justify-center"
                style={{ width:40, height:40, borderRadius:10 }}>
                <MagnifyingGlassIcon className="h-5 w-5" style={{ color:'var(--text)' }} />
              </button>

              <Link to="/wishlist" aria-label="Wishlist"
                className="hidden sm:flex relative items-center justify-center"
                style={{ width:40, height:40, borderRadius:10 }}>
                <HeartIcon className="h-5 w-5" style={{ color:'var(--text)' }} />
                {wishCount > 0 && (
                  <span className="absolute flex items-center justify-center"
                    style={{
                      top:4, right:4, minWidth:16, height:16, padding:'0 4px',
                      borderRadius:999, background:'var(--festival-orange)',
                      color:'#fff', fontSize:9, fontWeight:900,
                    }}>{wishCount}</span>
                )}
              </Link>

              <button onClick={openCart} aria-label={`Cart, ${count} items`}
                className="relative flex items-center justify-center"
                style={{ width:40, height:40, borderRadius:10 }}>
                <ShoppingBagIcon className="h-5 w-5" style={{ color:'var(--text)' }} />
                {count > 0 && (
                  <span className={`absolute flex items-center justify-center ${bump ? 'bounce-in' : ''}`}
                    style={{
                      top:2, right:2, minWidth:18, height:18, padding:'0 4px',
                      borderRadius:999, background:'var(--grad-fire)',
                      color:'#fff', fontSize:10, fontWeight:900,
                      boxShadow:'0 2px 8px rgba(217,4,41,.5)',
                    }}>
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>


            </div>
          </div>
        </div>

        {/* Mobile search drop */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              className="md:hidden overflow-visible"
              style={{ background:'var(--surface)', boxShadow:'var(--sh-md)' }}>
              <div className="px-4 py-3 relative">
                <form onSubmit={submitSearch}>
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-7 top-1/2 -translate-y-1/2 z-10"
                    style={{ color:'var(--text-muted)' }} />
                  <input ref={searchRef} autoFocus value={q} onChange={e => setQ(e.target.value)}
                    placeholder="Search products…" className="field pl-10" />
                </form>
                <SuggestionList onPick={p => { navigate(`/product/${p.id}`); setQ(''); setSugg([]); setSearchOpen(false); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setDrawer(false)}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background:'rgba(22,18,26,.55)', backdropFilter:'blur(3px)' }} />

            <motion.aside
              initial={{ x:'-100%' }} animate={{ x:0 }} exit={{ x:'-100%' }}
              transition={{ type:'spring', damping:30, stiffness:320 }}
              className="fixed top-0 left-0 bottom-0 z-50 lg:hidden flex flex-col"
              style={{ width:'min(310px, 84vw)', background:'var(--surface)' }}
              role="dialog" aria-label="Navigation menu"
            >
              {/* Drawer head */}
              <div className="relative px-5 py-6 flex-shrink-0 overflow-hidden"
                style={{ background:'var(--grad-night)' }}>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center"
                      style={{ width:42, height:42, borderRadius:12, background:'var(--grad-fire)' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <g stroke="#fff" strokeWidth="1.9" strokeLinecap="round">
                          <line x1="12" y1="2.5" x2="12" y2="7.5" /><line x1="12" y1="16.5" x2="12" y2="21.5" />
                          <line x1="2.5" y1="12" x2="7.5" y2="12" /><line x1="16.5" y1="12" x2="21.5" y2="12" />
                          <line x1="5.5" y1="5.5" x2="8.9" y2="8.9" /><line x1="15.1" y1="15.1" x2="18.5" y2="18.5" />
                          <line x1="18.5" y1="5.5" x2="15.1" y2="8.9" /><line x1="8.9" y1="15.1" x2="5.5" y2="18.5" />
                        </g>
                        <circle cx="12" cy="12" r="2.5" fill="#ffd60a" />
                      </svg>
                    </span>
                    <div className="leading-tight">
                      <p className="font-display font-black text-white text-base">{SHOP_NAME}</p>
                      <p style={{ fontSize:'.563rem', fontWeight:800, letterSpacing:'.14em', color:'var(--gold)' }}>
                        {SHOP_TAGLINE}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setDrawer(false)} aria-label="Close menu"
                    className="flex items-center justify-center"
                    style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,.16)' }}>
                    <XMarkIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto p-3">
                {NAV.map(([label, path]) => (
                  <Link key={path} to={path}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold mb-0.5"
                    style={{ color:'var(--text)' }}>
                    {label}
                    <ArrowRightIcon className="h-4 w-4" style={{ color:'var(--text-muted)' }} />
                  </Link>
                ))}

                <div className="my-3 mx-4 divider-fire" />
                <Link to="/wishlist" className="flex px-4 py-3.5 rounded-xl text-sm font-bold">Wishlist</Link>
              </nav>

              <div className="p-4 flex-shrink-0" style={{ background:'var(--surface-2)' }}>
                <p className="text-xs font-bold mb-1.5">Need help? Call us</p>
                <div className="flex flex-col gap-0.5">
                  {SHOP_PHONES.map(num => (
                    <a key={num} href={`tel:${num.replace(/\s/g, '')}`}
                      className="text-sm font-extrabold" style={{ color:'var(--primary-red)' }}>
                      📞 {num}
                    </a>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
