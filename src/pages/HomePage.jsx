// src/pages/HomePage.jsx
//
// Section order follows the brief:
//   Hero → Trust → Categories → Best Sellers → Promo → Coupons
//   → Featured → Why Choose Us
//
// Sections that have no data simply don't render — no empty shells.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { shopAPI } from '../services/api';
import Hero from '../components/home/Hero';
import { TrustStrip, CategoryRail } from '../components/home/TrustStrip';
import { PromoBanner, OfferCards, WhyChooseUs } from '../components/home/PromoBanner';
import ProductCard from '../components/product/ProductCard';
import { SectionHeader, ProductSkeleton, Reveal } from '../components/ui';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [featured,    setFeatured]    = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [coupons,     setCoupons]     = useState([]);
  const [globalOffer, setGlobalOffer] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [fRes, cRes, oRes, pRes] = await Promise.all([
          shopAPI.getFeatured(),
          shopAPI.getCategories(),
          shopAPI.getOffers(),
          shopAPI.getProducts({ sort:'created_at', order:'DESC', limit:10, page:1 }),
        ]);
        setFeatured(fRes.data.data || []);
        setGlobalOffer(fRes.data.global_offer || oRes.data.global_offer || null);
        setCategories((cRes.data.data || []).filter(c => Number(c.product_count) > 0));
        setCoupons(oRes.data.data || []);
        setBestSellers(pRes.data.data || []);
      } catch {
        toast.error('Could not load the shop. Please refresh.');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="page-top">
      <Hero offer={globalOffer} />

      <TrustStrip />

      <CategoryRail categories={categories} />

      {/* ── Best sellers ── */}
      <section className="section">
        <div className="wrap">
          <SectionHeader
            eyebrow="Most popular"
            title="🔥 All Products"
            subtitle="Our most-loved fireworks this season"
            to="/products"
          />
          {loading ? (
            <div className="pgrid">
              {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : bestSellers.length ? (
            <>
              {/* Mobile rail keeps cards big enough to read */}
              <div className="rail no-scrollbar sm:hidden">
                {bestSellers.slice(0, 8).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} compact />
                ))}
              </div>
              <div className="hidden sm:grid pgrid">
                {bestSellers.slice(0, 10).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <PromoBanner offer={globalOffer} />

      <OfferCards coupons={coupons} />

      {/* ── Featured ── */}
      {(loading || featured.length > 0) && (
        <section className="section section-warm">
          <div className="wrap">
            <SectionHeader
              eyebrow="Hand picked"
              title="⭐ Featured Products"
              subtitle="Chosen by our team for quality and value"
              to="/products"
            />
            {loading ? (
              <div className="pgrid">
                {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : (
              <div className="pgrid">
                {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      <WhyChooseUs />

      {/* ── Closing CTA ── */}
      <section style={{ background:'var(--grad-festive)' }}>
        <div className="wrap text-center py-10 md:py-14">
          <p className="text-4xl md:text-5xl mb-4">🎆🎇✨</p>
          <h2 className="h-section text-white mb-2">Ready to celebrate?</h2>
          <p className="text-white/85 mb-6 max-w-md mx-auto">
            Browse the full range of licensed Sivakasi fireworks
          </p>
          <Link to="/products" className="btn btn-lg"
            style={{ background:'#fff', color:'var(--primary-red)', fontWeight:900 }}>
            Shop All Products <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
