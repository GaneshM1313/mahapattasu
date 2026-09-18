// mahapattasu-shop/src/components/product/ProductCard.jsx
//
// Reads offer_price / discount_pct straight off the product object —
// the backend attaches these whenever a store-wide sale is running,
// so no cart or coupon state is involved. The sale shows the moment
// the page loads.

import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCartStore, useWishlistStore, useUIStore } from '../../store';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const EMOJIS = { none:'✨', division1:'🧨', division2:'🎆', division3:'🎇', division4:'🔥' };

export default function ProductCard({ product, delay = 0 }) {
  const { addItem }              = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { openProduct }          = useUIStore();
  const wishlisted               = isWishlisted(product.id);

  const displayImage = product.thumb_url || product.image_url;
  const listPrice    = parseFloat(product.selling_price);
  const mrp          = product.mrp ? parseFloat(product.mrp) : null;

  // ── Store-wide sale, computed server-side ──────────────────
  const hasOffer   = !!product.has_offer && product.offer_price != null;
  const offerPrice = hasOffer ? parseFloat(product.offer_price) : null;
  const offerPct   = hasOffer ? product.discount_pct : 0;

  // Price the customer actually pays
  const finalPrice = hasOffer ? offerPrice : listPrice;

  // MRP savings shown only when no store sale is running
  const mrpDiscountPct = !hasOffer && mrp && mrp > listPrice
    ? Math.round(((mrp - listPrice) / mrp) * 100) : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock_qty <= 0) { toast.error('Out of stock'); return; }
    const result = addItem(product);
    if (result?.error) toast.error(result.error);
    else toast.success('Added to cart! 🎆', { duration: 1200 });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggle(product);
    toast(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist', { duration: 1200 });
  };

  return (
    <motion.div
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: Math.min(delay * 0.04, 0.4) }}
      className="product-card group"
      onClick={() => openProduct(product)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio:'1' }}>
        {displayImage ? (
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover" loading="lazy"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <span className="text-4xl sm:text-5xl">{EMOJIS[product.hazard_class] || '✨'}</span>
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all hidden sm:flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
          <button onClick={handleAddToCart} disabled={product.stock_qty <= 0}
            className="bg-white text-red-500 p-2.5 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50">
            <ShoppingCartIcon className="h-4 w-4"/>
          </button>
          <button onClick={e => { e.stopPropagation(); openProduct(product); }}
            className="bg-white text-gray-600 p-2.5 rounded-xl shadow-lg hover:bg-gray-100 transition-colors">
            <EyeIcon className="h-4 w-4"/>
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
          {hasOffer && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
              {offerPct}% OFF
            </span>
          )}
          {!hasOffer && mrpDiscountPct >= 5 && (
            <span className="bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {mrpDiscountPct}% OFF
            </span>
          )}
          {product.is_featured && (
            <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">⭐</span>
          )}
          {product.stock_qty <= 0 && (
            <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Out</span>
          )}
          {product.stock_qty > 0 && product.stock_qty <= 5 && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              Only {product.stock_qty}!
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist}
          className="absolute top-1.5 right-1.5 p-1.5 sm:p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all min-w-[32px] min-h-[32px] flex items-center justify-center">
          {wishlisted
            ? <HeartSolid className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500"/>
            : <HeartIcon  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400"/>}
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5 sm:p-3">
        <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
          {product.category}
        </p>
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-1.5">
          {product.name}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            <p className={clsx(
              'font-display font-black text-base sm:text-lg leading-none',
              hasOffer ? 'text-orange-600' : 'text-red-600'
            )}>
              ₹{finalPrice.toFixed(0)}
            </p>
            {hasOffer ? (
              <p className="text-[10px] sm:text-xs text-gray-400 line-through">₹{listPrice.toFixed(0)}</p>
            ) : mrp && mrp > listPrice ? (
              <p className="text-[10px] sm:text-xs text-gray-400 line-through">₹{mrp.toFixed(0)}</p>
            ) : null}
          </div>

          <button onClick={handleAddToCart} disabled={product.stock_qty <= 0}
            className={clsx(
              'flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all min-h-[32px]',
              product.stock_qty <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : hasOffer
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 active:scale-95'
                  : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
            )}>
            <ShoppingCartIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0"/>
            <span className="hidden xs:inline">{product.stock_qty <= 0 ? 'Out' : 'Add'}</span>
          </button>
        </div>

        {hasOffer && (
          <p className="text-[10px] text-orange-600 font-semibold mt-1">
            🎉 Save ₹{(listPrice - offerPrice).toFixed(0)} per unit
          </p>
        )}
      </div>
    </motion.div>
  );
}
