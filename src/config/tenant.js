// src/config/tenant.js
//
// HARDCODED TENANT CONFIG — Phase 1
// This storefront currently serves ONE tenant + ONE branch.
// Change these two values and rebuild to point the shop at a
// different tenant. No tenant-picker UI, no login-based resolution.
//
// FUTURE: once customers log in with accounts that carry their own
// tenant_id, delete this file and resolve tenant/branch dynamically
// instead (subdomain, login flow, etc). The only other file that
// references these constants is src/services/api.js.


export const TENANT_ID = 4;
export const BRANCH_ID = 7;
export const TENANT_NAME = 'Sri Mahalakshmi Pyro';

// ── Business identity ─────────────────────────────────────────────
// Single source of truth for the shop's name and contact details.
// Header, Footer, Contact page, checkout message, invoice PDF and the
// WhatsApp button all read from here — edit only this block.
export const SHOP_NAME    = 'Sri Mahalakshmi Pyro';
export const SHOP_TAGLINE = 'SIVAKASI DIRECT';

// Admin's WhatsApp number (with country code, no +/spaces/dashes).
// Used for: the floating WhatsApp chat button, the Contact page, and
// the checkout order notification (CheckoutPage.jsx sends the full
// order + customer details here instead of taking online payment).
export const ADMIN_WHATSAPP_NUMBER = '919360090064';

// Admin's own email inbox — the checkout page can open a prefilled
// email (mailto:) addressed here as a second notification channel.
// Left blank until the shop has an email: while it's empty, the email
// row is hidden on the Contact page and the invoice PDF, and the
// mailto: path is skipped.
export const ADMIN_EMAIL = '';

// Address — lines are used where a multi-line layout fits (footer,
// contact page, invoice); SHOP_ADDRESS is the one-line form.
export const SHOP_ADDRESS_LINES = [
  'D.No. 2/258-4, Kallamanaickenpatti,',
  'Vembakottai Taluk, Alangulam Post,',
  'Virudhunagar, Tamil Nadu – 626 127',
];
export const SHOP_ADDRESS = SHOP_ADDRESS_LINES.join(' ');

// First number is the WhatsApp line.
export const SHOP_PHONES  = ['+91 93600 90064', '+91 94452 80054'];
