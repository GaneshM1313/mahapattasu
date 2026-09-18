// mahapattasu-shop/src/components/common/CouponStrip.jsx
//
// Shows COUPON offers (is_global = 0) as informational cards.
// These do NOT change product prices — the customer copies the code
// and enters it at checkout, where the discount is applied.
//
// The store-wide sale (is_global = 1) is handled by SaleBanner instead.

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TagIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { shopAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-indigo-500',
  'from-teal-500 to-cyan-500',
  'from-amber-500 to-orange-500',
];

export default function CouponStrip() {
  const [coupons, setCoupons] = useState([]);
  const [copied,  setCopied]  = useState(null);

  useEffect(() => {
    shopAPI.getOffers()
      .then(r => setCoupons(r.data.data || []))   // /offers returns coupons only
      .catch(() => {});
  }, []);

  if (!coupons.length) return null;

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    toast.success(`Code "${code}" copied — paste it at checkout`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <TagIcon className="h-4 w-4 text-gray-400"/>
        <p className="text-sm font-bold text-gray-600">Coupon codes — apply at checkout</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {coupons.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
            transition={{ delay: i * 0.06 }}
            className="flex-shrink-0 rounded-xl border-2 border-dashed border-gray-300 bg-white overflow-hidden"
            style={{ minWidth: 230 }}
          >
            <div className={`bg-gradient-to-r ${COLORS[i % COLORS.length]} px-4 py-2`}>
              <p className="text-white font-black text-lg leading-none">
                {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
              </p>
              {c.min_amount && (
                <p className="text-white/80 text-[11px] mt-0.5">
                  On orders above ₹{c.min_amount}
                </p>
              )}
            </div>

            <div className="px-3 py-2.5">
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono font-black text-sm text-gray-800 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200 truncate">
                  {c.name}
                </code>
                <button
                  onClick={() => copyCode(c.name)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0"
                  title="Copy code"
                >
                  {copied === c.name
                    ? <CheckIcon className="h-4 w-4 text-green-500"/>
                    : <ClipboardDocumentIcon className="h-4 w-4"/>}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                Enter this code in your cart to redeem
              </p>
              {c.valid_until && (
                <p className="text-[10px] text-gray-400">
                  Expires {new Date(c.valid_until).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
