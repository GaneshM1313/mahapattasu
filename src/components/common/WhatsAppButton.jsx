// src/components/common/WhatsAppButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ADMIN_WHATSAPP_NUMBER } from '../../config/tenant';

const DEFAULT_MESSAGE = "Hi! I'm browsing your fireworks shop and have a question 🎆";

export default function WhatsAppButton() {
  const href = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', damping: 15 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl"
      style={{ background: '#25D366' }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping" style={{ background: '#25D366', opacity: 0.4 }} />

      <svg viewBox="0 0 32 32" className="relative w-7 h-7" fill="#fff">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.252.62 4.358 1.7 6.166L4 29l8.02-2.105A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.818c-1.94 0-3.75-.57-5.27-1.55l-.378-.232-4.76 1.25 1.27-4.638-.247-.387a9.74 9.74 0 0 1-1.51-5.26c0-5.41 4.4-9.81 9.895-9.81 5.494 0 9.895 4.4 9.895 9.81 0 5.41-4.4 9.817-9.895 9.817Zm5.43-7.354c-.297-.149-1.755-.866-2.027-.965-.272-.099-.47-.149-.668.149-.198.297-.767.965-.94 1.163-.173.198-.347.223-.644.075-.297-.149-1.254-.462-2.39-1.474-.883-.787-1.48-1.76-1.653-2.057-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.52-.074-.149-.668-1.611-.916-2.207-.241-.578-.486-.5-.668-.51l-.569-.01c-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.478 0 1.461 1.065 2.874 1.213 3.072.148.198 2.097 3.202 5.082 4.49.71.306 1.263.49 1.694.627.712.227 1.36.195 1.873.118.572-.085 1.755-.717 2.003-1.41.248-.694.248-1.288.173-1.41-.074-.124-.272-.198-.569-.347Z"/>
      </svg>
    </motion.a>
  );
}
