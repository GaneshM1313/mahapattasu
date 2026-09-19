// src/pages/CombosPage.jsx
// ------------------------------------------------------------------
// Maha Pattasu — Combo Collection page.
// Plugs into the existing app: adds combos to the real Zustand cart
// (useCartStore), opens the shared cart drawer (useUIStore), shows
// react-hot-toast messages, and orders on WhatsApp using the number
// in src/config/tenant.js. Route it at /combos in App.jsx.
// ------------------------------------------------------------------
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCartStore, useUIStore } from '../store';
import { ADMIN_WHATSAPP_NUMBER } from '../config/tenant';
import comboPosters from '../data/comboPosters';
import './CombosPage.css';

const money = (n) => '₹' + n.toLocaleString('en-IN');
const P = (n, q) => ({ n, q });

/* ---- combo data (from the Maha Pattasu posters) ---- */
const COMBOS = [
  { id: 'combo-10000', price: '₹10,000', priceNum: 10000, name: 'Mega Family Combo', sub: '40 Items · Free Gift Box', items: 40, poster: 'p1000',
    desc: 'The perfect family starter — 40 assorted items with a free gift box.',
    badges: [['mp-b-gift', 'Gift Box Free'], ['mp-b-fam', 'Family Special']],
    checks: ['Premium Quality', 'Free Gift Box', '40 Assorted Items', 'Branded Products', 'Sivakasi Crackers', 'Family Celebration'],
    cats: [
      { t: 'Fancy Crackers', e: '🎆', p: [P('2" Fancy Pipe','Box 3 Pcs'),P('3 Step Fancy Pipe','Box 3 Pcs'),P('2½" Fancy Pipe','1 Box'),P('3½" Fancy Pipe','1 Box'),P('4" Fancy Pipe','1 Box'),P('7 Color Shot','Box 5 Pcs'),P('12 Shot Rider','1 Box'),P('15 Shot Multi Color','1 Box'),P('30 Shot Multi Color','1 Box'),P('60 Shot Multi Color','1 Box'),P('Garba Night','Box 10 Pcs')] },
      { t: 'Day Crackers', e: '🎇', p: [P('Bijil Red','1 Pkt'),P('Bijli Kakki','1 Pkt'),P('3½ Lakshmi','1 Bundle'),P('4" Delux Elephant','1 Bundle'),P('5" Delux Tiger','1 Bundle'),P('Bullet Bomb','Box 10 Pcs'),P('Hydro Bomb','Box 10 Pcs'),P('Classic Bomb','Box 10 Pcs'),P('555 Bomb','Box 10 Pcs'),P('½ Kg Paper Bomb','1 Box'),P('¼ Kg Paper Bomb','1 Box'),P('1000 Wala','1 Box'),P('2000 Wala','1 Box')] },
      { t: 'Night Crackers', e: '🌙', p: [P('Flower Big','Box 10 Pcs'),P('Flower Special','Box 10 Pcs'),P('Color Koti','Box 10 Pcs'),P('Chakkar Big','Box 10 Pcs'),P('Chakkar Asoka','Box 10 Pcs'),P('Chakkar Special','Box 10 Pcs'),P('Wire Chakkar','Box 10 Pcs'),P('Disco Wheel','Box 10 Pcs'),P('Music Wheel','Box 5 Pcs'),P('1½ Twinkling','2 Box'),P('4 Twinkling','1 Box')] },
      { t: 'Fountains', e: '⛲', p: [P('Lilly Multi Color','Box 5 Pcs'),P('Golden Drops','Box 5 Pcs'),P('Peacock Feather','Box 5 Pcs'),P('Magical Peacock','1 Box'),P('Top Gun','Box 5 Pcs'),P('Dora Singer','Box 5 Pcs'),P('Water Queen','1 Box'),P('Rock Star','1 Box'),P('Golden Flower','Box 10 Pcs'),P('Shin Chan','Box 5 Pcs'),P('Madurai Malli','Box 3 Pcs'),P('Emu Egg','1 Box')] },
      { t: 'Kids Special', e: '🧒', p: [P('Amazing Pencil','Box 3 Pcs'),P('10cm Electric','5 Box'),P('15cm Color','2 Box'),P('30cm Electric','2 Box'),P('15cm Green','2 Box'),P('Helicopter','Box 5 Pcs'),P('Bambaram','Box 10 Pcs'),P('Butterfly','Box 10 Pcs'),P('Electric Stone','Box 10 Pcs'),P('Tin Beer Tri Color','Box 10 Pcs'),P('Tin Crackling','1 Box'),P('Money Bank','Box 3 Pcs'),P('90 Watts','Box 10 Pcs'),P('Kit Kat','Box 10 Pcs'),P('Cartoon','Box 10 Pcs'),P('Robin 7up Match','Box 10 Pcs'),P('Kung Fu Panda','1 Box'),P('Rainbow Smoke','Box 3 Pcs'),P('Zee Boom Baa','Box 10 Pcs'),P('Tirumala Fountain','1 Box'),P('Bada Peacock','1 Box'),P('Ranga Lava','1 Box'),P('Pop Corn','1 Box'),P('Titto','1 Box'),P('Spectra 3 in 1','1 Box'),P('Vel','1 Box'),P('Digital Wala','1 Box'),P('Fruit Fountain','1 Box')] },
    ] },
  { id: 'combo-3000', price: '₹3,000', priceNum: 3000, name: 'Captain Pack', sub: '36 Items · Super Value', items: 36, poster: 'p3000',
    desc: 'The crowd favourite — 36 boxes of colour, sound and sparkle.',
    badges: [['mp-b-pop', 'Popular'], ['mp-b-prem', 'Best Price']],
    checks: ['100% Quality Assured', 'Safe for Family', 'Branded Products', 'Sivakasi Crackers', 'TN & Bangalore Delivery', 'Best Gift for Loved Ones'],
    cats: [
      { t: 'Fancy Crackers', e: '🎆', p: [P('30 Shot Multi Color','1 Box'),P('12 Rider','1 Box'),P('2" Fancy Pipe','1 Box'),P('3½" Fancy Pipe','1 Box'),P('Chotta Fancy','1 Box'),P('Hero Sky Shot','1 Box')] },
      { t: 'Night Crackers', e: '🌙', p: [P('Flower Pot Big','1 Box'),P('Flower Pot Special','1 Box'),P('Color Koti','1 Box'),P('Chakkaram Big','1 Box'),P('Chakkaram Asoka','1 Box'),P('Dancing Butterfly','1 Box'),P('Golden Flower','1 Box'),P('4 Twinkling Star','1 Box'),P('1½ Twinkling','1 Box'),P('Disco Wheel','1 Box'),P('Photo Flash','1 Box'),P('Magical Peacock','1 Box'),P('Rocket Bomb','1 Box')] },
      { t: 'Fountains', e: '⛲', p: [P('Rainbow Smoke','1 Box'),P('Peacock Feather','1 Box'),P('Water Queen','1 Box')] },
      { t: 'Sparklers', e: '✨', p: [P('30cm Electric','2 Box'),P('30cm Color','2 Box'),P('10cm Electric','5 Box'),P('2¾ Kuruvi','10 Pkt')] },
      { t: 'Day Crackers', e: '🎇', p: [P('¼ Kg Paper Bomb','1 Box'),P('1K Lar','1 Box'),P('Red Bijili','1 Box'),P('Kakki Bijili','1 Box'),P('Bullet Bomb','1 Box'),P('4" Lakshmi Bundle','1 Box')] },
      { t: 'Kids Special', e: '🧒', p: [P('Kung Fu Panda','1 Box'),P('Helicopter','1 Box'),P('Kit Kat','1 Box'),P('Serphent Big','1 Box')] },
    ] },
  { id: 'combo-4000', price: '₹4,000', priceNum: 4000, name: 'Family Pack', sub: '50 Items · Special Combo', items: 50, poster: 'p4000',
    desc: '50-item special combo built for a full family Diwali celebration.',
    badges: [['mp-b-fam', 'Family Special'], ['mp-b-val', 'Best Value']],
    checks: ['Premium Quality', 'Family Celebration Pack', 'Branded Products', 'Delivery Available', 'Sivakasi Crackers', 'TN & Bangalore Delivery'],
    cats: [
      { t: 'Fancy Special', e: '🎆', p: [P('30 Shot Color','1 Box'),P('7 Shot Color','Box 5 pcs'),P('12 Shot Rider','1 Box'),P('2" Fancy Pipe','Box 3 pcs'),P('2½" Fancy Pipe','1 Box'),P('3½" Fancy Pipe','1 Box'),P('Chota Fancy Pipe','1 Box'),P('Peacock Feather','Box 5 pcs'),P('Golden Drops','Box 5 pcs')] },
      { t: 'Day Crackers', e: '🎇', p: [P('Bijili','Pkt 50 pcs'),P('Kakki Bijili','Pkt 100 pcs'),P('Bullet Bomb','Box 10 pcs'),P('King of King','Box 10 pcs'),P('¼ Kg Adiyal','1 Box'),P('3½ Lakshmi','Bundle'),P('5" Lakshmi','2 Pkt'),P('1000 Wala','1 Box')] },
      { t: 'Night Crackers', e: '🌙', p: [P('10cm Electric','5 Box'),P('15cm Color','2 Box'),P('30cm Crackling','2 Box'),P('1½ Twinkling','1 Box'),P('4 Twinkling','1 Box'),P('Flower Pot Big','2 Box'),P('Flower Pot Special','1 Box'),P('Chakaram Big','2 Box')] },
      { t: 'Special Crackers', e: '🎁', p: [P('Chakaram Asoka','1 Box'),P('Magical Peacock','1 Box'),P('Color Match Box','10 Box'),P('Water Queen','1 Box'),P('Disco Wheel','Box 10 pcs'),P('Garba Night','Box 10 pcs'),P('Bambaram','Box 10 pcs'),P('Pop Corn','Box 10 pcs'),P('Rock Star','1 Box'),P('Lilly Multi Color','Box 5 pcs'),P('Electric Stone','Box 10 pcs'),P('Magic Pops','Box 10 pcs'),P('Assorted Cartoon','Box 10 pcs'),P('Zee Boom Baa','Box 10 pcs'),P('Selfie Stick','Box 3 Pcs')] },
      { t: 'Kids Special', e: '🧒', p: [P('100 Wala','1 Pkt'),P('Helicopter','Box 50 Pcs'),P('Top Gun','Box 5 pcs'),P('Golden Flower','Box 10 pcs'),P('Amazing Pencil','Box 3 pcs'),P('90 Watts','Box 3 pcs'),P('Dora Singer','Box 5 pcs'),P('Magic Butterfly','Box 10 pcs'),P('Money Bank','Box 3 pcs'),P('Serpent Tablet','Box 50 Pcs')] },
    ] },
  { id: 'combo-5000', price: '₹5,000', priceNum: 5000, name: 'Super Star Pack', sub: '53 Items · Big Size Pack', items: 53, poster: 'p5000',
    desc: '53 premium items — the big-size pack for a dazzling Diwali night.',
    badges: [['mp-b-prem', 'Premium'], ['mp-b-pop', 'Best Choice']],
    checks: ['100% Quality', 'Safety First', 'Best Price', 'More Items More Fun', 'Sivakasi Crackers', 'TN & Bangalore Delivery'],
    cats: [
      { t: 'Day Crackers', e: '🎇', p: [P('Red Bijili','1 Bag'),P('Kakki Bijili','1 Bag'),P('3½" Lakshmi','1 Bundle'),P('Bullet Bomb','1 Box'),P('Hydro Bomb','1 Box'),P('¼ Kg Paper Bomb','1 Box'),P('6" Lakshmi','2 Pkt'),P('100 Wala','1 Box'),P('1000 Wala','1 Box'),P('24 Delux','1 Pkt'),P('Black Money','1 Pcs')] },
      { t: 'Night Crackers', e: '🌙', p: [P('7 Shot','1 Box'),P('12 Shot Rider','1 Box'),P('30 Shot Multi Color','1 Box'),P('2" 3 Pcs Fancy','1 Box'),P('2½" Special Pipe','1 Box'),P('3½" Fancy Pipe','1 Box'),P('Magical Peacock','1 Box'),P('Amazing Pencil','1 Box'),P('Flower Pot Special','1 Box'),P('Color Koti','1 Box'),P('Tri Color','1 Box'),P('Chakaram Asoka','1 Box'),P('Chakaram Spinner','1 Box'),P('Disco Wheel','1 Box'),P('Tirumala 2 Step','1 Box'),P('Chota Fancy','1 Box'),P('Helicopter','1 Box'),P('Butterfly','1 Box'),P('Tin Fountain','1 Box'),P('Garba Night','1 Box'),P('Rocket Bomb','1 Box')] },
      { t: 'Fountains', e: '⛲', p: [P('Magic Pops','1 Box'),P('Lilly Multi Color','1 Box'),P('Peacock Feather','1 Box'),P('Golden Flower','1 Box')] },
      { t: 'Sparklers', e: '✨', p: [P('10cm Electric','5 Box'),P('15cm Electric','1 Box'),P('15cm Red','1 Box'),P('30cm Color','1 Box'),P('30cm Green','1 Box'),P('1½ Twinkling','1 Box'),P('4 Twinkling','2 Box')] },
      { t: 'Kids Special', e: '🧒', p: [P('Dora Singer','1 Box'),P('Top Gun','1 Box'),P('Water Queen','1 Box'),P('Money Bank','1 Box'),P('Rainbow Smoke','1 Box'),P('Pop Corn Kit Kat','1 Box'),P('10-in-1 Color Match Box','1 Box'),P('Shin Chan','1 Box'),P('Serphent Egg','1 Box'),P('Selfie Stick','1 Box')] },
    ] },
  { id: 'combo-7500', price: '₹7,500', priceNum: 7500, name: 'Mega Family Pack', sub: '60 Items · Complete Celebration', items: 60, poster: 'p7500',
    desc: 'The complete family celebration pack — 60 items across every category.',
    badges: [['mp-b-prem', 'Mega Premium'], ['mp-b-fam', 'Complete Pack']],
    checks: ['Branded Products', '100% Quality', 'Affordable Price', 'Perfect for Families', 'Sivakasi Crackers', 'TN & Bangalore Delivery'],
    cats: [
      { t: 'Day Crackers', e: '🎇', p: [P('Bijili','Bag 50 Pcs'),P('Kakki Bijili','Bag 100 Pcs'),P('100 Bites','1 Pkt'),P('1000 Bites','1 Box'),P('24 Delux','1 Pkt'),P('Bullet Bomb','Box 10 Pcs'),P('King of King','Box 10 Pcs'),P('Digital Bomb','Box 10 Pcs'),P('¼ Kg Paper','1 Box'),P('4" Lakshmi Delux','1 Bundle')] },
      { t: 'Night Crackers', e: '🌙', p: [P('10cm Electric','5 Box'),P('10cm Crackling','5 Box'),P('15cm Green','2 Box'),P('30cm Red','2 Box'),P('1½ Twinkling','2 Box'),P('4 Twinkling','2 Box'),P('Amazing Pencil','Box 3 pcs'),P('Helicopter','Box 5 Pcs'),P('Magic Butterfly','Box 10 Pcs'),P('Flower Pot Big','Box 10 Pcs'),P('Flower Pot Special','Box 10 Pcs'),P('Color Koti','Box 10 Pcs'),P('Tri Color Fountain','Box 3 Pcs'),P('Chakram Big','Box 10 Pcs'),P('Chakram Asoka','Box 10 Pcs'),P('Chakram Special','Box 10 Pcs'),P('Disco Wheel','Box 10 Pcs'),P('Twin Wheel','Box 5 Pcs'),P('Water Queen','1 Box'),P('Tin Fountain','1 Box'),P('Tirumala 2 Step','1 Box'),P('Magical Peacock','1 Box'),P('Bada Peacock','1 Box'),P('Rock Star','1 Box'),P('Peacock Feather','Box 5 Pcs'),P('Golden Drops','Box 5 Pcs'),P('Lilly Multi','Box 5 pcs'),P('Color Match Box','Box 10 Pcs'),P('Golden Flower','Box 10 Pcs')] },
      { t: 'Fancy Special', e: '🎆', p: [P('60 Multi Color','1 Box'),P('30 Multi Color','1 Box'),P('12 Shot Sizzling','1 Box'),P('7 Shot Color','Box 5 pcs'),P('2" Fancy Pipe','1 Box'),P('2½" Fancy Pipe','1 Box'),P('2" 3 Step','Box 3 Pcs'),P('3½ Fancy Pipe','1 Box'),P('Emu Egg','Box 2 Pcs'),P('Pistol 5G','Box 2 Pcs'),P('Dora Singer','Box 5 pcs'),P('Ranga Lava','1 Box'),P('Digital Wala','1 Box'),P('50cm Electric','Box 5 pcs'),P('Rainbow Smoke','Box 3 Pcs'),P('Garba Night','Box 10 Pcs'),P('Magic Show','1 Box'),P('2000 Watts','1 Box'),P('5" Lakshmi','Bundle'),P('Serpent Tablet','Box 50 Pcs')] },
      { t: 'Kids Special', e: '🧒', p: [P('Bambaram','Box 10 Pcs')] },
    ] },
];

/* comparison rows */
const CMP = [
  { label: 'Items',                   fn: (c) => <span className="it">{c.items}</span> },
  { label: 'Pack type',               fn: (c) => c.badges[0][1] },
  { label: 'Family suitable',         fn: () => <span className="yes">✓</span> },
  { label: 'Most popular',            fn: (c) => c.id === 'combo-3000' ? <span className="yes">★</span> : <span className="no">—</span> },
  { label: 'Premium',                 fn: (c) => c.priceNum >= 5000 ? <span className="yes">✓</span> : <span className="no">—</span> },
  { label: 'Free gift box',           fn: (c) => c.id === 'combo-10000' ? <span className="yes">🎁</span> : <span className="no">—</span> },
  { label: 'Delivery TN & Bangalore', fn: () => <span className="yes">✓</span> },
];

// show packs cheapest → most expensive (₹3,000 … ₹10,000)
COMBOS.sort((a, b) => a.priceNum - b.priceNum);

const posterOf = (c) => comboPosters[c.poster];
const toProduct = (c) => ({
  id: c.id,
  name: `${c.price} ${c.name}`,
  selling_price: c.priceNum,
  offer_price: null,
  has_offer: false,
  stock_qty: 999,
  tax_rate: 0,
  image_url: posterOf(c),
  thumb_url: posterOf(c),
  is_combo: true,
  combo_items: c.items,
});
const waLink = (text) => `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export default function CombosPage() {
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const [activeId, setActiveId] = useState(null);
  const [qty, setQty]           = useState(1);
  const [activeCat, setActiveCat] = useState(0);

  const sheetRef  = useRef(null);
  const gridRef   = useRef(null);

  const active = COMBOS.find((c) => c.id === activeId) || null;

  /* lock background scroll while the detail overlay is open */
  useEffect(() => {
    document.body.style.overflow = activeId ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeId]);

  /* close the detail overlay on Escape */
  useEffect(() => {
    if (!activeId) return;
    const onKey = (e) => { if (e.key === 'Escape') setActiveId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId]);

  /* scroll-reveal for the combo cards */
  useEffect(() => {
    const cards = gridRef.current ? Array.from(gridRef.current.querySelectorAll('.mp-combo')) : [];
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      cards.forEach((el) => el.classList.add('mp-in'));
      return;
    }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('mp-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    cards.forEach((el, i) => { el.style.transitionDelay = (i * 70) + 'ms'; io.observe(el); });
    return () => io.disconnect();
  }, []);

  /* actions */
  const openDetail = (id) => { setActiveId(id); setQty(1); setActiveCat(0); if (sheetRef.current) sheetRef.current.scrollTop = 0; };
  const closeDetail = () => setActiveId(null);

  const addCombo = (c, q, openAfter = true) => {
    const res = addItem(toProduct(c), q);
    if (res && res.error) { toast.error(res.error); return; }
    toast.success(`${c.name} added to cart`);
    if (openAfter) openCart();
  };
  const bookNow = (c, q) => addCombo(c, q, true);
  const orderWhatsApp = (c, q) => {
    const msg = `Hello Maha Pattasu,\nI would like to order:\n\n${c.price} ${c.name}\n${c.items} Items\nQuantity: ${q}\n\nPlease share delivery and payment details.`;
    window.open(waLink(msg), '_blank', 'noopener');
  };

  const goCat = (i) => {
    setActiveCat(i);
    const sheet = sheetRef.current; if (!sheet) return;
    const el = sheet.querySelector(`#mp-cat-${i}`);
    if (el) sheet.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  };
  const scrollToItems = () => {
    const sheet = sheetRef.current; if (!sheet) return;
    const el = sheet.querySelector('#mp-items'); if (el) sheet.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
  };

  return (
    <div className="mp-combos page-top">
      {/* ---------------- COMBO GRID ---------------- */}
      <section className="mp-section">
        <div className="mp-wrap">
          <div className="mp-sechead">
            <h2 className="mp-gold">Pick your celebration pack</h2>
            <p>Five hand-built Sivakasi combos — from a family starter to the complete mega celebration. Tap any pack to see every item inside.</p>
          </div>
          <div className="mp-grid" ref={gridRef}>
            {COMBOS.map((c) => (
              <article className="mp-combo" key={c.id}>
                <div className="mp-media">
                  <div className="mp-badges">{c.badges.map((b, i) => <span key={i} className={`mp-badge ${b[0]}`}>{b[1]}</span>)}</div>
                  <img src={posterOf(c)} alt={`${c.name} poster`} loading="lazy"
                       onError={(e) => e.currentTarget.parentElement.classList.add('mp-noimg')} />
                  <div className="mp-price"><span className="rp">₹</span><span className="amt">{c.priceNum.toLocaleString('en-IN')}</span></div>
                </div>
                <div className="mp-body">
                  <h3>{c.name}</h3>
                  <span className="mp-items">🎇 {c.items} items</span>
                  <p className="mp-desc">{c.desc}</p>
                  <div className="mp-actions">
                    <button className="mp-btn mp-view" onClick={() => openDetail(c.id)}>View combo</button>
                    <button className="mp-btn mp-book" onClick={() => bookNow(c, 1)}>Book now</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- COMPARISON ---------------- */}
      <section className="mp-section">
        <div className="mp-wrap">
          <div className="mp-sechead">
            <h2 className="mp-gold">Which combo is right for you?</h2>
            <p>All five packs, side by side.</p>
          </div>
          <div className="mp-cmpscroll">
            <table className="mp-cmp">
              <thead>
                <tr>
                  <th className="rowlbl" />
                  {COMBOS.map((c) => (
                    <th key={c.id} className={c.id === 'combo-4000' ? 'mp-feat' : ''}>
                      <div className="mp-cmpcard">
                        <div className="p">{c.price}</div>
                        <div className="nm">{c.name}</div>
                        <button className="minibook" onClick={() => openDetail(c.id)}>View</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CMP.map((row) => (
                  <tr key={row.label}>
                    <td className="rowlbl">{row.label}</td>
                    {COMBOS.map((c) => (
                      <td key={c.id} className={c.id === 'combo-4000' ? 'mp-feat' : ''}>{row.fn(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------------- DETAIL OVERLAY ---------------- */}
      <div className={`mp-overlay ${activeId ? 'mp-open' : ''}`} aria-hidden={!activeId}>
        <div className="mp-sheet" ref={sheetRef}>
          {active && (
            <div className="mp-detail">
              <div className="mp-dtop">
                <button className="mp-back" onClick={closeDetail}>← All combos</button>
                <span className="mp-dbrand">👑 MAHA PATTASU</span>
              </div>

              <div className="mp-dhero">
                <div className="mp-dmedia">
                  <img src={posterOf(active)} alt={active.name}
                       onError={(e) => e.currentTarget.parentElement.classList.add('mp-noimg')} />
                  <div className="glow" />
                </div>
                <div className="mp-dinfo">
                  <span className="mp-eyebrow">Maha Pattasu · Sivakasi</span>
                  <div className="rupbig"><span className="r">₹</span><span className="a">{active.priceNum.toLocaleString('en-IN')}</span></div>
                  <h2 className="mp-display">{active.name}</h2>
                  <div className="mp-dsub">{active.sub}</div>
                  <div className="mp-dtag">{active.desc}</div>
                  <div className="mp-checks">{active.checks.map((t, i) => <div key={i}><span className="tick">✓</span>{t}</div>)}</div>
                  <div className="mp-dacts">
                    <button className="mp-act mp-a-cart" onClick={() => addCombo(active, qty)}>🛒 Add to cart</button>
                    <button className="mp-act mp-a-book" onClick={scrollToItems}>📲 See all items</button>
                    <button className="mp-act mp-a-wa" onClick={() => orderWhatsApp(active, qty)}>💬 Order on WhatsApp</button>
                  </div>
                </div>
              </div>

              <div className="mp-tabs">
                {active.cats.map((ct, i) => (
                  <button key={i} className={`mp-tab ${i === activeCat ? 'mp-active' : ''}`} onClick={() => goCat(i)}>{ct.e} {ct.t}</button>
                ))}
              </div>

              <div id="mp-items">
                {active.cats.map((ct, i) => (
                  <section className="mp-catblock" id={`mp-cat-${i}`} key={i}>
                    <div className="mp-cattitle">{ct.e} {ct.t}<span className="ctc">{ct.p.length} items</span></div>
                    <div className="mp-prodgrid">
                      {ct.p.map((pr, j) => (
                        <div className="mp-prod" key={j}>
                          <div className="pn">{pr.n}</div>
                          <div className="qt">{pr.q}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- STICKY ORDER BAR ---------------- */}
      <div className={`mp-orderbar ${activeId ? 'mp-show' : ''}`}>
        {active && (
          <>
            <div className="mp-obinfo">
              <div className="t">{active.name}</div>
              <div className="s">{active.items} items · {active.sub.split('·').slice(-1)[0].trim()}</div>
            </div>
            <div className="mp-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="increase">+</button>
            </div>
            <div className="mp-obprice">{money(active.priceNum * qty)}</div>
            <div className="mp-obacts">
              <button className="mp-act mp-a-cart" onClick={() => addCombo(active, qty)}>🛒 Add to cart</button>
              <button className="mp-act mp-a-wa" onClick={() => orderWhatsApp(active, qty)}>💬 WhatsApp</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
