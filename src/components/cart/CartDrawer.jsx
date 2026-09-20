// src/components/cart/CartDrawer.jsx
//
// Preserves all existing cart logic (store, coupon API, checkout route).
// What changes is the presentation: festive header, clearer line items,
// an explicit savings block, and a large sticky CTA.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  XMarkIcon, TrashIcon, ShoppingBagIcon, TagIcon,
  ArrowRightIcon, TruckIcon,
} from '@heroicons/react/24/outline';
import { useCartStore, useUIStore, useAuthStore } from '../../store';
import { shopAPI } from '../../services/api';
import { fmt, QuantitySelector, Sparks } from '../ui';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const cartOpen = useUIStore(s => s.cartOpen);
  const { closeCart, openAuth } = useUIStore();
  const {
    items, removeItem, updateQty, clearCart,
    getSubtotal, getListSubtotal, getSaleDiscount, getTotal, getTotalSavings,
    coupon, applyCoupon, removeCoupon, getUnitPrice,
  } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const [code, setCode]       = useState('');
  const [applying, setApply]  = useState(false);

  const subtotal     = getSubtotal();
  const listSubtotal = getListSubtotal();
  const saleDiscount = getSaleDiscount();
  const total        = getTotal();
  const saved        = getTotalSavings();
  const salePct      = items.find(i => i.has_offer)?.discount_pct;

  const handleCoupon = async () => {
    if (!code.trim()) { toast.error('Enter a coupon code'); return; }
    setApply(true);
    try {
      const r = await shopAPI.applyCoupon({ code: code.trim().toUpperCase(), subtotal });
      applyCoupon(r.data.data.offer, r.data.data.discount);
      toast.success(r.data.message);
      setCode('');
    } catch (e) { toast.error(e.response?.data?.message || 'Invalid coupon'); }
    finally { setApply(false); }
  };

  const checkout = () => {
    if (!isLoggedIn) { closeCart(); openAuth('login'); toast('Please login to place your order'); return; }
    closeCart(); navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={closeCart} className="fixed inset-0 z-50"
            style={{ background:'rgba(22,18,26,.55)', backdropFilter:'blur(4px)' }} />

          <motion.aside
            initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
            transition={{ type:'spring', damping:30, stiffness:320 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{ width:'min(430px,100vw)', background:'var(--cream)' }}
            role="dialog" aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="relative overflow-hidden flex-shrink-0"
              style={{ background:'var(--grad-fire)' }}>
              <Sparks count={12} />
              <div className="relative z-10 flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBagIcon className="h-5 w-5 text-white" />
                  <span className="font-display font-extrabold text-white text-lg">My Cart</span>
                  {items.length > 0 && (
                    <span className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background:'rgba(255,255,255,.24)', color:'#fff' }}>
                      {items.length}
                    </span>
                  )}
                </div>
                <button onClick={closeCart} aria-label="Close cart"
                  className="flex items-center justify-center"
                  style={{ width:36, height:36, borderRadius:11, background:'rgba(255,255,255,.2)' }}>
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Delivery note — no fixed fee shown; it depends on location & parcel */}
              {items.length > 0 && (
                <div className="relative z-10 px-5 pb-3.5">
                  <p className="text-white text-xs font-bold flex items-center gap-1.5">
                    <TruckIcon className="h-3.5 w-3.5" /> Delivery charges confirmed by our team on call
                  </p>
                </div>
              )}
            </div>

            {/* Sale strip */}
            {salePct && (
              <div className="px-5 py-2 flex-shrink-0 text-xs font-extrabold text-white flex items-center gap-2"
                style={{ background:'var(--festival-orange)' }}>
                🏷️ {salePct}% sale prices applied
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                  <div className="text-7xl mb-4">🛒</div>
                  <p className="font-display font-extrabold text-lg mb-1">Your cart is empty</p>
                  <p className="text-sm mb-6" style={{ color:'var(--text-muted)' }}>
                    Add some fireworks to get started
                  </p>
                  <button onClick={() => { closeCart(); navigate('/products'); }} className="btn btn-fire">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="p-3 space-y-2.5">
                  {items.map(item => {
                    const unit     = getUnitPrice(item);
                    const listUnit = parseFloat(item.selling_price);
                    const onSale   = item.has_offer && item.offer_price != null;
                    return (
                      <div key={item.id} className="card p-3 flex gap-3">
                        <div className="flex-shrink-0 relative overflow-hidden"
                          style={{
                            width:62, height:62, borderRadius:'var(--r-md)',
                            background:'var(--surface-2)',
                          }}>
                          {(item.thumb_url || item.image_url)
                            ? <img src={item.thumb_url || item.image_url} alt=""
                                className="w-full h-full object-cover" />
                            : <span className="flex items-center justify-center h-full text-2xl">🎆</span>}
                          {onSale && (
                            <span className="absolute top-0 right-0 text-white text-[.5rem] font-black px-1 py-0.5"
                              style={{ background:'var(--primary-red)', borderRadius:'0 0 0 6px' }}>
                              -{item.discount_pct}%
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold line-2 leading-snug">{item.name}</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-sm font-extrabold"
                              style={{ color: onSale ? 'var(--festival-orange)' : 'var(--primary-red)' }}>
                              {fmt(unit)}
                            </span>
                            {onSale && <span className="price-was">{fmt(listUnit)}</span>}
                          </div>

                          <div className="flex items-center justify-between mt-2 gap-2">
                            <QuantitySelector value={item.qty}
                              onChange={q => updateQty(item.id, q)}
                              size="sm" />
                            <div className="text-right">
                              <p className="text-sm font-black" style={{ color:'var(--primary-red)' }}>
                                {fmt(unit * item.qty)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}
                          className="flex-shrink-0 self-start p-1" style={{ color:'#c9bdb8' }}>
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="flex-shrink-0 safe-bottom"
                style={{ background:'var(--surface)', boxShadow:'0 -4px 20px rgba(157,2,8,.08)' }}>

                {/* Coupon */}
                <div className="px-4 py-3" style={{ borderBottom:'1px solid rgba(217,4,41,.07)' }}>
                  {coupon ? (
                    <div className="flex items-center justify-between px-3 py-2.5"
                      style={{ background:'var(--success-bg)', borderRadius:'var(--r-md)' }}>
                      <span className="flex items-center gap-2 text-sm font-extrabold"
                        style={{ color:'var(--success)' }}>
                        <TagIcon className="h-4 w-4" /> {coupon.name}
                      </span>
                      <button onClick={removeCoupon} className="text-xs font-bold"
                        style={{ color:'var(--primary-red)' }}>Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                        placeholder="Coupon code" className="field flex-1"
                        style={{ minHeight:44, padding:'10px 14px' }} />
                      <button onClick={handleCoupon} disabled={applying}
                        className="btn btn-outline btn-sm flex-shrink-0" style={{ minWidth:76 }}>
                        {applying ? '…' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="px-4 py-3 space-y-1.5 text-sm">
                  {saleDiscount > 0 && (
                    <>
                      <Row label={`Price (${items.length} items)`} value={fmt(listSubtotal)} strike />
                      <Row label={`Sale discount (${salePct}%)`} value={`−${fmt(saleDiscount)}`} accent="var(--festival-orange)" />
                    </>
                  )}
                  <Row label="Subtotal" value={fmt(subtotal)} bold />
                  {coupon && (
                    <Row label={`Coupon (${coupon.name})`}
                      value={`−${fmt(coupon.type === 'percentage' ? (subtotal*coupon.value)/100 : coupon.value)}`}
                      accent="var(--success)" />
                  )}
                  <div className="flex items-center justify-between pt-2.5 mt-1"
                    style={{ borderTop:'1px solid rgba(217,4,41,.1)' }}>
                    <span className="font-extrabold">To Pay</span>
                    <span className="price-now" style={{ fontSize:'1.5rem' }}>
                      {fmt(total)}
                    </span>
                  </div>

                  {saved > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 mt-1.5"
                      style={{ background:'var(--grad-gold)', borderRadius:'var(--r-md)' }}>
                      <span className="text-xs font-extrabold" style={{ color:'var(--deep-red)' }}>
                        🎉 You saved
                      </span>
                      <span className="text-sm font-black" style={{ color:'var(--deep-red)' }}>
                        {fmt(saved)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-4 pt-1">
                  <button onClick={checkout} className="btn btn-fire btn-lg w-full">
                    Proceed to Checkout <ArrowRightIcon className="h-5 w-5" />
                  </button>
                  <button onClick={clearCart}
                    className="w-full mt-2 py-2 text-xs font-semibold"
                    style={{ color:'var(--text-muted)', background:'none', border:'none' }}>
                    Clear cart
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, accent, bold, strike }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: accent || 'var(--text-muted)' }}>{label}</span>
      <span style={{
        color: accent || 'var(--text)',
        fontWeight: bold ? 800 : 600,
        textDecoration: strike ? 'line-through' : 'none',
        opacity: strike ? .6 : 1,
      }}>{value}</span>
    </div>
  );
}
