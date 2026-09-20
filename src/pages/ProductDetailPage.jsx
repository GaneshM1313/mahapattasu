// src/pages/ProductDetailPage.jsx
//
// This page is REQUIRED — ProductCard navigates to /product/:id.
// If the route or this file is missing, the bundle throws on import
// and React never mounts, which surfaces as the raw <noscript> text
// "You need to enable JavaScript to run this app."

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon, HeartIcon, ShieldCheckIcon, TruckIcon,
  ChevronLeftIcon, ShareIcon, CheckBadgeIcon, PlayIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { shopAPI } from '../services/api';
import { useCartStore, useWishlistStore } from '../store';
import ProductCard from '../components/product/ProductCard';
import { fmt, priceOf, Badge, QuantitySelector, Reveal, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const HAZARD_COPY = {
  none:      'Safe for all ages when used as directed.',
  division1: 'Explosive. Adult supervision required. Light and retreat immediately.',
  division2: 'Flammable. Keep away from open flame. Use outdoors only.',
  division3: 'Oxidizer. Store away from heat. Use on flat open ground.',
  division4: 'Handle with care. Adult supervision essential at all times.',
};

/* ── Video parsing (inline so this page has no extra dependency) ── */
function parseVideo(url) {
  if (!url) return null;
  const u = String(url).trim();
  let m = u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);              if (m) return { type:'youtube', id:m[1] };
  m = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/);                        if (m) return { type:'youtube', id:m[1] };
  m = u.match(/youtube\.com\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{6,})/); if (m) return { type:'youtube', id:m[1] };
  m = u.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);                 if (m) return { type:'vimeo', id:m[1] };
  return null;
}

/* ── Media slider: image first, video one swipe away ── */
function Media({ product }) {
  const video = parseVideo(product?.video_url);
  const [tab, setTab]         = useState(0);
  const [playing, setPlaying] = useState(false);

  const slides = [];
  if (product?.image_url) slides.push({ kind:'image', src: product.image_url });
  else                    slides.push({ kind:'empty' });
  if (video) slides.push({ kind:'video', video, thumb:`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg` });

  const cur = slides[tab] || slides[0];
  const embed = video && video.type === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
    : video ? `https://player.vimeo.com/video/${video.id}?autoplay=1` : null;

  return (
    <div>
      <div className="relative overflow-hidden"
        style={{
          aspectRatio:'1',
          borderRadius:'var(--r-xl)',
          background: cur.kind === 'video' ? '#0a0620' : 'var(--surface-2)',
          boxShadow:'var(--sh-md)',
        }}>
        {cur.kind === 'image' && (
          <img src={cur.src} alt={product.name} className="w-full h-full object-cover" />
        )}
        {cur.kind === 'empty' && (
          <div className="w-full h-full flex items-center justify-center text-8xl">🎆</div>
        )}
        {cur.kind === 'video' && (playing ? (
          <iframe src={embed} title={product.name} allowFullScreen
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 w-full h-full border-0" />
        ) : (
          <button onClick={() => setPlaying(true)} aria-label="Play product video"
            className="group absolute inset-0 w-full h-full border-0 p-0 cursor-pointer">
            <img src={cur.thumb} alt="" className="w-full h-full object-cover opacity-85" />
            <span className="absolute inset-0"
              style={{ background:'radial-gradient(circle,rgba(0,0,0,.15),rgba(0,0,0,.6))' }} />
            <span className="absolute top-1/2 left-1/2 flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                width:78, height:78, borderRadius:'50%', transform:'translate(-50%,-50%)',
                background:'var(--grad-fire)', boxShadow:'0 10px 34px rgba(217,4,41,.6)',
              }}>
              <PlayIcon className="h-9 w-9 text-white" style={{ marginLeft:4 }} />
            </span>
            <span className="absolute bottom-5 left-0 right-0 text-center text-white/90 text-sm font-semibold">
              See it burst before you buy
            </span>
          </button>
        ))}

        {product?.has_offer && (
          <span className="absolute top-3 left-3">
            <Badge kind="sale">{product.discount_pct}% OFF</Badge>
          </span>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex gap-2 mt-3">
          {slides.map((s, i) => (
            <button key={i} onClick={() => { setTab(i); setPlaying(false); }}
              aria-label={s.kind === 'video' ? 'Show video' : 'Show photo'}
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width:70, height:70, borderRadius:'var(--r-md)',
                border: tab === i ? '2px solid var(--primary-red)' : '1px solid rgba(217,4,41,.12)',
                background: s.kind === 'video' ? '#0a0620' : 'var(--surface-2)',
                opacity: tab === i ? 1 : .65,
              }}>
              {s.kind === 'empty'
                ? <span className="flex items-center justify-center h-full text-2xl">🎆</span>
                : <img src={s.kind === 'video' ? s.thumb : s.src} alt="" className="w-full h-full object-cover" />}
              {s.kind === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center"
                  style={{ background:'rgba(0,0,0,.3)' }}>
                  <PlayIcon className="h-5 w-5 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { addItem }              = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]         = useState(1);

  useEffect(() => {
    setLoading(true); setQty(1);
    shopAPI.getProduct(id)
      .then(r => setProduct(r.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-top" style={{ background:'var(--cream)', minHeight:'100vh' }}>
        <div className="wrap py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton" style={{ aspectRatio:1, borderRadius:'var(--r-xl)' }} />
          <div className="space-y-3">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-10 w-1/2" />
            <div className="skeleton h-24" />
            <div className="skeleton h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-top" style={{ background:'var(--cream)', minHeight:'100vh' }}>
        <EmptyState emoji="🔍" title="Product not found"
          message="It may have been removed or is no longer available"
          action={<Link to="/products" className="btn btn-fire">Browse products</Link>} />
      </div>
    );
  }

  const { now, was, save, pct } = priceOf(product);
  const wishlisted = isWishlisted(product.id);
  const outOfStock = false;

  const handleAdd = () => {
    if (outOfStock) { toast.error('Out of stock'); return; }
    const r = addItem(product, qty);
    if (r?.error) { toast.error(r.error); return; }
    toast.success(`${qty} × ${product.name} added 🎆`);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    const r = addItem(product, qty);
    if (r?.error) { toast.error(r.error); return; }
    navigate('/checkout');
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: product.name, url }); } catch {} }
    else { navigator.clipboard?.writeText(url); toast.success('Link copied — share on WhatsApp'); }
  };

  return (
    <div className="page-top pb-28 lg:pb-10" style={{ background:'var(--cream)', minHeight:'100vh' }}>
      <div className="wrap py-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-bold"
            style={{ color:'var(--text-muted)' }}>
            <ChevronLeftIcon className="h-4 w-4" /> Back
          </button>
          <button onClick={share} className="flex items-center gap-1.5 text-sm font-bold"
            style={{ color:'var(--primary-red)' }}>
            <ShareIcon className="h-4 w-4" /> Share
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 lg:gap-12">

          <div className="lg:sticky lg:self-start"
            style={{ top:'calc(var(--header-h) + var(--announce-h) + 20px)' }}>
            <Media product={product} />
          </div>

          <div>
            <p className="eyebrow mb-1.5">{product.category}</p>
            <h1 className="h-section mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1">
                <StarSolid className="h-4 w-4" style={{ color:'var(--gold)' }} />
                <span className="text-sm font-extrabold">
                  {(4.3 + ((product.id * 7) % 7) / 10).toFixed(1)}
                </span>
              </span>
              <span className="text-xs" style={{ color:'var(--text-muted)' }}>· Sivakasi direct</span>
            </div>

            {/* Price block */}
            <div className="card p-4 mb-5" style={{ background:'var(--surface-2)' }}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="price-now" style={{ fontSize:'2.4rem' }}>{fmt(now)}</span>
                {was && <span className="text-lg" style={{ color:'var(--text-muted)', textDecoration:'line-through' }}>{fmt(was)}</span>}
                {pct >= 5 && <Badge kind="sale">{pct}% OFF</Badge>}
              </div>
              {save > 0 && (
                <p className="text-sm font-extrabold mt-1" style={{ color:'var(--success)' }}>
                  You save {fmt(save)}
                </p>
              )}
              {product.has_offer && (
                <p className="text-xs font-bold mt-1.5" style={{ color:'var(--festival-orange)' }}>
                  🏷️ {product.offer_name} store-wide sale applied
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed mb-5" style={{ color:'var(--text-muted)' }}>
                {product.description}
              </p>
            )}

            {/* Desktop actions */}
            {!outOfStock && (
              <div className="hidden lg:block space-y-3 mb-5">
                <div className="flex items-center gap-3">
                  <QuantitySelector value={qty} onChange={setQty} />
                </div>
                <div className="flex gap-2.5">
                  <button onClick={handleAdd} className="btn btn-fire btn-lg flex-1">
                    <ShoppingCartIcon className="h-5 w-5" /> Add to Cart · {fmt(now * qty)}
                  </button>
                  <button onClick={() => { toggle(product); toast(wishlisted ? 'Removed' : '❤️ Saved'); }}
                    aria-label="Save to wishlist" className="btn btn-lg flex-shrink-0"
                    style={{
                      width:54, padding:0,
                      background: wishlisted ? 'rgba(217,4,41,.09)' : 'var(--surface)',
                      border:`2px solid ${wishlisted ? 'var(--primary-red)' : 'rgba(217,4,41,.15)'}`,
                    }}>
                    {wishlisted
                      ? <HeartSolid className="h-5 w-5" style={{ color:'var(--primary-red)' }} />
                      : <HeartIcon className="h-5 w-5" style={{ color:'var(--text-muted)' }} />}
                  </button>
                </div>
                <button onClick={handleBuyNow} className="btn btn-gold btn-lg w-full">
                  Buy Now
                </button>
              </div>
            )}

            {/* Trust */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                [ShieldCheckIcon, 'Licensed & BIS certified'],
                [TruckIcon,       'Delivery across Tamil Nadu'],
                [CheckBadgeIcon,  'Genuine Sivakasi product'],
                [ShieldCheckIcon, 'Safe, compliant packing'],
              ].map(([Icon, label], i) => (
                <div key={i} className="flex items-center gap-2 p-3 card">
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color:'var(--success)' }} />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
              ))}
            </div>

            {/* Safety */}
            <div className="p-4" style={{
              background:'rgba(247,127,0,.09)',
              border:'1px solid rgba(247,127,0,.28)',
              borderRadius:'var(--r-lg)',
            }}>
              <p className="text-sm font-extrabold mb-1 flex items-center gap-1.5"
                style={{ color:'var(--festival-orange)' }}>
                <ShieldCheckIcon className="h-4 w-4" /> Safety information
              </p>
              <p className="text-sm leading-relaxed" style={{ color:'var(--text)' }}>
                {HAZARD_COPY[product.hazard_class] || HAZARD_COPY.none}
              </p>
            </div>
          </div>
        </div>

        {/* Related */}
        {product.related?.length > 0 && (
          <Reveal className="mt-14">
            <h2 className="h-section mb-5">You might also like</h2>
            <div className="pgrid">
              {product.related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </Reveal>
        )}
      </div>

      {/* Sticky mobile buy bar */}
      {!outOfStock && (
        <motion.div initial={{ y:90 }} animate={{ y:0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-4 py-3 safe-bottom"
          style={{ background:'var(--surface)', boxShadow:'0 -4px 22px rgba(157,2,8,.13)' }}>
          <div className="flex items-center gap-2.5">
            <QuantitySelector value={qty} onChange={setQty} size="sm" />
            <button onClick={handleAdd} className="btn btn-fire flex-1">
              <ShoppingCartIcon className="h-5 w-5" /> Add · {fmt(now * qty)}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
