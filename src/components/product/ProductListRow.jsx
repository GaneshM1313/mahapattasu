// src/components/product/ProductListRow.jsx
//
// One product in the price-list style catalogue.
//
//   Desktop (≥1024px) — a table row:
//     S.No | Image | Name | Content | Actual | Disc | Amount | Qty | Total
//   Mobile  (<1024px) — a compact card: image left, name + prices right,
//     quantity stepper bottom-right, running line-total under the price.
//
// Tapping the row does NOT navigate away any more. It expands an inline
// detail panel right under the row (image/video slider, description,
// safety info, wishlist), so the customer never loses their place in
// the list.
//
// Quantity here is the CART quantity — the stepper starts at 0 and
// every tap writes straight to the cart store, exactly like a
// traditional crackers price-list order form.

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon, XMarkIcon, ShieldCheckIcon, TruckIcon, HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCartStore, useWishlistStore } from '../../store';
import { shopAPI } from '../../services/api';
import { fmt, priceOf } from '../ui';
import MediaStage from './MediaStage';
import toast from 'react-hot-toast';

const EMOJI = { none:'✨', division1:'🧨', division2:'🎆', division3:'🎇', division4:'🔥' };

/* Secondary line under the name (e.g. Tamil name). Uses whichever
   field the API provides; renders nothing if none exists. */
export const subNameOf = (p) =>
  p?.name_ta || p?.tamil_name || p?.name_tamil || p?.local_name || p?.sub_name || '';

/* "1 PKT", "1 BOX" … — falls back to the same unit logic as the price list page */
export const contentOf = (p) =>
  p?.content || `1 ${String(p?.unit || 'PCS').toUpperCase()}`;

/* Detail records are cached so re-opening a row is instant */
const detailCache = new Map();

/* ── Cart-linked stepper (0 = not in cart) ─────────────────── */
export function CartStepper({ product, size = 'md' }) {
  const qty       = useCartStore(s => s.items.find(i => i.id === product.id)?.qty || 0);
  const addItem   = useCartStore(s => s.addItem);
  const updateQty = useCartStore(s => s.updateQty);
  const [text, setText] = useState(String(qty));

  useEffect(() => { setText(String(qty)); }, [qty]);

  const setQty = (n) => {
    const next = Math.max(0, Math.min(9999, n));
    if (next === qty) { setText(String(qty)); return; }
    if (qty === 0) {
      const r = addItem(product, next);
      if (r?.error) { toast.error(r.error); return; }
    } else {
      updateQty(product.id, next);
    }
  };

  const commit = (raw) => {
    const n = parseInt(raw, 10);
    setQty(Number.isNaN(n) ? 0 : n);
  };

  return (
    <div className={`plv-step plv-step-${size} ${qty > 0 ? 'is-on' : ''}`}
      onClick={e => e.stopPropagation()}>
      <button type="button" aria-label={`Decrease ${product.name}`}
        disabled={qty === 0} onClick={() => setQty(qty - 1)}>−</button>
      <input
        type="text" inputMode="numeric" pattern="[0-9]*"
        aria-label={`Quantity of ${product.name}`}
        value={text}
        onChange={e => setText(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        onFocus={e => e.target.select()}
      />
      <button type="button" aria-label={`Increase ${product.name}`}
        onClick={() => setQty(qty + 1)}>+</button>
    </div>
  );
}

/* ── Inline detail panel ───────────────────────────────────── */
function InlineDetail({ product, onClose }) {
  const [detail, setDetail]   = useState(detailCache.get(product.id) || null);
  const [loading, setLoading] = useState(!detailCache.has(product.id));
  const { toggle, isWishlisted } = useWishlistStore();
  const qty = useCartStore(s => s.items.find(i => i.id === product.id)?.qty || 0);

  useEffect(() => {
    if (detailCache.has(product.id)) return;
    let alive = true;
    shopAPI.getProduct(product.id)
      .then(r => {
        const d = r.data.data;
        detailCache.set(product.id, d);
        if (alive) setDetail(d);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [product.id]);

  // Prefer the fuller record once it arrives (carries video_url / description)
  const media = detail ? { ...product, ...detail } : product;
  const { now, was, save, pct } = priceOf(media);
  const wished = isWishlisted(product.id);
  const sub = subNameOf(media);

  return (
    <motion.div
      className="plv-detail"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: .32, ease: [.16, 1, .3, 1] }}
    >
      <div className="plv-detail-inner">
        <button type="button" className="plv-detail-close" onClick={onClose} aria-label="Close details">
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="plv-detail-media">
          <MediaStage product={media} />
          {pct >= 5 && <span className="plv-detail-pct">{pct}% OFF</span>}
        </div>

        <div className="plv-detail-info">
          <p className="plv-detail-cat">{media.category || 'Fireworks'}</p>
          <h3 className="plv-detail-name">{media.name}</h3>
          {sub && <p className="plv-detail-sub">{sub}</p>}

          <div className="plv-detail-price">
            <span className="plv-detail-now">{fmt(now)}</span>
            {was && <span className="plv-detail-was">{fmt(was)}</span>}
            {save > 0 && <span className="plv-chip plv-chip-green">You save {fmt(save)}</span>}
          </div>

          <div className="plv-detail-chips">
            <span className="plv-chip">📦 {contentOf(media)}</span>
            {media.hazard_class && media.hazard_class !== 'none' && (
              <span className="plv-chip">⚠️ {String(media.hazard_class).toUpperCase()}</span>
            )}
            {media.video_url && <span className="plv-chip">▶ Swipe image for video</span>}
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: 44, borderRadius: 12, marginBottom: 14 }} />
          ) : media.description ? (
            <p className="plv-detail-desc">{media.description}</p>
          ) : null}

          <div className="plv-detail-safety">
            <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" />
            <span>
              {media.hazard_class === 'none' || !media.hazard_class
                ? 'Safe for all ages. Handle with care.'
                : 'Keep away from fire. Light from a distance, use only under adult supervision.'}
            </span>
          </div>

          <div className="plv-detail-actions">
            <div className="plv-detail-qty">
              <span className="plv-detail-label">Quantity</span>
              <CartStepper product={media} size="lg" />
            </div>
            <div className="plv-detail-line">
              <span className="plv-detail-label">Total</span>
              <span className="plv-detail-linetotal">{fmt(now * qty)}</span>
            </div>
            <button type="button"
              onClick={() => { toggle(media); toast(wished ? 'Removed from wishlist' : '❤️ Saved to wishlist', { duration: 1200 }); }}
              className={`plv-wish ${wished ? 'is-on' : ''}`}
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}>
              {wished ? <HeartSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
            </button>
          </div>

          <div className="plv-detail-perks">
            <span><TruckIcon className="h-4 w-4" /> Delivery across Tamil Nadu</span>
            <span><ShieldCheckIcon className="h-4 w-4" /> Licensed & certified</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Row ───────────────────────────────────────────────────── */
export default function ProductListRow({ product, sno, open, onToggle }) {
  const qty = useCartStore(s => s.items.find(i => i.id === product.id)?.qty || 0);
  const { now, was, save, pct } = priceOf(product);
  const img = product.thumb_url || product.image_url;
  const sub = subNameOf(product);
  const rowRef = useRef(null);

  /* On phones, bring the opened product to the top so its details are
     visible straight away (row above may be collapsing at the same time) */
  useEffect(() => {
    if (!open || window.innerWidth >= 1024) return;
    const t = setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 280);
    return () => clearTimeout(t);
  }, [open]);

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); }
  };

  return (
    <div ref={rowRef} className={`plv-row ${open ? 'is-open' : ''} ${qty > 0 ? 'in-cart' : ''}`}>
      <div className="plv-main" role="button" tabIndex={0}
        aria-expanded={open} onClick={onToggle} onKeyDown={onKey}>

        <span className="plv-sno">{sno}</span>

        <div className="plv-img">
          {img
            ? <img src={img} alt={product.name} loading="lazy" />
            : <span className="plv-img-emoji">{EMOJI[product.hazard_class] || '🎆'}</span>}
          <span className="plv-img-sno">{sno}</span>
          {pct >= 5 && <span className="plv-img-pct">-{pct}%</span>}
        </div>

        <div className="plv-name">
          <h3>{product.name}</h3>
          {sub && <p className="plv-sub">{sub}</p>}
          {/* Mobile-only meta line */}
          <p className="plv-mmeta">
            <span className="plv-mcontent">{contentOf(product)}</span>
            {was && <span className="plv-mwas">{fmt(was)}</span>}
          </p>
        </div>

        <span className="plv-cell plv-content">{contentOf(product)}</span>
        <span className="plv-cell plv-actual">{was ? fmt(was) : '—'}</span>
        <span className="plv-cell plv-off">{save > 0 ? fmt(save) : '—'}</span>

        <div className="plv-cell plv-amount">
          <span className="plv-now">{fmt(now)}</span>
          <span className="plv-mtotal">{qty > 0 ? `Total ${fmt(now * qty)}` : 'Tap + to add'}</span>
        </div>

        <div className="plv-cell plv-qty">
          <CartStepper product={product} />
        </div>

        <span className="plv-cell plv-total">{fmt(now * qty)}</span>

        <ChevronDownIcon className="plv-chev" aria-hidden="true" />
      </div>

      <AnimatePresence initial={false}>
        {open && <InlineDetail product={product} onClose={onToggle} />}
      </AnimatePresence>
    </div>
  );
}
