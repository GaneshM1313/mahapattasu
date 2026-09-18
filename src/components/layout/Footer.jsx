// src/components/layout/Footer.jsx
// Large dark festive footer. Mobile collapses link groups into
// accordions so it doesn't become an endless scroll.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { GlowOrb } from '../ui';
import { SHOP_NAME, SHOP_TAGLINE, SHOP_PHONES, SHOP_ADDRESS_LINES } from '../../config/tenant';

const GROUPS = [
  { title:'Shop', links:[
    ['All Products','/products'], ['Combos','/products?combo=1'],
    ['Offers','/offers'], ['Price List','/price-list'],
  ]},
  { title:'Account', links:[
    ['My Orders','/orders'], ['Wishlist','/wishlist'],
    ['Profile','/profile'], ['Cart','/products'],
  ]},
  { title:'Company', links:[
    ['About Us','/about'], ['Contact','/contact'],
    ['Price List','/price-list'],
  ]},
];

export default function Footer() {
  const [open, setOpen] = useState(null);

  return (
    <footer className="relative overflow-hidden" style={{ background:'var(--grad-night)' }}>
      <GlowOrb color="#d90429" size={340} style={{ left:'-8%', top:'-20%' }} />
      <GlowOrb color="#f77f00" size={280} style={{ right:'-5%', bottom:'-25%' }} />

      <div className="wrap relative z-10 pt-16 pb-12 md:pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center flex-shrink-0"
                style={{ width:44, height:44, borderRadius:13, background:'var(--grad-fire)', fontSize:23 }}>
                🎆
              </span>
              <div className="leading-tight">
                <p className="font-display font-black text-white text-lg">{SHOP_NAME}</p>
                <p style={{ fontSize:'.563rem', fontWeight:800, letterSpacing:'.14em', color:'var(--gold)' }}>
                  {SHOP_TAGLINE}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color:'rgba(255,255,255,.6)' }}>
              Premium licensed fireworks straight from the factories of Sivakasi.
              Celebrating with families across Tamil Nadu since 2010.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-2"
              style={{
                background:'rgba(15,157,88,.15)',
                border:'1px solid rgba(15,157,88,.35)',
                borderRadius:'var(--r-md)',
              }}>
              <span>✅</span>
              <div>
                <p className="text-xs font-extrabold" style={{ color:'#6ee7a8' }}>Licensed & Certified</p>
                <p className="text-[.625rem]" style={{ color:'rgba(110,231,168,.7)' }}>BIS approved products</p>
              </div>
            </div>
          </div>

          {/* Link groups */}
          {GROUPS.map(g => (
            <div key={g.title}>
              {/* Mobile accordion header */}
              <button onClick={() => setOpen(open === g.title ? null : g.title)}
                className="md:hidden w-full flex items-center justify-between py-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,.1)' }}>
                <span className="font-display font-bold text-white text-sm">{g.title}</span>
                <ChevronDownIcon className="h-4 w-4 text-white transition-transform"
                  style={{ transform: open === g.title ? 'rotate(180deg)' : 'none' }} />
              </button>

              <p className="hidden md:block font-display font-bold text-white mb-4">{g.title}</p>

              <div className={`${open === g.title ? 'block' : 'hidden'} md:block py-2 md:py-0 space-y-2.5`}>
                {g.links.map(([l, p]) => (
                  <Link key={p + l} to={p}
                    className="block text-sm transition-colors hover:text-white"
                    style={{ color:'rgba(255,255,255,.58)' }}>
                    {l}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8"
          style={{ borderTop:'1px solid rgba(255,255,255,.1)' }}>
          {[
            ['📍','Visit us', ...SHOP_ADDRESS_LINES],
            ['📞','Call us', ...SHOP_PHONES],
            ['🕐','Open','Mon–Sun, 8 AM – 9 PM'],
          ].map(([icon, label, ...vals]) => (
            <div key={label} className="flex items-start gap-3">
              <span className="flex items-center justify-center flex-shrink-0"
                style={{ width:38, height:38, borderRadius:11, background:'rgba(255,255,255,.08)', fontSize:17 }}>
                {icon}
              </span>
              <div>
                <p className="text-[.625rem] font-bold uppercase tracking-wider"
                  style={{ color:'var(--gold)' }}>{label}</p>
                {label === 'Call us' ? (
                  <div className="flex flex-col">
                    {vals.map(num => (
                      <a key={num} href={`tel:${num.replace(/\s/g, '')}`}
                        className="text-sm font-semibold text-white hover:text-gold transition-colors">{num}</a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-white">
                    {vals.map((v, i) => <span key={i} className="block">{v}</span>)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-6 text-xs"
          style={{ borderTop:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.42)' }}>
          <p>© {new Date().getFullYear()} {SHOP_NAME} · Virudhunagar. All rights reserved.</p>
          <p>Made with ❤️ in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
