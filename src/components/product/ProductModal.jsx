// mahapattasu-shop/src/components/product/ProductModal.jsx
//
// Quick-view modal. The media area is now the MediaStage slider —
// image by default, swipe left for video when one exists.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingCartIcon, HeartIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useUIStore, useCartStore, useWishlistStore } from '../../store';
import { shopAPI } from '../../services/api';
import MediaStage from './MediaStage';
import { QuantitySelector, qtyFmt } from '../ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const fmt = (n) => `₹${parseFloat(n||0).toFixed(0)}`;
const EMOJIS = { none:'✨', division1:'🧨', division2:'🎆', division3:'🎇', division4:'🔥' };

export default function ProductModal() {
  const { productModal, closeProduct, openProduct } = useUIStore();
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const [qty, setQty]         = useState(1);
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);

  const product    = productModal;
  const wishlisted = product ? isWishlisted(product.id) : false;

  useEffect(() => {
    if (!product) { setDetail(null); setQty(1); return; }
    const load = async () => {
      setLoading(true);
      try {
        const r = await shopAPI.getProduct(product.id);
        setDetail(r.data.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [product?.id]);

  if (!product) return null;

  // Prefer the fuller record once it arrives (it carries video_url)
  const media      = detail || product;
  const listPrice  = parseFloat(media.selling_price);
  const onSale     = media.has_offer && media.offer_price != null;
  const price      = onSale ? parseFloat(media.offer_price) : listPrice;
  const mrp        = media.mrp ? parseFloat(media.mrp) : null;
  const outOfStock = media.stock_qty <= 0;
  const saving     = onSale ? listPrice - price : (mrp && mrp > listPrice ? mrp - listPrice : 0);

  const handleAddToCart = () => {
    const result = addItem(media, qty);
    if (result?.error) toast.error(result.error);
    else { toast.success(`${qty} × ${media.name} added! 🎆`); closeProduct(); }
  };

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          onClick={closeProduct} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"/>

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
            transition={{ type:'spring', damping:25 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            <button onClick={closeProduct}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
              <XMarkIcon className="h-5 w-5 text-gray-700"/>
            </button>

            <div className="flex flex-col md:flex-row overflow-y-auto">

              {/* ── Media slider ── */}
              <div className="md:w-2/5 p-4 flex-shrink-0">
                <MediaStage product={media} />
              </div>

              {/* ── Info ── */}
              <div className="flex-1 p-6 md:pl-2 overflow-y-auto">
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">{media.category}</p>
                <h2 className="font-display font-black text-xl text-gray-900 leading-tight mb-3">{media.name}</h2>

                {/* Price */}
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <span className={clsx('font-display font-black text-3xl', onSale ? 'text-orange-600' : 'text-red-600')}>
                    {fmt(price)}
                  </span>
                  {onSale ? (
                    <span className="text-lg text-gray-400 line-through">{fmt(listPrice)}</span>
                  ) : mrp && mrp > listPrice ? (
                    <span className="text-lg text-gray-400 line-through">{fmt(mrp)}</span>
                  ) : null}
                  {saving > 0 && (
                    <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded-lg">
                      Save {fmt(saving)}
                    </span>
                  )}
                </div>
                {onSale && (
                  <p className="text-sm text-orange-600 font-semibold -mt-2 mb-3">
                    🏷️ {media.discount_pct}% off — {media.offer_name}
                  </p>
                )}

                {/* Stock */}
                <div className={clsx('flex items-center gap-2 text-sm font-semibold mb-4',
                  outOfStock ? 'text-red-500' : media.stock_qty <= 5 ? 'text-orange-500' : 'text-green-600')}>
                  <div className={clsx('w-2 h-2 rounded-full',
                    outOfStock ? 'bg-red-500' : media.stock_qty <= 5 ? 'bg-orange-500' : 'bg-green-500')}/>
                  {outOfStock ? 'Out of Stock' : media.stock_qty <= 5 ? `Only ${qtyFmt(media.stock_qty)} left!` : 'In Stock'}
                </div>

                {loading ? <div className="skeleton h-16 rounded-xl mb-4"/> : detail?.description && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{detail.description}</p>
                )}

                {/* Safety */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheckIcon className="h-4 w-4 text-orange-600"/>
                    <span className="text-xs font-bold text-orange-700">Safety Information</span>
                  </div>
                  <p className="text-xs text-orange-600">
                    {media.hazard_class === 'none'
                      ? 'Safe for all ages. Handle with care.'
                      : `Hazard Class: ${String(media.hazard_class).toUpperCase()}. Keep away from fire. Use only under adult supervision.`}
                  </p>
                </div>

                {/* Qty */}
                {!outOfStock && (
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                    <QuantitySelector value={qty} onChange={setQty} max={media.stock_qty} />
                    <span className="text-sm text-gray-400">({qtyFmt(media.stock_qty)} available)</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button onClick={handleAddToCart} disabled={outOfStock}
                    className="flex-1 btn-brand justify-center py-3 disabled:opacity-50">
                    <ShoppingCartIcon className="h-5 w-5"/>
                    {outOfStock ? 'Out of Stock' : `Add to Cart — ${fmt(price * qty)}`}
                  </button>
                  <button onClick={() => { toggle(media); toast(wishlisted ? 'Removed' : '❤️ Wishlisted'); }}
                    aria-label="Save to wishlist"
                    className={clsx('p-3 rounded-xl border-2 transition-colors',
                      wishlisted ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300')}>
                    {wishlisted ? <HeartSolid className="h-5 w-5 text-red-500"/> : <HeartIcon className="h-5 w-5 text-gray-400"/>}
                  </button>
                </div>

                {/* Perks */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    { icon: TruckIcon,       text: 'Delivery across Tamil Nadu' },
                    { icon: ShieldCheckIcon, text: 'Licensed & certified' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-2.5">
                      <Icon className="h-4 w-4 text-red-400 flex-shrink-0"/>{text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Related */}
            {detail?.related?.length > 0 && (
              <div className="border-t border-gray-100 p-5 flex-shrink-0">
                <h3 className="text-sm font-bold text-gray-700 mb-3">Related Products</h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {detail.related.map(rel => (
                    <div key={rel.id} onClick={() => openProduct(rel)}
                      className="flex-shrink-0 w-28 cursor-pointer hover:scale-105 transition-transform">
                      <div className="relative h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center text-3xl mb-1 overflow-hidden">
                        {(rel.thumb_url || rel.image_url)
                          ? <img src={rel.thumb_url || rel.image_url} alt={rel.name} className="w-full h-full object-cover"/>
                          : (EMOJIS[rel.hazard_class] || '🎆')}
                      </div>
                      <p className="text-xs font-semibold text-gray-700 truncate">{rel.name}</p>
                      <p className="text-xs font-bold text-red-600">
                        ₹{parseFloat(rel.has_offer && rel.offer_price != null ? rel.offer_price : rel.selling_price).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  );
}
