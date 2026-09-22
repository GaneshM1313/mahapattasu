// src/pages/ProductsPage.jsx
//
// Desktop — persistent sidebar filters + grid
// Mobile  — FILTER / SORT bar that opens a bottom-sheet drawer
//
// All existing query params still work (search, category_id), so
// links from the header, categories and hero keep functioning.

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon,
  ArrowsUpDownIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { shopAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton, EmptyState, priceOf } from '../components/ui';
import toast from 'react-hot-toast';

const SORTS = [
  { v:'selling_price-ASC',  l:'Price: Low → High' },
  { v:'selling_price-DESC', l:'Price: High → Low' },
  { v:'created_at-DESC',    l:'Newest first' },
];

const PRICE_BANDS = [
  { l:'Under ₹100',   min:0,    max:100  },
  { l:'₹100 – ₹300',  min:100,  max:300  },
  { l:'₹300 – ₹600',  min:300,  max:600  },
  { l:'₹600 – ₹1000', min:600,  max:1000 },
  { l:'Above ₹1000',  min:1000, max:null },
];

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [pagination,  setPagination]  = useState({});
  const [globalOffer, setGlobalOffer] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [drawer,      setDrawer]      = useState(null); // 'filter' | 'sort' | null

  const [search,     setSearch]     = useState(params.get('search') || '');
  const [categoryId, setCategoryId] = useState(params.get('category_id') || '');
  const [sort,       setSort]       = useState('selling_price-ASC');
  const [page,       setPage]       = useState(1);
  const [band,       setBand]       = useState(null);
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // ── Scroll-position memory (Shop page only) ──────────────────────
  // Save the exact scroll offset while browsing, and restore it when the
  // user returns Back/Forward from a product-detail page — so the list
  // reopens at the same category/section instead of jumping to the top.
  const navType  = useNavigationType();          // 'POP' on Back/Forward
  const restored = useRef(false);
  const SCROLL_KEY = 'shopScrollY';

  // Fresh visits (Shop link, filter changes) start at the top, no flash.
  useLayoutEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Continuously remember where we are on the page.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)); ticking = false; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)); // final capture on leave
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Restore only after the product list has rendered (page tall enough),
  // and only when arriving via Back/Forward.
  useEffect(() => {
    if (loading || restored.current) return;
    restored.current = true;
    if (navType === 'POP') {
      const y = Number(sessionStorage.getItem(SCROLL_KEY) || 0);
      if (y > 0) {
        requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
        setTimeout(() => window.scrollTo(0, y), 120); // second pass after images settle
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, navType]);

  useEffect(() => {
    // Only show categories that actually have products for this tenant —
    // an empty/placeholder category (0 products) has nothing to browse
    // into, so it's just clutter in the filter list.
    shopAPI.getCategories()
      .then(r => setCategories((r.data.data || []).filter(c => Number(c.product_count) > 0)))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const [sf, so] = sort.split('-');
    try {
      const r = await shopAPI.getProducts({
        search: search || undefined,
        category_id: categoryId || undefined,
        sort: sf, order: so, page, limit: 300,
      });
      setProducts(r.data.data || []);
      setPagination(r.data.pagination || {});
      setGlobalOffer(r.data.global_offer || null);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [search, categoryId, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* Client-side refinement on top of the server query */
  const shown = useMemo(() => {
    let list = products;
    if (band) {
      list = list.filter(p => {
        const { now } = priceOf(p);
        return now >= band.min && (band.max == null || now <= band.max);
      });
    }
    if (onSaleOnly)  list = list.filter(p => priceOf(p).pct >= 5);
    return list;
  }, [products, band, onSaleOnly]);

  const activeCount = [categoryId, band, onSaleOnly || null].filter(Boolean).length;

  /* Category-wise grouping — when no single category is selected, show
     products grouped under each category heading instead of one flat
     alphabetical list, so sizes/variants sit together for comparison. */
  const grouped = useMemo(() => {
    if (categoryId) return null;
    const order = categories.map(c => c.name);
    const map = new Map();
    shown.forEach(p => {
      const k = p.category || 'Other';
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    });
    return Array.from(map.entries()).sort((a, b) => {
      const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
  }, [shown, categoryId, categories]);

  const clearAll = () => {
    setSearch(''); setCategoryId(''); setBand(null);
    setOnSaleOnly(false); setSort('selling_price-ASC'); setPage(1);
    setParams({});
  };

  const chooseCategory = (id) => {
    setCategoryId(id); setPage(1);
    const next = new URLSearchParams(params);
    if (id) next.set('category_id', id); else next.delete('category_id');
    setParams(next);
  };

  const title = categoryId
    ? (categories.find(c => String(c.id) === String(categoryId))?.name || 'Products')
    : search ? `Results for “${search}”` : 'All Products';

  /* ── Filter panel, shared by sidebar and drawer ── */
  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="card p-4">
        <p className="text-sm font-extrabold mb-3">Categories</p>
        <div className="space-y-1">
          <button onClick={() => chooseCategory('')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              background: !categoryId ? 'var(--surface-2)' : 'transparent',
              color: !categoryId ? 'var(--primary-red)' : 'var(--text)',
            }}>
            🎆 All categories
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => chooseCategory(String(c.id))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: String(categoryId) === String(c.id) ? 'var(--surface-2)' : 'transparent',
                color: String(categoryId) === String(c.id) ? 'var(--primary-red)' : 'var(--text)',
              }}>
              <span className="truncate">{c.name}</span>
              <span className="text-xs flex-shrink-0" style={{ color:'var(--text-muted)' }}>
                {c.product_count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-extrabold mb-3">Price</p>
        <div className="space-y-1">
          {PRICE_BANDS.map(b => {
            const active = band?.l === b.l;
            return (
              <button key={b.l} onClick={() => setBand(active ? null : b)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: active ? 'var(--surface-2)' : 'transparent',
                  color: active ? 'var(--primary-red)' : 'var(--text)',
                }}>
                {b.l}
                {active && <CheckIcon className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <p className="text-sm font-extrabold mb-3">Availability</p>
        {[
          ['On sale only',  onSaleOnly,  setOnSaleOnly],
        ].map(([label, val, setter]) => (
          <label key={label} className="flex items-center gap-2.5 py-2 cursor-pointer">
            <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)}
              style={{ accentColor:'var(--primary-red)', width:17, height:17 }} />
            <span className="text-sm font-semibold">{label}</span>
          </label>
        ))}
      </div>

      {activeCount > 0 && (
        <button onClick={clearAll} className="btn btn-outline w-full btn-sm">
          <XMarkIcon className="h-4 w-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="page-top" style={{ background:'var(--cream)', minHeight:'100vh' }}>

      {/* Page head */}
      <div style={{ background:'var(--grad-night)' }} className="relative overflow-hidden">
        <div className="wrap py-8 md:py-11 relative z-10">
          <h1 className="h-section text-white">{title}</h1>
          <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,.6)' }}>
            {pagination.total || 0} products available
          </p>
          {globalOffer && (
            <span className="inline-flex items-center gap-1.5 mt-3"
              style={{
                background:'var(--grad-gold)', color:'var(--deep-red)',
                padding:'5px 13px', borderRadius:999, fontSize:'.688rem', fontWeight:900,
              }}>
              🏷️ {globalOffer.value}% OFF applied to all prices
            </span>
          )}
        </div>
      </div>

      <div className="wrap py-6">
        <div className="flex gap-6">

          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky" style={{ top:'calc(var(--header-h) + var(--announce-h) + 16px)' }}>
              <FilterPanel />
            </div>
          </aside>

          <div className="flex-1 min-w-0">

            {/* Search + sort — desktop */}
            <div className="hidden md:flex gap-3 mb-5">
              <form onSubmit={e => { e.preventDefault(); setPage(1); fetchProducts(); }}
                className="relative flex-1">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color:'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search products…" className="field pl-11" />
              </form>
              <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                className="field" style={{ width:190 }} aria-label="Sort products">
                {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>

            {/* Filter / Sort bar — mobile */}
            <div className="md:hidden grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setDrawer('filter')} className="btn btn-ghost btn-sm">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Filter{activeCount > 0 && ` (${activeCount})`}
              </button>
              <button onClick={() => setDrawer('sort')} className="btn btn-ghost btn-sm">
                <ArrowsUpDownIcon className="h-4 w-4" /> Sort
              </button>
            </div>

            {/* Mobile category rail */}
            <div className="rail no-scrollbar md:hidden mb-4">
              <button onClick={() => chooseCategory('')}
                className="btn btn-sm flex-shrink-0"
                style={{
                  background: !categoryId ? 'var(--grad-fire)' : 'var(--surface)',
                  color: !categoryId ? '#fff' : 'var(--text)',
                  border: !categoryId ? 'none' : '1px solid rgba(217,4,41,.15)',
                }}>All</button>
              {categories.map(c => {
                const on = String(categoryId) === String(c.id);
                return (
                  <button key={c.id} onClick={() => chooseCategory(String(c.id))}
                    className="btn btn-sm flex-shrink-0"
                    style={{
                      background: on ? 'var(--grad-fire)' : 'var(--surface)',
                      color: on ? '#fff' : 'var(--text)',
                      border: on ? 'none' : '1px solid rgba(217,4,41,.15)',
                    }}>{c.name}</button>
                );
              })}
            </div>

            {/* Grid */}
            {loading ? (
              <div className="pgrid">
                {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : shown.length === 0 ? (
              <EmptyState
                emoji="🔍"
                title="No products found"
                message="Try adjusting your filters or search terms"
                action={<button onClick={clearAll} className="btn btn-fire">Clear filters</button>}
              />
            ) : (
              <>
                {grouped ? (
                  <div className="space-y-10">
                    {grouped.map(([cat, list]) => {
                      return (
                        <section key={cat}>
                          <div className="flex items-center gap-3 mb-4">
                            <h2 className="h-section" style={{ fontSize:'1.35rem' }}>{cat}</h2>
                            <span style={{ background:'var(--surface-2)', color:'var(--primary-red)', fontWeight:800, fontSize:'.7rem', padding:'3px 10px', borderRadius:999 }}>{list.length}</span>
                          </div>
                          <div className="pgrid">
                            {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pgrid">
                    {shown.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                  </div>
                )}

                {!grouped && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-9">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}
                      className="btn btn-ghost btn-sm">← Prev</button>
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const n = Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i;
                      if (n > pagination.pages) return null;
                      return (
                        <button key={n} onClick={() => setPage(n)}
                          className="btn btn-sm"
                          style={{
                            width:40, padding:0,
                            background: page === n ? 'var(--grad-fire)' : 'var(--surface)',
                            color: page === n ? '#fff' : 'var(--text)',
                            border: page === n ? 'none' : '1px solid rgba(217,4,41,.15)',
                          }}>{n}</button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(pagination.pages, p+1))}
                      disabled={page >= pagination.pages} className="btn btn-ghost btn-sm">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ── */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setDrawer(null)}
              className="fixed inset-0 z-50 md:hidden"
              style={{ background:'rgba(22,18,26,.5)', backdropFilter:'blur(3px)' }} />

            <motion.div
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:30, stiffness:320 }}
              className="fixed left-0 right-0 bottom-0 z-50 md:hidden flex flex-col"
              style={{
                background:'var(--surface)',
                borderRadius:'var(--r-xl) var(--r-xl) 0 0',
                maxHeight:'82vh',
              }}
              role="dialog" aria-label={drawer === 'filter' ? 'Filters' : 'Sort options'}
            >
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom:'1px solid rgba(217,4,41,.09)' }}>
                <p className="font-display font-extrabold text-lg">
                  {drawer === 'filter' ? 'Filters' : 'Sort by'}
                </p>
                <button onClick={() => setDrawer(null)} aria-label="Close"
                  className="flex items-center justify-center"
                  style={{ width:34, height:34, borderRadius:10, background:'var(--surface-2)' }}>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 safe-bottom">
                {drawer === 'filter' ? <FilterPanel /> : (
                  <div className="space-y-1">
                    {SORTS.map(s => (
                      <button key={s.v}
                        onClick={() => { setSort(s.v); setPage(1); setDrawer(null); }}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold"
                        style={{
                          background: sort === s.v ? 'var(--surface-2)' : 'transparent',
                          color: sort === s.v ? 'var(--primary-red)' : 'var(--text)',
                        }}>
                        {s.l}
                        {sort === s.v && <CheckIcon className="h-5 w-5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {drawer === 'filter' && (
                <div className="p-4 flex-shrink-0 safe-bottom"
                  style={{ borderTop:'1px solid rgba(217,4,41,.09)' }}>
                  <button onClick={() => setDrawer(null)} className="btn btn-fire w-full">
                    Show {shown.length} products
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
