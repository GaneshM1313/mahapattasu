// src/pages/ProductsPage.jsx
//
// Price-list style catalogue (LIST view, not grid).
//
//   • Sticky top bar: category dropdown + search + live cart summary
//     (Net / Disc / Total / Items) — like a traditional crackers order form.
//   • Products grouped by category under a red banner "CATEGORY (80% OFF)".
//   • Tapping a product expands its details INLINE under the row —
//     no navigation to a separate page.
//   • Mobile first: rows become compact cards and a floating cart bar
//     pinned to the bottom shows the running total.
//
// Existing query params (search, category_id) still work, so links from
// the header, home categories and hero keep functioning.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon, ChevronDownIcon, Bars3BottomLeftIcon, ShoppingCartIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { shopAPI } from '../services/api';
import { useCartStore, useUIStore } from '../store';
import ProductListRow from '../components/product/ProductListRow';
import { EmptyState, fmt, priceOf } from '../components/ui';
import toast from 'react-hot-toast';

/* Net / Disc / Total for the summary pills — same maths as the rows */
function useCartSummary() {
  const items = useCartStore(s => s.items);
  return useMemo(() => {
    let net = 0, total = 0;
    items.forEach(i => {
      const { now, was } = priceOf(i);
      net   += (was || now) * i.qty;
      total += now * i.qty;
    });
    return { net, disc: net - total, total, lines: items.length };
  }, [items]);
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const { openCart } = useUIStore();
  const summary = useCartSummary();

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [globalOffer, setGlobalOffer] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [openId,      setOpenId]      = useState(null);

  const [search,     setSearch]     = useState(params.get('search') || '');
  const [query,      setQuery]      = useState(params.get('search') || '');   // debounced
  const [categoryId, setCategoryId] = useState(params.get('category_id') || '');

  /* Keep in sync when the header search / category links change the URL */
  const urlSearch = params.get('search') || '';
  const urlCat    = params.get('category_id') || '';
  useEffect(() => { setSearch(urlSearch); setQuery(urlSearch); }, [urlSearch]);
  useEffect(() => { setCategoryId(urlCat); }, [urlCat]);

  /* Debounce typing → server search */
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* Lift floating buttons above the mobile cart bar while on this page */
  useEffect(() => {
    document.body.classList.add('has-cart-bar');
    return () => document.body.classList.remove('has-cart-bar');
  }, []);

  useEffect(() => {
    // Only categories that actually have products for this tenant
    shopAPI.getCategories()
      .then(r => setCategories((r.data.data || []).filter(c => Number(c.product_count) > 0)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    shopAPI.getProducts({
      search: query || undefined,
      category_id: categoryId || undefined,
      sort: 'selling_price', order: 'ASC', page: 1, limit: 300,
    })
      .then(r => {
        if (!alive) return;
        setProducts(r.data.data || []);
        setGlobalOffer(r.data.global_offer || null);
      })
      .catch(() => alive && toast.error('Failed to load products'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [query, categoryId]);

  /* Group by category, in the admin's category order */
  const grouped = useMemo(() => {
    const order = categories.map(c => c.name);
    const map = new Map();
    products.forEach(p => {
      const k = p.category || 'Other';
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    });
    return Array.from(map.entries()).sort((a, b) => {
      const ia = order.indexOf(a[0]); const ib = order.indexOf(b[0]);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
  }, [products, categories]);

  const chooseCategory = (id) => {
    setCategoryId(id); setOpenId(null);
    const next = new URLSearchParams(params);
    if (id) next.set('category_id', id); else next.delete('category_id');
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setSearch(''); setQuery(''); setCategoryId(''); setParams({});
  };

  const listRef = useRef(null);
  const toggleRow = (id) => {
    setOpenId(cur => (cur === id ? null : id));
  };

  return (
    <div className="page-top plv-page">

      {/* ── Sticky top bar ── */}
      <div className="plv-toolbar">
        <div className="plv-wrap plv-toolbar-inner">
          <label className="plv-cat">
            <Bars3BottomLeftIcon className="plv-cat-ico" aria-hidden="true" />
            <select value={categoryId} onChange={e => chooseCategory(e.target.value)}
              aria-label="Choose category">
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="plv-cat-chev" aria-hidden="true" />
          </label>

          <div className="plv-search">
            <MagnifyingGlassIcon className="plv-search-ico" aria-hidden="true" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search Product..." aria-label="Search products" enterKeyHint="search" />
            {search && (
              <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="plv-pills">
            <span className="plv-pill plv-pill-net">Net: {fmt(summary.net)}</span>
            <span className="plv-pill plv-pill-disc">Disc: {fmt(summary.disc)}</span>
            <span className="plv-pill plv-pill-total">Total: {fmt(summary.total)}</span>
            <button type="button" className="plv-pill plv-pill-cart" onClick={openCart}>
              <ShoppingCartIcon className="h-4 w-4" /> {summary.lines} Items
            </button>
          </div>
        </div>
      </div>

      {/* ── List ── */}
      <div className="plv-wrap plv-body" ref={listRef}>
        {loading ? (
          <section className="plv-section">
            <div className="plv-banner"><span className="skeleton" style={{ width: 220, height: 18, opacity: .35 }} /></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="plv-skel">
                <span className="skeleton" /><span className="skeleton" /><span className="skeleton" />
              </div>
            ))}
          </section>
        ) : grouped.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="No products found"
            message="Try another category or search term"
            action={<button onClick={clearAll} className="btn btn-fire">Show all products</button>}
          />
        ) : grouped.map(([cat, list]) => {
          const pct = globalOffer?.value
            ? Math.round(globalOffer.value)
            : Math.max(0, ...list.map(p => priceOf(p).pct));
          return (
            <section key={cat} className="plv-section">
              <h2 className="plv-banner">
                {cat}
                {pct > 0 && <span className="plv-banner-off">({pct}% OFF)</span>}
              </h2>

              <div className="plv-head" aria-hidden="true">
                <span>S.No</span><span>Image</span><span>Product Name</span>
                <span className="c">Content</span><span className="c">Actual Price</span>
                <span className="c">{pct > 0 ? `${pct}% Off` : 'Discount'}</span>
                <span className="c">Amount</span><span className="c">Quantity</span>
                <span className="r">Total</span>
              </div>

              {list.map((p, i) => (
                <ProductListRow key={p.id} product={p} sno={i + 1}
                  open={openId === p.id} onToggle={() => toggleRow(p.id)} />
              ))}
            </section>
          );
        })}
      </div>

      {/* ── Mobile floating cart bar ── */}
      <div className="plv-cartbar" role="region" aria-label="Order summary">
        <div className="plv-cartbar-info">
          <span className="plv-cartbar-meta">
            Net {fmt(summary.net)} · <b>Save {fmt(summary.disc)}</b>
          </span>
          <span className="plv-cartbar-total">{fmt(summary.total)}</span>
        </div>
        <button type="button" onClick={openCart} className="plv-cartbar-btn">
          <ShoppingCartIcon className="h-5 w-5" />
          {summary.lines} {summary.lines === 1 ? 'Item' : 'Items'}
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
