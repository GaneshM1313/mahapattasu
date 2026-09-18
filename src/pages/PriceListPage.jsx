// src/pages/PriceListPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { shopAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function PriceListPage() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [search,      setSearch]    = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          shopAPI.getProducts({ sort: 'name', order: 'ASC', page: 1, limit: 500 }),
          shopAPI.getCategories(),
        ]);
        setProducts(pRes.data.data || []);
        setCategories(cRes.data.data || []);
      } catch { toast.error('Failed to load price list'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Group products by category, filtered by search
  const grouped = useMemo(() => {
    const filtered = search
      ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      : products;

    const map = {};
    for (const p of filtered) {
      const key = p.category || 'Uncategorized';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    // Preserve category order from categories list where possible
    const orderedKeys = [
      ...categories.map(c => c.name).filter(name => map[name]),
      ...Object.keys(map).filter(k => !categories.some(c => c.name === k)),
    ];
    return orderedKeys.map(key => ({ category: key, items: map[key] }));
  }, [products, search, categories]);

  const handlePrint = () => window.print();

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
          <div>
            <h1 className="font-display font-black text-3xl text-gray-900">Price List</h1>
            <p className="text-gray-500 mt-1">Full catalogue with box-wise pricing</p>
          </div>
          <button onClick={handlePrint} className="btn-brand text-sm">
            <ArrowDownTrayIcon className="h-4 w-4" /> Download / Print
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 print:hidden">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search the price list..."
            className="shop-input pl-10 text-sm"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && grouped.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-gray-500 font-semibold">No products match "{search}"</p>
          </div>
        )}

        {/* Price table, grouped by category */}
        {!loading && grouped.map(({ category, items }) => (
          <div key={category} className="mb-6 bg-white rounded-2xl border border-gray-100 overflow-hidden print:border-gray-300 print:break-inside-avoid">
            <div className="bg-gray-800 text-white text-center font-display font-bold text-sm tracking-wide uppercase py-2.5">
              {category}
            </div>
            <table className="w-full text-sm">
              <tbody>
                {items.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2.5 text-gray-400 w-10 text-xs">{i + 1}</td>
                    <td className="px-2 py-2.5 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-2.5 text-center text-gray-500 text-xs font-semibold uppercase w-20">
                      {p.unit || 'PCS'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-red-600 w-24">
                      ₹{parseFloat(p.selling_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* Footer note */}
        {!loading && grouped.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-8 print:hidden">
            Prices inclusive of applicable taxes. Subject to change without prior notice.
          </p>
        )}
      </div>

      <style>{`
        @media print {
          header, footer, .print\\:hidden { display: none !important; }
          body { background: #fff; }
        }
      `}</style>
    </div>
  );
}
