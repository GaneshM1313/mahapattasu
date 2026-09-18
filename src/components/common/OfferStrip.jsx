// src/components/common/OfferStrip.jsx
// Shows a horizontal scrollable strip of available offers above the product grid.
// Clicking an offer code copies it to clipboard and shows how to apply it.

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TagIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { shopAPI } from '../../services/api';
import { useCartStore, useUIStore } from '../../store';
import toast from 'react-hot-toast';

export default function OfferStrip() {
  const [offers, setOffers]       = useState([]);
  const [expanded, setExpanded]   = useState(null); // id of expanded offer
  const { coupon, applyCoupon }   = useCartStore();
  const { openCart }              = useUIStore();

  useEffect(() => {
    shopAPI.getOffers()
      .then(r => setOffers((r.data.data || []).filter(o => o.type === 'percentage' || o.type === 'fixed')))
      .catch(() => {});
  }, []);

  if (!offers.length) return null;

  const handleUseOffer = async (offer) => {
    try {
      // Get current subtotal from cart (0 if cart is empty, offer applies anyway for preview)
      const r = await shopAPI.applyCoupon({ code: offer.name, subtotal: 0 });
      applyCoupon(r.data.data.offer, 0); // discount=0 since subtotal=0, recalculated in cart
      toast.success(`${offer.name} applied! Open your cart to see savings 🎆`);
      openCart();
    } catch {
      // Show code to copy instead
      navigator.clipboard?.writeText(offer.name);
      toast.success(`Code "${offer.name}" copied! Paste it in your cart`);
    }
  };

  const COLORS = [
    { bg: 'from-red-500 to-orange-500', light: 'bg-red-50 border-red-200 text-red-700' },
    { bg: 'from-purple-500 to-pink-500', light: 'bg-purple-50 border-purple-200 text-purple-700' },
    { bg: 'from-green-500 to-teal-500', light: 'bg-green-50 border-green-200 text-green-700' },
    { bg: 'from-blue-500 to-indigo-500', light: 'bg-blue-50 border-blue-200 text-blue-700' },
  ];

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <TagIcon className="h-4 w-4 text-red-500"/>
        <p className="text-sm font-bold text-gray-700">Available Offers</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {offers.map((offer, i) => {
          const color   = COLORS[i % COLORS.length];
          const isOpen  = expanded === offer.id;
          const applied = coupon?.name === offer.name;

          return (
            <div key={offer.id} className="flex-shrink-0">
              <motion.div
                onClick={() => setExpanded(isOpen ? null : offer.id)}
                whileTap={{ scale: 0.97 }}
                className={`rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                  applied ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-red-300'
                }`}
                style={{ minWidth: 200 }}
              >
                {/* Offer card header */}
                <div className={`bg-gradient-to-r ${color.bg} px-4 py-2.5 flex items-center justify-between`}>
                  <div>
                    <p className="text-white font-black text-lg leading-none">
                      {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                    </p>
                    <p className="text-white/80 text-xs mt-0.5">{offer.name}</p>
                  </div>
                  <div className="text-2xl">{i % 2 === 0 ? '🎆' : '🎇'}</div>
                </div>

                {/* Brief info */}
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 leading-snug">
                    {offer.type === 'percentage'
                      ? `${offer.value}% off your entire order`
                      : `Flat ₹${offer.value} off`}
                    {offer.min_amount ? ` on orders above ₹${offer.min_amount}` : ''}
                  </p>
                  {offer.valid_until && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Valid till: {new Date(offer.valid_until).toLocaleDateString('en-IN')}
                    </p>
                  )}
                  {applied && (
                    <p className="text-xs font-bold text-green-600 mt-1">✅ Applied</p>
                  )}
                </div>
              </motion.div>

              {/* Expanded detail panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-1 rounded-xl border ${color.light} p-3`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold">Offer Code</p>
                        <button onClick={() => setExpanded(null)}>
                          <XMarkIcon className="h-3.5 w-3.5 opacity-50"/>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-current border-opacity-20 mb-2">
                        <span className="font-mono font-black text-sm flex-1">{offer.name}</span>
                        <button onClick={() => { navigator.clipboard?.writeText(offer.name); toast.success('Copied!'); }}
                          className="p-1">
                          <ClipboardDocumentIcon className="h-4 w-4"/>
                        </button>
                      </div>
                      {offer.type === 'percentage' && (
                        <p className="text-xs opacity-80 mb-2">
                          📌 This code applies <strong>{offer.value}% discount</strong> on every item in your cart
                        </p>
                      )}
                      <button onClick={() => { handleUseOffer(offer); setExpanded(null); }}
                        className={`w-full bg-gradient-to-r ${color.bg} text-white text-xs font-bold py-2 rounded-lg`}>
                        {applied ? '✅ Already Applied' : 'Apply This Offer'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
