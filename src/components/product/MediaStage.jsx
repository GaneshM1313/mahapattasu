// mahapattasu-shop/src/components/product/MediaStage.jsx
//
// Swipeable media slider.
//
// Order is deliberate:
//   slide 0 = product image   ← default, matches existing behaviour
//   slide 1 = video           ← only exists when video_url is set
//
// Products with no video behave exactly as before — a single image,
// no dots, no arrows, nothing new to learn.
//
// Mechanics:
//   • CSS scroll-snap gives native momentum swiping on touch. No
//     carousel library, no drag handlers, no jank.
//   • The video iframe is NOT mounted until the customer taps play.
//     We show YouTube's free CDN thumbnail instead (~15KB vs ~1MB).
//   • A nudging "Video ›" pill on the image slide tells people to
//     swipe — a slider nobody knows to swipe is a slider that
//     doesn't exist.

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

/* ── Parse any common YouTube / Vimeo URL ───────────────────── */
export function parseVideo(url) {
  if (!url) return null;
  const u = String(url).trim();
  let m = u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);              if (m) return { type:'youtube', id:m[1] };
  m = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/);                        if (m) return { type:'youtube', id:m[1] };
  m = u.match(/youtube\.com\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{6,})/); if (m) return { type:'youtube', id:m[1] };
  m = u.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);                 if (m) return { type:'vimeo', id:m[1] };
  return null;
}

const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const EMOJIS  = { none:'✨', division1:'🧨', division2:'🎆', division3:'🎇', division4:'🔥' };

/* ── Badge for product cards ────────────────────────────────── */
export function VideoBadge({ url, className = '' }) {
  if (!parseVideo(url)) return null;
  return (
    <span className={`inline-flex items-center gap-1 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ${className}`}>
      <PlayIcon className="h-2.5 w-2.5" /> VIDEO
    </span>
  );
}

/* ── Main slider ────────────────────────────────────────────── */
export default function MediaStage({ product }) {
  const video = useMemo(() => parseVideo(product?.video_url), [product?.video_url]);

  // Image FIRST, video after — preserves the current default view
  const slides = useMemo(() => {
    const s = [];
    if (product?.image_url) s.push({ kind:'image', src: product.image_url });
    else                    s.push({ kind:'placeholder' });
    if (video)              s.push({ kind:'video', video, thumb: ytThumb(video.id) });
    return s;
  }, [product?.image_url, product?.hazard_class, video]);

  const [index, setIndex]     = useState(0);
  const [playing, setPlaying] = useState(false);
  const trackRef              = useRef(null);
  const hasVideo              = slides.length > 1;

  /* Track which slide is centred as the user swipes */
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(prev => (prev === i ? prev : i));
  }, []);

  /* Stop playback when the user swipes away from the video */
  useEffect(() => {
    if (playing && slides[index]?.kind !== 'video') setPlaying(false);
  }, [index, playing, slides]);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const embedSrc = video && video.type === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`
    : video ? `https://player.vimeo.com/video/${video.id}?autoplay=1` : null;

  return (
    <div className="relative">

      {/* ── Track ───────────────────────────────────────────── */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto rounded-2xl ms-no-scrollbar"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full relative overflow-hidden"
            style={{
              scrollSnapAlign: 'start',
              aspectRatio: '1 / 1',
              background: s.kind === 'video' ? '#0a0a0f' : '#f8f7f5',
            }}
          >
            {s.kind === 'image' && (
              <img src={s.src} alt={product.name}
                className="w-full h-full object-cover" loading="lazy" />
            )}

            {s.kind === 'placeholder' && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                <span className="text-7xl">{EMOJIS[product?.hazard_class] || '🎆'}</span>
              </div>
            )}

            {s.kind === 'video' && (
              playing ? (
                <iframe
                  src={embedSrc}
                  title={product.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play video of ${product.name}`}
                  className="group absolute inset-0 w-full h-full border-0 p-0 cursor-pointer"
                >
                  <img src={s.thumb} alt=""
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute inset-0"
                    style={{ background:'radial-gradient(circle at center, rgba(0,0,0,.12) 0%, rgba(0,0,0,.55) 100%)' }} />
                  <span className="absolute top-1/2 left-1/2 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{
                      width:72, height:72, transform:'translate(-50%,-50%)',
                      background:'linear-gradient(135deg,#e63946,#f97316)',
                      boxShadow:'0 8px 32px rgba(230,57,70,.5)',
                    }}>
                    <PlayIcon className="h-8 w-8 text-white" style={{ marginLeft:4 }} />
                  </span>
                  <span className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
                    style={{
                      width:72, height:72, transform:'translate(-50%,-50%)',
                      border:'2px solid rgba(255,255,255,.35)',
                      animation:'msPulse 2.4s ease-out infinite',
                    }} />
                  <span className="absolute bottom-4 left-0 right-0 text-center text-white/85 text-sm font-medium">
                    See it burst before you buy
                  </span>
                </button>
              )
            )}
          </div>
        ))}
      </div>

      {/* ── Offer badge ─────────────────────────────────────── */}
      {product?.has_offer && (
        <span className="absolute top-3 left-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none"
          style={{ background:'rgba(230,57,70,.95)' }}>
          {product.discount_pct}% OFF
        </span>
      )}

      {/* ══ Everything below renders ONLY when a video exists ══ */}
      {hasVideo && (
        <>
          {/* Swipe hint — on the image slide, nudges toward the video */}
          {index === 0 && (
            <button
              onClick={() => goTo(1)}
              aria-label="Swipe to watch video"
              className="absolute flex items-center gap-1.5 rounded-full text-white text-xs font-bold px-3 py-2"
              style={{
                right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(10,10,15,.78)',
                backdropFilter: 'blur(6px)',
                animation: 'msNudge 2s ease-in-out infinite',
                border: 'none', cursor: 'pointer', zIndex: 2,
              }}
            >
              <PlayIcon className="h-3.5 w-3.5" />
              Video
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Desktop arrows */}
          <button
            onClick={() => goTo(Math.max(0, index - 1))}
            aria-label="Previous"
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-lg items-center justify-center transition-opacity"
            style={{ opacity: index === 0 ? 0 : 1, pointerEvents: index === 0 ? 'none' : 'auto', zIndex: 2 }}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={() => goTo(Math.min(slides.length - 1, index + 1))}
            aria-label="Next"
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-lg items-center justify-center transition-opacity"
            style={{
              opacity: index === slides.length - 1 ? 0 : 1,
              pointerEvents: index === slides.length - 1 ? 'none' : 'auto',
              zIndex: 2,
            }}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {slides.map((s, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: index === i ? 20 : 6,
                  height: 6,
                  background: index === i ? '#e63946' : 'rgba(255,255,255,.75)',
                  boxShadow: '0 1px 3px rgba(0,0,0,.35)',
                }}
              />
            ))}
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 mt-3">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={s.kind === 'video' ? 'Show video' : 'Show photo'}
                className="relative flex-shrink-0 rounded-lg overflow-hidden transition-all"
                style={{
                  width: 64, height: 64,
                  border: index === i ? '2px solid #e63946' : '1px solid rgba(0,0,0,.1)',
                  background: s.kind === 'video' ? '#0a0a0f' : '#f8f7f5',
                  opacity: index === i ? 1 : 0.7,
                }}
              >
                {s.kind === 'placeholder' ? (
                  <span className="flex items-center justify-center w-full h-full text-2xl">
                    {EMOJIS[product?.hazard_class] || '🎆'}
                  </span>
                ) : (
                  <img src={s.kind === 'video' ? s.thumb : s.src} alt=""
                    className="w-full h-full object-cover" />
                )}
                {s.kind === 'video' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <PlayIcon className="h-5 w-5 text-white drop-shadow-lg" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        .ms-no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .ms-no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes msPulse {
          0%   { transform: translate(-50%,-50%) scale(1);    opacity:.8; }
          100% { transform: translate(-50%,-50%) scale(1.85); opacity:0;  }
        }
        @keyframes msNudge {
          0%,100% { transform: translateY(-50%) translateX(0); }
          50%     { transform: translateY(-50%) translateX(-5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="msPulse"], [style*="msNudge"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
