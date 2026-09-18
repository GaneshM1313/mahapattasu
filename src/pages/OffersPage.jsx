// src/pages/OffersPage.jsx
//
// Shows both kinds of discount your backend supports:
//   • the store-wide sale (is_global = 1) — already applied to prices
//   • coupon codes (is_global = 0) — customer enters at checkout
//
// Uses the existing /shop/offers endpoint, which returns coupons in
// `data` and the active sale in `global_offer`.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TagIcon, ClipboardDocumentIcon, CheckIcon, ArrowRightIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import { shopAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import {
  fmt, SectionHeader, Sparks, GlowOrb, Reveal, EmptyState, ProductSkeleton,
} from '../components/ui';
import toast from 'react-hot-toast';

const GRADS = [
  'linear-gradient(135deg,#7209b7,#b5179e)',
  'linear-gradient(135deg,#3d5af1,#4cc9f0)',
  'linear-gradient(135deg,#0f9d58,#52b788)',
  'linear-gradient(135deg,#f77f00,#ffb703)',
  'linear-gradient(135deg,#d90429,#ff6b35)',
  'linear-gradient(135deg,#ff70a6,#ef233c)',
];

export default function OffersPage() {
  const [coupons,     setCoupons]     = useState([]);
  const [globalOffer, setGlobalOffer] = useState(null);
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [copied,      setCopied]      = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [oRes, pRes] = await Promise.all([
          shopAPI.getOffers(),
          shopAPI.getProducts({ sort:'selling_price', order:'DESC', limit:10, page:1 }),
        ]);
        setCoupons(oRes.data.data || []);
        setGlobalOffer(oRes.data.global_offer || pRes.data.global_offer || null);
        // Show discounted products when a sale is running
        const all = pRes.data.data || [];
        setProducts(all.filter(p => p.has_offer).slice(0, 10));
      } catch {
        toast.error('Could not load offers');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    toast.success(`Code "${code}" copied — use it at checkout`);
    setTimeout(() => setCopied(null), 2000);
  };

  const nothing = !loading && !globalOffer && coupons.length === 0;

  return (
    <div className="page-top" style={{ background:'var(--cream)', minHeight:'100vh' }}>

      {/* Page head */}
      <div className="relative overflow-hidden" style={{ background:'var(--grad-night)' }}>
        <GlowOrb color="#f77f00" size={340} style={{ right:'-6%', top:'-30%' }} />
        <GlowOrb color="#d90429" size={280} style={{ left:'-5%', bottom:'-40%' }} />
        <Sparks count={22} />
        <div className="wrap relative z-10 py-10 md:py-14 text-center">
          <p className="eyebrow mb-2" style={{ color:'var(--gold)' }}>Save more</p>
          <h1 className="h-section text-white mb-2">🎁 Offers & Deals</h1>
          <p className="text-sm max-w-md mx-auto" style={{ color:'rgba(255,255,255,.66)' }}>
            Live discounts and coupon codes on premium Sivakasi fireworks
          </p>
        </div>
      </div>

      <div className="wrap py-8">

        {nothing && (
          <EmptyState
            emoji="🏷️"
            title="No active offers right now"
            message="Check back soon — festive deals go live regularly"
            action={<Link to="/products" className="btn btn-fire">Browse products</Link>}
          />
        )}

        {/* ── Store-wide sale ── */}
        {globalOffer && (
          <Reveal>
            <div className="relative overflow-hidden mb-10"
              style={{
                borderRadius:'var(--r-xl)',
                background:'var(--grad-deep)',
                boxShadow:'var(--sh-xl)',
              }}>
              <GlowOrb color="#ffb703" size={300} style={{ right:'-3%', top:'-45%' }} />
              <Sparks count={18} color="#ffd60a" />

              <div className="relative z-10 px-6 py-9 md:px-12 md:py-12 flex flex-col md:flex-row md:items-center gap-7">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 mb-3"
                    style={{
                      background:'var(--grad-gold)', color:'var(--deep-red)',
                      padding:'5px 14px', borderRadius:999,
                      fontSize:'.688rem', fontWeight:900, letterSpacing:'.06em',
                    }}>
                    <SparklesIcon className="h-3.5 w-3.5" /> LIVE NOW
                  </span>
                  <h2 className="h-display text-white mb-3" style={{ fontSize:'clamp(2rem,5.5vw,3.6rem)' }}>
                    {globalOffer.value}% OFF<br />
                    <span style={{ color:'var(--gold)' }}>Everything</span>
                  </h2>
                  <p className="text-base mb-6 max-w-md" style={{ color:'rgba(255,255,255,.78)' }}>
                    <strong style={{ color:'#fff' }}>{globalOffer.name}</strong> — every product in the
                    store is already discounted. No code needed, the sale price is
                    what you pay at checkout.
                  </p>
                  <Link to="/products" className="btn btn-gold btn-lg">
                    Shop the Sale <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                </div>

                <div className="hidden md:flex items-center justify-center flex-shrink-0"
                  style={{ width:190, height:190 }}>
                  <div className="floaty flex items-center justify-center"
                    style={{
                      width:165, height:165, borderRadius:'50%',
                      background:'rgba(255,214,10,.14)',
                      border:'2px dashed rgba(255,214,10,.45)', fontSize:70,
                    }}>
                    🎆
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Coupon codes ── */}
        {coupons.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              eyebrow="Enter at checkout"
              title="Coupon Codes"
              subtitle="Copy a code and paste it in your cart"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c, i) => (
                <Reveal key={c.id} delay={i * .06}>
                  <div className="relative overflow-hidden h-full"
                    style={{
                      borderRadius:'var(--r-lg)',
                      background:'var(--surface)',
                      border:'2px dashed rgba(217,4,41,.24)',
                    }}>
                    {/* Ticket notches */}
                    <span className="absolute rounded-full"
                      style={{ width:20, height:20, background:'var(--cream)', left:-10, top:'50%' }} />
                    <span className="absolute rounded-full"
                      style={{ width:20, height:20, background:'var(--cream)', right:-10, top:'50%' }} />

                    <div className="px-5 py-4" style={{ background: GRADS[i % GRADS.length] }}>
                      <p className="text-white font-display font-black text-3xl leading-none">
                        {c.type === 'percentage' ? `${c.value}% OFF` : `${fmt(c.value)} OFF`}
                      </p>
                      {c.min_amount && (
                        <p className="text-white/85 text-xs font-bold mt-1.5">
                          On orders above {fmt(c.min_amount)}
                        </p>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <code className="flex-1 font-mono font-black text-sm px-3 py-2.5 truncate"
                          style={{ background:'var(--surface-2)', borderRadius:'var(--r-sm)' }}>
                          {c.name}
                        </code>
                        <button onClick={() => copy(c.name)}
                          aria-label={`Copy code ${c.name}`}
                          className="flex items-center justify-center flex-shrink-0 transition-transform active:scale-90"
                          style={{ width:42, height:42, borderRadius:'var(--r-sm)', background:'var(--surface-2)' }}>
                          {copied === c.name
                            ? <CheckIcon className="h-5 w-5" style={{ color:'var(--success)' }} />
                            : <ClipboardDocumentIcon className="h-5 w-5" style={{ color:'var(--text-muted)' }} />}
                        </button>
                      </div>
                      <p className="text-xs flex items-center gap-1" style={{ color:'var(--text-muted)' }}>
                        <TagIcon className="h-3.5 w-3.5" />
                        Apply this code in your cart
                      </p>
                      {c.valid_until && (
                        <p className="text-[.688rem] mt-1" style={{ color:'var(--text-muted)' }}>
                          Valid until {new Date(c.valid_until).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ── Discounted products ── */}
        {(loading || products.length > 0) && (
          <section>
            <SectionHeader
              eyebrow="On sale now"
              title="🔥 Discounted Products"
              subtitle="Grab these while the sale lasts"
              to="/products"
            />
            {loading ? (
              <div className="pgrid">
                {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <div className="pgrid">
                {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
