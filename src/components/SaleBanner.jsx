// mahapattasu-shop/src/components/common/SaleBanner.jsx
//
// Shows a prominent banner whenever a store-wide sale is running.
// Reads `global_offer` from the products API response — no extra call.
//
// Usage in ProductsPage.jsx / HomePage.jsx:
//   const [globalOffer, setGlobalOffer] = useState(null);
//   ...in the fetch:  setGlobalOffer(r.data.global_offer || null);
//   ...in the JSX:    <SaleBanner offer={globalOffer} />

import React from 'react';
import { motion } from 'framer-motion';

export default function SaleBanner({ offer }) {
  if (!offer || offer.type !== 'percentage') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden mb-5 relative"
      style={{ background: 'linear-gradient(135deg, #f97316 0%, #e63946 100%)' }}
    >
      {/* Decorative sparkles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
        <span className="absolute top-2 left-[10%] text-2xl">✨</span>
        <span className="absolute bottom-2 left-[30%] text-xl">🎆</span>
        <span className="absolute top-3 right-[20%] text-2xl">🎇</span>
        <span className="absolute bottom-3 right-[8%] text-xl">✨</span>
      </div>

      <div className="relative px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 flex-shrink-0">
            <p className="font-display font-black text-3xl text-white leading-none">
              {offer.value}%
            </p>
            <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider text-center">
              OFF
            </p>
          </div>
          <div>
            <p className="font-display font-black text-xl text-white leading-tight">
              {offer.name}
            </p>
            <p className="text-white/85 text-sm">
              Discount applied to every product — no code needed
            </p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
          <p className="text-white text-xs font-bold">🔥 Limited time</p>
        </div>
      </div>
    </motion.div>
  );
}
