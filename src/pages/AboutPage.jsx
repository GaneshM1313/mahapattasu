// src/pages/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, TruckIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const STATS = [
  ['11+', 'Years of Trust'],
  ['7000+', 'Happy Customers'],
  ['500+', 'Product Varieties'],
  ['100%', 'Licensed & Safe'],
];

const VALUES = [
  { icon: ShieldCheckIcon, title: 'Safety First',     desc: 'Every product is BIS certified and government licensed. We never compromise on safety standards.' },
  { icon: SparklesIcon,    title: 'Premium Quality',   desc: 'Sourced directly from the finest manufacturers in Sivakasi — India\'s fireworks capital.' },
  { icon: TruckIcon,       title: 'Reliable Delivery', desc: 'Careful handling and fast, safe delivery to your doorstep, every single time.' },
  { icon: UserGroupIcon,   title: 'Customer First',    desc: 'Thousands of families trust us for their celebrations year after year.' },
];

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-red-950 to-black py-20 px-4 text-center">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <span className="text-5xl">🎆</span>
          <h1 className="font-display font-black text-4xl md:text-5xl text-white mt-4 mb-4">Our Story</h1>
          <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
            From a small family shop in Sivakasi to a trusted name in fireworks —
            we've been lighting up celebrations across India since 2010.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {STATS.map(([num, label]) => (
            <div key={label} className="text-center py-6 px-4">
              <p className="font-display font-black text-2xl md:text-3xl text-red-600">{num}</p>
              <p className="text-gray-500 text-xs md:text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display font-black text-2xl text-gray-900 mb-4">Why families choose us</h2>
        <p className="text-gray-500 leading-relaxed">
          What started as a small counter selling sparklers and ground chakkars has grown into a
          full-fledged fireworks destination — without ever losing sight of what matters: safety,
          quality, and the joy of celebration. Every product on our shelves is hand-checked,
          government licensed, and sourced from manufacturers we've worked with for over a decade.
        </p>
      </section>

      {/* Values grid */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center px-4">
        <h2 className="font-display font-black text-2xl text-gray-900 mb-3">Ready to celebrate with us?</h2>
        <p className="text-gray-500 mb-6">Browse our full collection of licensed, premium fireworks</p>
        <Link to="/products" className="btn-brand inline-flex">Shop Now</Link>
      </section>
    </div>
  );
}
