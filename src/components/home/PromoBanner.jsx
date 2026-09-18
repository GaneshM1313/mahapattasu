// src/components/home/PromoBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, TagIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Sparks, GlowOrb, Reveal, SectionHeader } from '../ui';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════════════════════════
   BIG PROMO BAND — the "DIWALI SPECIAL" energy block
═══════════════════════════════════════════════════════════════ */
export function PromoBanner({ offer }) {
  return (
    <section className="section">
      <div className="wrap">
        <Reveal>
          <div className="relative overflow-hidden"
            style={{
              borderRadius:'var(--r-xl)',
              background:'var(--grad-deep)',
              boxShadow:'var(--sh-xl)',
            }}>
            <GlowOrb color="#ffb703" size={300} style={{ right:'-4%', top:'-40%' }} />
            <GlowOrb color="#f77f00" size={240} style={{ left:'-6%', bottom:'-46%' }} />
            <Sparks count={20} color="#ffd60a" />

            <div className="relative z-10 px-6 py-10 md:px-12 md:py-14 flex flex-col md:flex-row md:items-center gap-7">
              <div className="flex-1">
                <p className="eyebrow mb-2" style={{ color:'var(--gold)' }}>
                  {offer ? 'Store-wide sale' : 'Festive collection'}
                </p>
                <h2 className="h-display text-white mb-3" style={{ fontSize:'clamp(1.9rem,5vw,3.4rem)' }}>
                  {offer ? (
                    <>{offer.value}% OFF<br /><span style={{ color:'var(--gold)' }}>Everything</span></>
                  ) : (
                    <>Diwali<br /><span style={{ color:'var(--gold)' }}>Bonanza</span></>
                  )}
                </h2>
                <p className="text-base mb-7 max-w-md" style={{ color:'rgba(255,255,255,.76)' }}>
                  {offer
                    ? `Every product in the store is discounted. No code needed — the sale price is already applied.`
                    : `Hand-picked combos and family packs at factory-direct prices.`}
                </p>
                <Link to="/products" className="btn btn-gold btn-lg">
                  Shop the Sale <ArrowRightIcon className="h-5 w-5" />
                </Link>
              </div>

              {/* Decorative burst tile */}
              <div className="hidden md:flex items-center justify-center flex-shrink-0"
                style={{ width:200, height:200 }}>
                <div className="floaty flex items-center justify-center"
                  style={{
                    width:170, height:170, borderRadius:'50%',
                    background:'rgba(255,214,10,.14)',
                    border:'2px dashed rgba(255,214,10,.45)',
                    fontSize:74,
                  }}>
                  🎆
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COUPON CARDS — checkout codes, shown as tickets
═══════════════════════════════════════════════════════════════ */
export function OfferCards({ coupons = [] }) {
  const [copied, setCopied] = React.useState(null);
  if (!coupons.length) return null;

  const GRADS = [
    'linear-gradient(135deg,#7209b7,#b5179e)',
    'linear-gradient(135deg,#3d5af1,#4cc9f0)',
    'linear-gradient(135deg,#0f9d58,#52b788)',
    'linear-gradient(135deg,#f77f00,#ffb703)',
  ];

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    toast.success(`Code "${code}" copied — use it at checkout`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="section-tight">
      <div className="wrap">
        <SectionHeader
          eyebrow="Save more"
          title="Coupon Codes"
          subtitle="Apply these at checkout for extra savings"
        />
        <div className="rail no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {coupons.slice(0, 4).map((c, i) => (
            <Reveal key={c.id} delay={i * .06}>
              <div className="relative overflow-hidden"
                style={{
                  minWidth: 250,
                  borderRadius:'var(--r-lg)',
                  background:'var(--surface)',
                  border:'2px dashed rgba(217,4,41,.25)',
                }}>
                <div className="px-4 py-3" style={{ background: GRADS[i % GRADS.length] }}>
                  <p className="text-white font-display font-black text-2xl leading-none">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                  </p>
                  {c.min_amount && (
                    <p className="text-white/80 text-xs font-semibold mt-1">
                      On orders above ₹{c.min_amount}
                    </p>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono font-black text-sm px-2.5 py-2 truncate"
                      style={{ background:'var(--surface-2)', borderRadius:'var(--r-sm)' }}>
                      {c.name}
                    </code>
                    <button onClick={() => copy(c.name)} aria-label={`Copy code ${c.name}`}
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width:36, height:36, borderRadius:'var(--r-sm)', background:'var(--surface-2)' }}>
                      {copied === c.name
                        ? <CheckIcon className="h-4 w-4" style={{ color:'var(--success)' }} />
                        : <ClipboardDocumentIcon className="h-4 w-4" style={{ color:'var(--text-muted)' }} />}
                    </button>
                  </div>
                  <p className="text-[.625rem] mt-2" style={{ color:'var(--text-muted)' }}>
                    <TagIcon className="h-3 w-3 inline mr-0.5" />
                    Enter this code in your cart
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WHY CHOOSE US
═══════════════════════════════════════════════════════════════ */
export function WhyChooseUs() {
  const POINTS = [
    { icon:'🏭', title:'Factory Direct',    body:'We buy straight from Sivakasi manufacturers, so you skip every middleman markup.' },
    { icon:'🛡️', title:'Licensed & Safe',   body:'Every product is BIS certified and government licensed. No compromises on safety.' },
    { icon:'📦', title:'Careful Packing',   body:'Fireworks are packed to transport regulations and handled with proper care.' },
    { icon:'💬', title:'Real Support',      body:'Call or WhatsApp us — a real person answers, usually within minutes.' },
  ];

  return (
    <section className="section section-night relative overflow-hidden">
      <GlowOrb color="#d90429" size={380} style={{ left:'-8%', top:'10%' }} />
      <GlowOrb color="#f77f00" size={300} style={{ right:'-6%', bottom:'0%' }} />
      <Sparks count={18} />

      <div className="wrap relative z-10">
        <div className="text-center mb-10">
          <p className="eyebrow mb-2" style={{ color:'var(--gold)' }}>Why shop with us</p>
          <h2 className="h-section text-white">Built on trust, priced fairly</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * .07}>
              <div className="h-full p-6 text-center"
                style={{
                  background:'rgba(255,255,255,.06)',
                  border:'1px solid rgba(255,255,255,.1)',
                  borderRadius:'var(--r-lg)',
                  backdropFilter:'blur(8px)',
                }}>
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-display font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,.66)' }}>
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
