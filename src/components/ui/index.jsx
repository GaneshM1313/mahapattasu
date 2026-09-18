// src/components/ui/index.jsx
// Shared primitives. Every page composes from these so styling stays
// consistent and there's no per-component ad-hoc CSS.

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

/* ── Money ─────────────────────────────────────────────────── */
export const fmt = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/* ── Quantity display ──────────────────────────────────────────
   stock_qty comes from a decimal(10,3) column, so the API often
   serialises it as "80.000". Products here are sold as whole
   units, so strip that down to a plain integer for anything shown
   to the customer ("80 available", not "80.000 available"). Use
   the raw value (not this) for max= props / numeric comparisons. */
export const qtyFmt = (n) => Math.round(parseFloat(n) || 0);

/* ── Pricing helper — single source of truth ───────────────────
   Handles both the store-wide sale (offer_price) and MRP savings. */
export function priceOf(p) {
  const list  = parseFloat(p?.selling_price || 0);
  const mrp   = p?.mrp ? parseFloat(p.mrp) : null;
  const onSale = p?.has_offer && p?.offer_price != null;
  const now   = onSale ? parseFloat(p.offer_price) : list;
  const was   = onSale ? list : (mrp && mrp > list ? mrp : null);
  const save  = was ? was - now : 0;
  const pct   = was ? Math.round((save / was) * 100) : 0;
  return { now, was, save, pct, onSale };
}

/* ── Badge ─────────────────────────────────────────────────── */
export function Badge({ kind = 'sale', children, className = '' }) {
  return <span className={`badge badge-${kind} ${className}`}>{children}</span>;
}

/* ── Price display ─────────────────────────────────────────── */
export function PriceDisplay({ product, size = 'md' }) {
  const { now, was, save } = priceOf(product);
  const sizes = { sm: '.95rem', md: '1.2rem', lg: '2rem', xl: '2.6rem' };
  return (
    <div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="price-now" style={{ fontSize: sizes[size] }}>{fmt(now)}</span>
        {was && <span className="price-was">{fmt(was)}</span>}
      </div>
      {save > 0 && <p className="price-save mt-0.5">You save {fmt(save)}</p>}
    </div>
  );
}

/* ── Section header ────────────────────────────────────────── */
export function SectionHeader({ eyebrow, title, subtitle, to, actionLabel = 'View all' }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="h-section">{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {to && (
        <Link to={to}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-bold flex-shrink-0"
          style={{ color:'var(--primary-red)' }}>
          {actionLabel} <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* ── Quantity selector ─────────────────────────────────────── */
// +/- buttons AND a typable number field — both write to the same
// `value`/`onChange` the parent already owns. Typing is buffered in
// local `text` state so the user can freely clear the field while
// entering a new number; it only commits (clamped to 1..max) on
// blur or Enter, so a half-typed value never triggers stock errors.
export function QuantitySelector({ value, onChange, max = 999, size = 'md' }) {
  const dim = size === 'sm' ? 28 : 32;
  const [text, setText] = useState(String(value));

  // Keep the field in sync when `value` changes from outside —
  // the +/- buttons, or the parent resetting qty to 1 after Add to Cart.
  useEffect(() => { setText(String(value)); }, [value]);

  const commit = (raw) => {
    const n = parseInt(raw, 10);
    if (!raw || Number.isNaN(n) || n < 1) { setText(String(value)); return; }
    const clamped = Math.min(Math.max(n, 1), max);
    setText(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  return (
    <div className="qty" onClick={e => e.stopPropagation()}>
      <button type="button" aria-label="Decrease quantity"
        style={{ width: dim, height: dim }}
        onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Quantity"
        value={text}
        onChange={e => setText(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        onFocus={e => e.target.select()}
      />
      <button type="button" aria-label="Increase quantity"
        style={{ width: dim, height: dim }}
        onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

/* ── Spark field — decorative, GPU-only ────────────────────── */
export function Sparks({ count = 26, color = '#fff' }) {
  const dots = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: `${(i * 37) % 100}%`,
      top:  `${(i * 53) % 100}%`,
      size: 1 + ((i * 7) % 3),
      delay: `${(i % 10) * 0.32}s`,
      dur: `${2.4 + (i % 5) * 0.5}s`,
    })), [count]);

  return (
    <>
      {dots.map((d, i) => (
        <span key={i} className="spark" aria-hidden="true"
          style={{
            left: d.left, top: d.top,
            width: d.size, height: d.size,
            background: color,
            animationDelay: d.delay,
            animationDuration: d.dur,
          }} />
      ))}
    </>
  );
}

/* ── Glow orb — soft coloured light behind hero content ────── */
export function GlowOrb({ color, size = 380, style = {} }) {
  return (
    <span className="glow-orb" aria-hidden="true"
      style={{ width: size, height: size, background: color, ...style }} />
  );
}

/* ── Skeleton card ─────────────────────────────────────────── */
export function ProductSkeleton() {
  return (
    <div className="card">
      <div className="skeleton" style={{ aspectRatio: 1, borderRadius: 0 }} />
      <div className="p-3 space-y-2">
        <div className="skeleton h-2.5 w-2/3" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-5 w-1/2" />
        <div className="skeleton h-9 w-full" />
      </div>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────── */
export function EmptyState({ emoji = '🎆', title, message, action }) {
  return (
    <div className="text-center py-20 px-4">
      <motion.div initial={{ scale:.6, opacity:0 }} animate={{ scale:1, opacity:1 }}
        transition={{ type:'spring', damping:14 }} className="text-7xl mb-4">
        {emoji}
      </motion.div>
      <h3 className="h-section mb-2">{title}</h3>
      {message && <p className="text-sm mb-6" style={{ color:'var(--text-muted)' }}>{message}</p>}
      {action}
    </div>
  );
}

/* ── Animated section wrapper — reveal on scroll ───────────── */
export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: .5, delay, ease: [.16,1,.3,1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
