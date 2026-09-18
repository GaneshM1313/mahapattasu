import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon, TrashIcon, ShoppingBagIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useCartStore, useUIStore, useAuthStore } from '../../store';
import { shopAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);

export default function CartDrawer() {
  const cartOpen         = useUIStore(s => s.cartOpen);
  const { closeCart, openAuth } = useUIStore();
  const { items, removeItem, updateQty, getSubtotal, getTax, getTotal, coupon, couponDiscount, applyCoupon, removeCoupon, clearCart } = useCartStore();
  const { isLoggedIn }   = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying]     = useState(false);
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const tax      = getTax();
  const total    = getTotal();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return; }
    setApplying(true);
    try {
      const r = await shopAPI.applyCoupon({ code: couponCode.trim().toUpperCase(), subtotal });
      applyCoupon(r.data.data.offer, r.data.data.discount);
      toast.success(r.data.message);
      setCouponCode('');
    } catch(e) { toast.error(e.response?.data?.message||'Invalid coupon'); }
    finally { setApplying(false); }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) { closeCart(); openAuth('login'); toast('Please login to place your order'); return; }
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"/>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}
            transition={{type:'spring',damping:28,stiffness:300}}
            className="cart-drawer"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-red-500 to-orange-500 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="h-5 w-5 text-white"/>
                <span className="font-display font-bold text-white text-lg">My Cart</span>
                {items.length > 0 && (
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 min-w-[40px] min-h-[40px] flex items-center justify-center">
                <XMarkIcon className="h-5 w-5"/>
              </button>
            </div>

            {/* Items list — scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-gray-400">
                  <div className="text-7xl mb-4">🛒</div>
                  <p className="font-semibold text-gray-600 text-lg text-center">Your cart is empty</p>
                  <p className="text-sm mt-2 mb-6 text-center">Add some fireworks to celebrate!</p>
                  <button onClick={() => { closeCart(); navigate('/products'); }} className="btn-brand text-sm">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 px-4 py-3.5">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {item.hazard_class==='division1'?'🧨':item.hazard_class==='none'?'✨':'🎆'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.category||'—'}</p>
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="qty-control" style={{borderRadius:'10px'}}>
                            <button className="qty-btn" style={{width:'34px',height:'34px',fontSize:'16px'}}
                              onClick={() => updateQty(item.id, item.qty-1)}>−</button>
                            <span className="qty-num" style={{minWidth:'36px',fontSize:'14px'}}>{item.qty}</span>
                            <button className="qty-btn" style={{width:'34px',height:'34px',fontSize:'16px'}}
                              onClick={() => {
                                if (item.qty < item.stock_qty) updateQty(item.id, item.qty+1);
                                else toast.error('Max stock reached');
                              }}>+</button>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-red-600 text-sm">{fmt(parseFloat(item.selling_price)*item.qty)}</p>
                            {item.mrp && parseFloat(item.mrp)>parseFloat(item.selling_price) && (
                              <p className="text-xs text-gray-400 line-through">{fmt(parseFloat(item.mrp)*item.qty)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button onClick={()=>removeItem(item.id)} className="text-gray-300 hover:text-red-400 p-1 flex-shrink-0 self-start mt-1 min-w-[28px] min-h-[28px] flex items-center justify-center">
                        <TrashIcon className="h-4 w-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom section — fixed, always visible */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-100 bg-white cart-safe-bottom">
                {/* Coupon */}
                <div className="px-4 py-3 border-b border-gray-50">
                  {coupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-green-600 flex-shrink-0"/>
                        <span className="text-sm font-bold text-green-700">{coupon.name}</span>
                        <span className="text-xs text-green-600">-{fmt(couponDiscount)}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-xs font-bold min-w-[44px] min-h-[28px] flex items-center justify-end">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e=>e.key==='Enter'&&handleApplyCoupon()}
                        placeholder="Coupon code…"
                        className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-red-400 min-h-[44px] bg-white"/>
                      <button onClick={handleApplyCoupon} disabled={applying}
                        className="btn-outline py-2 px-4 text-sm rounded-xl min-h-[44px] flex-shrink-0"
                        style={{borderRadius:'12px',minWidth:'72px'}}>
                        {applying?'…':'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST</span>
                    <span className="font-semibold">{fmt(tax)}</span>
                  </div>
                  {couponDiscount>0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({coupon?.name})</span>
                      <span className="font-bold">-{fmt(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-semibold ${subtotal>=999?'text-green-600':''}`}>
                      {subtotal>=999?'FREE 🎉':fmt(50)}
                    </span>
                  </div>
                  {/* Free shipping nudge */}
                  {subtotal<999 && (
                    <div className="mt-1 p-2 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-xs text-amber-700 font-semibold text-center">🚚 Add {fmt(999-subtotal)} more for FREE shipping!</p>
                      <div className="mt-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{width:`${Math.min(100,(subtotal/999)*100).toFixed(0)}%`}}/>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
                    <span className="font-bold text-gray-900 text-base">Total</span>
                    <span className="font-display font-black text-xl text-red-600">{fmt(total)}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <div className="px-4 pb-4 pt-1 space-y-2">
                  <button onClick={handleCheckout} className="w-full btn-brand justify-center text-base py-3.5" style={{borderRadius:'14px'}}>
                    <SparklesIcon className="h-5 w-5"/> Proceed to Checkout
                  </button>
                  <button onClick={clearCart} className="w-full py-2 text-xs text-gray-400 hover:text-red-400 transition-colors font-medium min-h-[36px]">
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
