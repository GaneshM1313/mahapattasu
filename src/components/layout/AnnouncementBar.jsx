// src/components/layout/AnnouncementBar.jsx
// Compact scrolling strip. Uses a duplicated track so the marquee
// loops seamlessly with a single CSS transform — no JS ticker.

import React from 'react';

const MESSAGES = [
  '🎆  FESTIVE SALE IS LIVE',
  '🚚  FAST DELIVERY ACROSS TAMIL NADU',
  '🎁  EXCLUSIVE CRACKER COMBOS',
  '✅  100% GENUINE SIVAKASI PRODUCTS',
  '🔥  LIMITED TIME DIWALI OFFERS',
];

export default function AnnouncementBar() {
  const strip = [...MESSAGES, ...MESSAGES];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'var(--grad-festive)',
        height: 'var(--announce-h)',
        display: 'flex',
        alignItems: 'center',
      }}
      role="complementary"
      aria-label="Store announcements"
    >
      <div className="marquee-track">
        {strip.map((m, i) => (
          <span key={i}
            className="flex items-center px-7 text-white whitespace-nowrap"
            style={{ fontSize: '.688rem', fontWeight: 800, letterSpacing: '.09em' }}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
