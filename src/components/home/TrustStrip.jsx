// src/components/home/TrustStrip.jsx
import React from 'react';
import { Reveal } from '../ui';

const ITEMS = [
  { icon:'🚚', title:'Fast Delivery',    sub:'Across Tamil Nadu' },
  { icon:'💰', title:'Best Prices',      sub:'Direct from factory' },
  { icon:'🎆', title:'Sivakasi Made',    sub:'100% genuine' },
  { icon:'🔒', title:'Secure Payment',   sub:'Safe checkout' },
  { icon:'⭐', title:'Trusted Service',  sub:'7000+ customers' },
];

export function TrustStrip() {
  return (
    <section className="section-tight" style={{ background:'var(--surface)' }}>
      <div className="wrap">
        <div className="rail no-scrollbar md:grid md:grid-cols-5 md:gap-4">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * .05}>
              <div className="flex items-center gap-3 px-4 py-3.5 md:flex-col md:text-center md:py-5"
                style={{
                  minWidth: 210,
                  background:'var(--surface-2)',
                  borderRadius:'var(--r-lg)',
                  border:'1px solid rgba(247,127,0,.14)',
                }}>
                <span className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width:44, height:44, borderRadius:14, fontSize:21,
                    background:'var(--surface)', boxShadow:'var(--sh-sm)',
                  }}>
                  {it.icon}
                </span>
                <div className="md:mt-1">
                  <p className="text-sm font-extrabold leading-tight">{it.title}</p>
                  <p className="text-xs" style={{ color:'var(--text-muted)' }}>{it.sub}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY RAIL
═══════════════════════════════════════════════════════════════ */
import { Link } from 'react-router-dom';
import { SectionHeader } from '../ui';

/* Each category gets its own gradient so the row reads as colourful
   rather than a grid of identical tiles. Keyed by slug fragment with
   a deterministic fallback, so new categories still look intentional. */
const THEMES = [
  { grad:'linear-gradient(150deg,#d90429,#f77f00)', emoji:'🎆' },
  { grad:'linear-gradient(150deg,#f77f00,#ffb703)', emoji:'✨' },
  { grad:'linear-gradient(150deg,#7209b7,#b5179e)', emoji:'🚀' },
  { grad:'linear-gradient(150deg,#0f9d58,#52b788)', emoji:'🌀' },
  { grad:'linear-gradient(150deg,#3d5af1,#4cc9f0)', emoji:'💥' },
  { grad:'linear-gradient(150deg,#ef233c,#ff8fa3)', emoji:'🌸' },
  { grad:'linear-gradient(150deg,#ffb703,#ffd60a)', emoji:'🎁' },
  { grad:'linear-gradient(150deg,#9d0208,#d90429)', emoji:'🎇' },
];

const EMOJI_BY_SLUG = {
  'sparkler':'✨', 'rocket':'🚀', 'chakkar':'🌀', 'bomb':'💥',
  'flower':'🌸', 'gift':'🎁', 'aerial':'🎆', 'fancy':'🎇', 'combo':'🎁',
};

function themeFor(cat, i) {
  const base = THEMES[i % THEMES.length];
  const slug = (cat.slug || cat.name || '').toLowerCase();
  const match = Object.keys(EMOJI_BY_SLUG).find(k => slug.includes(k));
  return { grad: base.grad, emoji: match ? EMOJI_BY_SLUG[match] : base.emoji };
}

export function CategoryRail({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <section className="section section-warm">
      
    </section>
  );
}
