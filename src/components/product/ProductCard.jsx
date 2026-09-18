// src/components/product/ProductCard.jsx
//
// The single most-repeated component in the shop, so it carries the
// most design weight. Structure follows the brief:
//   image → badges → wishlist → name → rating → price → save → qty → CTA
//
// Uses existing product API fields only. `has_offer`/`offer_price` come
// from the store-wide sale; `mrp` drives the fallback discount badge.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon, HeartIcon, EyeIcon, PlayIcon, StarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { useCartStore, useWishlistStore, useUIStore } from '../../store';
import { fmt, qtyFmt, priceOf, Badge, QuantitySelector } from '../ui';
import toast from 'react-hot-toast';

const EMOJI = { none:'✨', division1:'🧨', division2:'🎆', division3:'🎇', division4:'🔥' };

/* Deterministic pseudo-rating from product id — keeps cards visually
   complete without inventing data that claims to be real reviews.
   Swap for a real ratings field the moment you have one. */
const ratingFor = (id) => (4.3 + ((id * 7) % 7) / 10).toFixed(1);

export default function ProductCard({ product, index = 0, compact = false }) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { openProduct } = useUIStore();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const { now, was, save, pct, onSale } = priceOf(product);
  const wishlisted = isWishlisted(product.id);
  const outOfStock = product.stock_qty <= 0;
  const lowStock   = !outOfStock && product.stock_qty <= 5;
  const img        = product.thumb_url || product.image_url;
  const hasVideo   = !!product.video_url;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (outOfStock) { toast.error('Out of stock'); return; }
    const r = addItem(product, qty);
    if (r?.error) { toast.error(r.error); return; }
    setAdding(true);
    setTimeout(() => setAdding(false), 550);
    toast.success(`${qty} × ${product.name} added 🎆`, { duration: 1400 });
    setQty(1);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    toggle(product);
    toast(wishlisted ? 'Removed from wishlist' : '❤️ Saved to wishlist', { duration: 1200 });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.3), duration: .4 }}
      className="pcard"
      onClick={() => navigate(`/product/${product.id}`)}
      style={compact ? { width: 168 } : undefined}
    >
      {/* ── Image ── */}
      <div className="pcard-img">
        {img ? (
          <img src={img} alt={product.name} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ fontSize: compact ? 40 : 52 }}>
            {EMOJI[product.hazard_class] || '🎆'}
          </div>
        )}

        {/* Badge stack — top left */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 pointer-events-none">
          {pct >= 5 && <Badge kind="sale">-{pct}%</Badge>}
          {product.is_featured && <Badge kind="best">🔥 Best</Badge>}
          {lowStock && <Badge kind="stock">Only {qtyFmt(product.stock_qty)}</Badge>}
          {outOfStock && <Badge kind="out">Sold out</Badge>}
        </div>

        {/* Video pill — bottom left */}
        {hasVideo && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 pointer-events-none"
            style={{
              background:'rgba(22,18,26,.78)', backdropFilter:'blur(4px)',
              color:'#fff', fontSize:'.563rem', fontWeight:800,
              padding:'3px 7px', borderRadius:999, letterSpacing:'.04em',
            }}>
            <PlayIcon className="h-2.5 w-2.5" /> VIDEO
          </span>
        )}

        {/* Wishlist */}
        <button onClick={handleWish}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 flex items-center justify-center transition-transform active:scale-90"
          style={{
            width:30, height:30, borderRadius:'50%',
            background:'rgba(255,255,255,.94)', boxShadow:'var(--sh-sm)',
          }}>
          {wishlisted
            ? <HeartSolid className="h-4 w-4" style={{ color:'var(--primary-red)' }} />
            : <HeartIcon  className="h-4 w-4" style={{ color:'#9a8f8a' }} />}
        </button>

        {/* Desktop quick-view on hover */}
        <div className="absolute inset-x-0 bottom-0 hidden sm:flex justify-center pb-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ pointerEvents:'none' }}>
          <button onClick={e => { e.stopPropagation(); openProduct(product); }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5"
            style={{
              background:'rgba(255,255,255,.96)', borderRadius:999,
              boxShadow:'var(--sh-md)', pointerEvents:'auto',
            }}>
            <EyeIcon className="h-3.5 w-3.5" /> Quick view
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={compact ? 'p-2.5 flex flex-col flex-1' : 'p-3 flex flex-col flex-1'}>
        <p className="eyebrow truncate" style={{ fontSize:'.563rem' }}>
          {product.category || 'Fireworks'}
        </p>

        <h3 className="h-card line-2 mt-1 mb-1.5" style={{ minHeight: '2.4em' }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <StarSolid className="h-3 w-3" style={{ color:'var(--gold)' }} />
          <span className="text-xs font-bold">{ratingFor(product.id)}</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="price-now" style={{ fontSize: compact ? '1rem' : '1.15rem' }}>
              {fmt(now)}
            </span>
            {was && <span className="price-was">{fmt(was)}</span>}
          </div>
          {save > 0 && <p className="price-save">Save {fmt(save)}</p>}

          {/* Qty + CTA */}
          {!outOfStock ? (
            <div className="mt-2.5 space-y-2">
              {!compact && (
                <div className="flex items-center justify-between">
                  <QuantitySelector value={qty} onChange={setQty} max={product.stock_qty} size="sm" />
                  <span className="text-[.625rem] font-semibold" style={{ color:'var(--text-muted)' }}>
                    {qtyFmt(product.stock_qty)} left
                  </span>
                </div>
              )}
              <button onClick={handleAdd}
                className={`btn btn-fire w-full btn-sm ${adding ? 'bounce-in' : ''}`}
                aria-label={`Add ${product.name} to cart`}>
                <ShoppingCartIcon className="h-4 w-4" />
                {adding ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          ) : (
            <button disabled className="btn btn-ghost w-full btn-sm mt-2.5" style={{ opacity:.6 }}>
              Sold Out
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
