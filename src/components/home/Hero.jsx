// src/components/home/Hero.jsx
//
// Cinematic fireworks hero — SVG + CSS, no image assets.
//
// Why not a photograph: a 1920px night-sky JPEG costs 300–600KB and is
// still static. This is ~7KB of markup, animates continuously, scales to
// any viewport without cropping, and never pixelates. If you later have
// a real photo, set BG_IMAGE below — the layers composite over it.
//
// Layer stack, back to front:
//   1  Night sky      deep blue → purple → magenta → golden ember
//   2  Bokeh          large soft out-of-focus lights
//   3  Smoke haze     slow drifting blurred blobs
//   4  Trails         rising streaks that precede each burst
//   5  Bursts         SVG radial geometry, staggered timing
//   6  Hanging lanterns  swaying Tamil-style diamond kandils along the top
//   7  Spark dust     fine twinkling particles
//   8  Diya row       lit oil lamps along the bottom edge
//   9  Product boxes  floating colourful cracker cartons
//   10 Content        incl. Tamil Diwali greeting
//
// Every animated property is transform or opacity — nothing triggers
// layout. Honours prefers-reduced-motion.

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, GiftIcon } from '@heroicons/react/24/outline';
import heroBanner from '../../data/heroBanner';

/* Set to a URL to composite a real photo behind the animated layers */
const BG_IMAGE = null;

const PALETTES = [
  ['#ff2d55', '#ff6b35', '#ffd60a'],
  ['#ffd60a', '#ffb703', '#fb8500'],
  ['#c77dff', '#e0aaff', '#ff7ad9'],
  ['#4cc9f0', '#4895ef', '#a0e7ff'],
  ['#ff70a6', '#ff9770', '#ffd670'],
  ['#70e000', '#9ef01a', '#ccff33'],
];

function Burst({ cx, cy, scale, palette, delay, dur, uid }) {
  const rays = 26;
  const [c1, c2, c3] = palette;
  return (
    <g style={{
      transformOrigin: `${cx}px ${cy}px`,
      animation: `burstCycle ${dur}s ease-out ${delay}s infinite`,
    }}>
      <defs>
        <radialGradient id={`core${uid}`}>
          <stop offset="0%"   stopColor="#fff" stopOpacity=".95" />
          <stop offset="30%"  stopColor={c3}   stopOpacity=".7" />
          <stop offset="100%" stopColor={c1}   stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={46 * scale} fill={`url(#core${uid})`} />
      {Array.from({ length: rays }, (_, i) => {
        const a  = (i * Math.PI * 2) / rays;
        const r1 = 12 * scale;
        const r2 = (52 + (i % 3) * 13) * scale;
        const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;
        const col = [c1, c2, c3][i % 3];
        return (
          <g key={i}>
            <line x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1}
              x2={x2} y2={y2}
              stroke={col} strokeWidth={1.6 * scale} strokeLinecap="round" opacity=".85" />
            <circle cx={x2} cy={y2} r={1.9 * scale} fill={col} />
          </g>
        );
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i * Math.PI * 2) / 14 + 0.22;
        const r = 30 * scale;
        return (
          <circle key={`s${i}`}
            cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r}
            r={1.4 * scale} fill={c3} opacity=".9" />
        );
      })}
    </g>
  );
}

/* ── Hanging Tamil kandil (diamond paper lantern) — like the ones
   strung up outside Sivakasi shops during Diwali. Pure SVG, sways
   gently on a thread. ── */
function HangingLantern({ left, size = 56, stringLen = 46, colors, delay = 0, sway = 4.5 }) {
  const [top, bottom, trim] = colors;
  const w = size, h = size * 1.15;
  return (
    <div className="absolute hidden sm:block pointer-events-none" aria-hidden="true"
      style={{ left, top: 0, transformOrigin: `${w / 2}px 0px`, animation: `lanternSway ${sway}s ease-in-out ${delay}s infinite` }}>
      <svg width={w} height={stringLen + h + 16} viewBox={`0 0 ${w} ${stringLen + h + 16}`}>
        <line x1={w / 2} y1="0" x2={w / 2} y2={stringLen}
          stroke="rgba(255,255,255,.35)" strokeWidth="1.4" />
        <g transform={`translate(0 ${stringLen})`}>
          <rect x={w / 2 - 5} y="-3" width="10" height="7" rx="2" fill="#5a3313" />
          <polygon points={`${w / 2},2 ${w},${h / 2} ${w / 2},${h - 2} 0,${h / 2}`}
            fill={top} stroke={trim} strokeWidth="2" strokeOpacity=".9" />
          <polygon points={`${w / 2},2 ${w},${h / 2} ${w / 2},${h / 2}`} fill={bottom} opacity=".55" />
          <polygon points={`0,${h / 2} ${w / 2},${h / 2} ${w / 2},${h - 2}`} fill={bottom} opacity=".3" />
          <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke={trim} strokeWidth="1" opacity=".5" />
          <line x1={w / 2} y1="2" x2={w / 2} y2={h - 2} stroke={trim} strokeWidth="1" opacity=".5" />
          <circle cx={w / 2} cy={h / 2} r={3.4} fill="#fff8f0" opacity=".85" />
          {[0.22, 0.5, 0.78].map((f, i) => (
            <g key={i}>
              <line x1={w * f} y1={h} x2={w * f} y2={h + 15} stroke={trim} strokeWidth="1.4" opacity=".85" />
              <circle cx={w * f} cy={h + 17} r="2" fill={trim} opacity=".9" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

const LANTERNS = [
  { left:'5%',  size:52, stringLen:26, delay:0,   sway:4.2, colors:['#ffb703','#e63946','#fff3d6'] },
  { left:'13%', size:40, stringLen:58, delay:.6,  sway:5.0, colors:['#f77f00','#9d0208','#ffe8bd'] },
  { left:'80%', size:40, stringLen:34, delay:.3,  sway:4.6, colors:['#f77f00','#9d0208','#ffe8bd'] },
  { left:'89%', size:52, stringLen:20, delay:.9,  sway:4.0, colors:['#ffb703','#e63946','#fff3d6'] },
];

/* ── Diya — lit clay oil lamp, flickering flame. Rows of these run
   along the bottom edge like a Diwali doorstep line. ── */
function Diya({ delay = 0 }) {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"
      style={{ filter:'drop-shadow(0 0 7px rgba(255,183,3,.65))', flexShrink:0 }}>
      <defs>
        <radialGradient id="diyaFlame" cx="50%" cy="35%">
          <stop offset="0%"  stopColor="#fffde7" />
          <stop offset="45%" stopColor="#ffd60a" />
          <stop offset="100%" stopColor="#fb8500" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="15" cy="9" rx="3" ry="6" fill="url(#diyaFlame)"
        style={{ transformOrigin:'15px 15px', animation:`flameFlicker 1.5s ease-in-out ${delay}s infinite` }} />
      <path d="M3 17 Q15 27 27 17 Q26.5 22 15 23.5 Q3.5 22 3 17Z" fill="#7a4b12" />
      <ellipse cx="15" cy="16.5" rx="12.5" ry="3.4" fill="#a9651c" />
    </svg>
  );
}

const BOXES = [
  { emoji:'🧨', label:'Bijili',     grad:'linear-gradient(145deg,#d90429,#9d0208)', x:'4%',  y:'20%', size:70, delay:0,   rot:-9  },
  { emoji:'✨', label:'Sparklers',  grad:'linear-gradient(145deg,#ffb703,#fb8500)', x:'11%', y:'64%', size:62, delay:.7,  rot:7   },
  { emoji:'🎇', label:'Fancy',      grad:'linear-gradient(145deg,#7209b7,#b5179e)', x:'85%', y:'16%', size:66, delay:1.3, rot:11  },
  { emoji:'🚀', label:'Rockets',    grad:'linear-gradient(145deg,#3d5af1,#4cc9f0)', x:'90%', y:'56%', size:60, delay:.4,  rot:-7  },
  { emoji:'🎁', label:'Combos',     grad:'linear-gradient(145deg,#0f9d58,#52b788)', x:'78%', y:'79%', size:56, delay:1.7, rot:5   },
  { emoji:'🌸', label:'Flower Pot', grad:'linear-gradient(145deg,#ff70a6,#ef233c)', x:'2%',  y:'44%', size:54, delay:2.1, rot:-13 },
];

export default function Hero() {
  const bursts = useMemo(() => ([
    { cx:175,  cy:130, scale:1.15, p:0, delay:0,   dur:4.2 },
    { cx:640,  cy:95,  scale:.92,  p:2, delay:1.1, dur:4.8 },
    { cx:990,  cy:165, scale:1.05, p:3, delay:2.3, dur:4.4 },
    { cx:400,  cy:235, scale:.72,  p:1, delay:3.1, dur:5.0 },
    { cx:820,  cy:275, scale:.80,  p:4, delay:1.8, dur:4.6 },
    { cx:1160, cy:60,  scale:.66,  p:5, delay:3.6, dur:5.2 },
  ]), []);

  const bokeh = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      left:`${(i*61)%96}%`, top:`${(i*43)%88}%`,
      size: 8 + (i%5)*11,
      color: ['#ffd60a','#ff70a6','#4cc9f0','#c77dff','#ff6b35'][i%5],
      delay:`${(i%7)*.9}s`, dur:`${5+(i%4)}s`,
    })), []);

  const dust = useMemo(() =>
    Array.from({ length: 44 }, (_, i) => ({
      left:`${(i*37)%100}%`, top:`${(i*59)%100}%`,
      size: 1 + (i%3), delay:`${(i%12)*.28}s`, dur:`${2.2+(i%5)*.55}s`,
    })), []);

  const diyas = useMemo(() => Array.from({ length: 11 }, (_, i) => ({ delay: (i % 6) * .22 })), []);

  return (
    <section className="relative overflow-hidden flex flex-col justify-center" style={{ minHeight:'clamp(400px, 60vh, 640px)' }}>

      {/* 1 · Night sky */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 55% at 20% 12%,  rgba(114,9,183,.55), transparent 62%),
          radial-gradient(ellipse 70% 50% at 82% 22%,  rgba(217,4,41,.42),  transparent 60%),
          radial-gradient(ellipse 90% 60% at 50% 100%, rgba(251,133,0,.30), transparent 66%),
          radial-gradient(ellipse 60% 45% at 70% 78%,  rgba(181,23,158,.32),transparent 60%),
          linear-gradient(170deg,#0a0620 0%,#1a0b32 35%,#2d0a3e 62%,#47102e 100%)`,
        ...(BG_IMAGE && {
          backgroundImage:`linear-gradient(rgba(10,6,32,.72),rgba(71,16,46,.72)),url(${BG_IMAGE})`,
          backgroundSize:'cover', backgroundPosition:'center',
        }),
      }} />

      {/* 2 · Bokeh */}
      {bokeh.map((b,i) => (
        <span key={`bk${i}`} aria-hidden="true" className="absolute rounded-full pointer-events-none"
          style={{
            left:b.left, top:b.top, width:b.size, height:b.size,
            background:b.color, filter:'blur(7px)', opacity:.3,
            animation:`bokehDrift ${b.dur} ease-in-out ${b.delay} infinite`,
          }} />
      ))}

      {/* 3 · Smoke */}
      {[{l:'12%',t:'55%',s:250,d:'0s'},{l:'62%',t:'30%',s:310,d:'3s'},{l:'40%',t:'72%',s:220,d:'6s'}].map((s,i) => (
        <span key={`sm${i}`} aria-hidden="true" className="absolute rounded-full pointer-events-none"
          style={{
            left:s.l, top:s.t, width:s.s, height:s.s,
            background:'radial-gradient(circle, rgba(255,255,255,.07), transparent 70%)',
            filter:'blur(34px)',
            animation:`smokeDrift 14s ease-in-out ${s.d} infinite`,
          }} />
      ))}

      {/* 4+5 · Trails and bursts */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1280 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {[
          { x:175, color:'#ffd60a', delay:0,   dur:4.2, to:-270 },
          { x:640, color:'#c77dff', delay:1.1, dur:4.8, to:-305 },
          { x:990, color:'#4cc9f0', delay:2.3, dur:4.4, to:-235 },
          { x:820, color:'#ff70a6', delay:1.8, dur:4.6, to:-125 },
        ].map((t,i) => (
          <g key={`t${i}`} style={{ animation:`trail${i} ${t.dur}s ease-in ${t.delay}s infinite` }}>
            <line x1={t.x} y1="420" x2={t.x} y2="462"
              stroke={t.color} strokeWidth="1.8" strokeLinecap="round" opacity=".75" />
            <circle cx={t.x} cy="420" r="2.4" fill="#fff" opacity=".95" />
            <style>{`@keyframes trail${i}{
              0%{transform:translateY(0);opacity:0}
              6%{opacity:1}
              26%{transform:translateY(${t.to}px);opacity:1}
              30%,100%{transform:translateY(${t.to}px);opacity:0}
            }`}</style>
          </g>
        ))}

        {bursts.map((b,i) => (
          <Burst key={`b${i}`} uid={i} cx={b.cx} cy={b.cy} scale={b.scale}
            palette={PALETTES[b.p]} delay={b.delay} dur={b.dur} />
        ))}
      </svg>

      {/* 6 · Hanging lanterns */}
      {LANTERNS.map((l, i) => <HangingLantern key={i} {...l} />)}

      {/* 7 · Spark dust */}
      {dust.map((d,i) => (
        <span key={`d${i}`} aria-hidden="true" className="absolute rounded-full pointer-events-none"
          style={{
            left:d.left, top:d.top, width:d.size, height:d.size, background:'#fff',
            animation:`dustTwinkle ${d.dur} ease-in-out ${d.delay} infinite`,
          }} />
      ))}

      {/* 8 · Diya row along the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 hidden sm:flex items-end justify-center gap-[6%] px-6 pointer-events-none"
        style={{ paddingBottom: 18 }} aria-hidden="true">
        {diyas.map((d, i) => <Diya key={i} delay={d.delay} />)}
      </div>

      {/* 9 · Floating product boxes */}
      {BOXES.map((box,i) => (
        <motion.div key={box.label}
          initial={{ opacity:0, scale:.6, y:26 }}
          animate={{ opacity:1, scale:1, y:0 }}
          transition={{ delay:.5 + i*.12, type:'spring', damping:13 }}
          className="absolute hidden md:flex flex-col items-center justify-center pointer-events-none"
          style={{
            left:box.x, top:box.y, width:box.size, height:box.size,
            borderRadius:16, background:box.grad,
            boxShadow:'0 12px 34px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.28)',
            border:'1px solid rgba(255,255,255,.18)',
            transform:`rotate(${box.rot}deg)`,
            animation:`boxFloat ${5 + i*.6}s ease-in-out ${box.delay}s infinite`,
          }}>
          <span style={{ fontSize:box.size*.42, lineHeight:1 }}>{box.emoji}</span>
          <span style={{
            fontSize:8, fontWeight:900, color:'rgba(255,255,255,.92)',
            letterSpacing:'.08em', marginTop:3, textTransform:'uppercase',
          }}>{box.label}</span>
        </motion.div>
      ))}

      {/* 10 · Content — uploaded banner over the animated fireworks background */}
      <div className="wrap relative z-10 py-8 md:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 22, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: .1, type: 'spring', damping: 16 }}
          >
            <Link to="/products" aria-label="Shop Maha Pattasu crackers online" className="block">
              <img
                src={heroBanner}
                alt="Maha Pattasu — Online Crackers Store · Buy Now"
                className="w-full h-auto mx-auto"
                style={{
                  maxWidth: 760,
                  borderRadius: 'var(--r-xl)',
                  boxShadow: '0 22px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.12)',
                }}
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .28 }}
            className="flex flex-wrap gap-3 justify-center mt-7"
          >
            <Link to="/products" className="btn btn-fire btn-lg">
              Shop Now <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link to="/combos" className="btn btn-lg"
              style={{
                background: 'rgba(255,255,255,.12)', color: '#fff',
                border: '2px solid rgba(255,255,255,.28)', backdropFilter: 'blur(8px)',
              }}>
              <GiftIcon className="h-5 w-5" /> View Combos
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height:90, background:'linear-gradient(to top, var(--cream), transparent)' }} />

      <style>{`
        @keyframes burstCycle {
          0%       { transform:scale(.05); opacity:0; }
          9%       { transform:scale(.42); opacity:1; }
          26%      { transform:scale(1);   opacity:.95; }
          52%      { transform:scale(1.2); opacity:.35; }
          70%,100% { transform:scale(1.34);opacity:0; }
        }
        @keyframes bokehDrift {
          0%,100% { transform:translate(0,0) scale(1); opacity:.22; }
          50%     { transform:translate(14px,-18px) scale(1.3); opacity:.42; }
        }
        @keyframes smokeDrift {
          0%,100% { transform:translate(0,0) scale(1); opacity:.5; }
          50%     { transform:translate(28px,-22px) scale(1.22); opacity:.8; }
        }
        @keyframes dustTwinkle {
          0%,100% { opacity:.12; transform:scale(1); }
          50%     { opacity:.95; transform:scale(1.7); }
        }
        @keyframes boxFloat {
          0%,100% { translate:0 0; }
          50%     { translate:0 -13px; }
        }
        @keyframes lanternSway {
          0%,100% { transform:rotate(-4deg); }
          50%     { transform:rotate(4deg); }
        }
        @keyframes flameFlicker {
          0%,100% { transform:scaleY(1) scaleX(1); opacity:.95; }
          30%     { transform:scaleY(1.12) scaleX(.92); opacity:1; }
          60%     { transform:scaleY(.9) scaleX(1.05); opacity:.85; }
        }
        @media (prefers-reduced-motion: reduce) {
          section [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
