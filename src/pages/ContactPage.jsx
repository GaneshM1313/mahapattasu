// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ADMIN_WHATSAPP_NUMBER as WHATSAPP_NUMBER, SHOP_PHONES as PHONE_NUMBERS, SHOP_ADDRESS_LINES, ADMIN_EMAIL } from '../config/tenant';

const CONTACT_ITEMS = [
  { icon: MapPinIcon,  label: 'Visit Us',  value: SHOP_ADDRESS_LINES, kind: 'lines' },
  { icon: PhoneIcon,   label: 'Call Us',   value: PHONE_NUMBERS,      kind: 'phones' },
  ADMIN_EMAIL && { icon: EnvelopeIcon, label: 'Email Us', value: ADMIN_EMAIL },
  { icon: ClockIcon,   label: 'Hours',     value: 'Mon–Sun: 9 AM – 8 PM' },
].filter(Boolean);

export default function ContactPage() {
  const [form, setForm]       = useState({ name:'', phone:'', message:'' });
  const [sending, setSending] = useState(false);
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  // No backend "contact" endpoint exists yet — sends straight to WhatsApp
  // with the form content pre-filled, which works immediately without
  // needing a new API route.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) { toast.error('Fill in all fields'); return; }
    setSending(true);
    const text = `Hi, I'm ${form.name} (${form.phone}).\n\n${form.message}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    setTimeout(() => { setSending(false); setForm({ name:'', phone:'', message:'' }); }, 600);
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="text-center mb-10">
          <h1 className="font-display font-black text-3xl text-gray-900">Get in Touch</h1>
          <p className="text-gray-500 mt-2">Questions about an order, bulk pricing, or anything else — we're here to help</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Contact info cards */}
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_ITEMS.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity:0, x:-15 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <c.icon className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{c.label}</p>
                  {c.kind === 'lines' ? (
                    <p className="font-semibold text-gray-800">
                      {c.value.map((l, j) => <span key={j} className="block">{l}</span>)}
                    </p>
                  ) : c.kind === 'phones' ? (
                    <div className="flex flex-col">
                      {c.value.map(num => (
                        <a key={num} href={`tel:${num.replace(/\s/g, '')}`}
                          className="font-semibold text-gray-800 hover:text-red-600">{num}</a>
                      ))}
                    </div>
                  ) : (
                    <p className="font-semibold text-gray-800">{c.value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* WhatsApp quick-chat card */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl p-5 text-white hover:scale-[1.02] transition-transform"
              style={{ background: '#25D366' }}
            >
              <ChatBubbleLeftRightIcon className="h-7 w-7 flex-shrink-0" />
              <div>
                <p className="font-display font-bold">Chat on WhatsApp</p>
                <p className="text-white/80 text-sm">Usually replies within minutes</p>
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg mb-5">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="shop-label">Your Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} className="shop-input" placeholder="Full name" required />
              </div>
              <div>
                <label className="shop-label">Phone Number *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} className="shop-input" placeholder="10-digit number" required />
              </div>
              <div>
                <label className="shop-label">Message *</label>
                <textarea value={form.message} onChange={e => set('message', e.target.value)} className="shop-input h-32 resize-none" placeholder="How can we help?" required />
              </div>
              <button type="submit" disabled={sending} className="w-full btn-brand justify-center py-3">
                {sending ? 'Opening WhatsApp…' : 'Send via WhatsApp'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                This opens WhatsApp with your message pre-filled — just hit send.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
