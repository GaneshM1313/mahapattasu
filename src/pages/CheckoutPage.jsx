// src/pages/CheckoutPage.jsx
//
// No online payment on this storefront: the customer only enters their
// delivery address, then "Place Order":
//   1. saves the order via shopAPI.placeOrder() (payments: [], to be
//      settled by phone/COD)
//   2. builds a properly-aligned order PDF (utils/invoicePdf.js) —
//      shop header, customer details, an itemized table with right-
//      aligned qty/price/amount columns, totals
//   3. tries to hand that PDF straight to WhatsApp via the Web Share
//      API (navigator.share with files) — on the phones your customers
//      are actually using (Android Chrome, iOS Safari 16+) this opens
//      the share sheet with WhatsApp as an option and the PDF genuinely
//      attaches. A wa.me link alone can only prefill text, never a
//      file — that's a browser/WhatsApp limitation, not something any
//      frontend code can work around.
//   4. if the browser can't do that (most desktops), falls back to the
//      existing wa.me text-summary link, and the confirmation screen
//      keeps a "Download Invoice PDF" button so it can be attached by
//      hand instead.
//
// Email: there's no mail-sending backend here, and putting SMTP
// credentials in frontend code would expose them to every visitor, so
// this can't "just send" an email the way it does WhatsApp. What it
// does instead is open a prefilled mailto: draft addressed to
// ADMIN_EMAIL — the browser hands off to the customer's own mail app
// with the order text already in the body; mailto also can't carry an
// attachment, so the PDF button sits right next to it for that case.
// A true one-click "email arrives with the PDF attached, no customer
// action" would need either the existing backend wired up to an SMTP/
// transactional-email service, or a client email service like EmailJS
// — both need credentials this repo doesn't have.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, CheckCircleIcon, PhoneIcon, ArrowDownTrayIcon, EnvelopeIcon, BoltIcon, UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useCartStore, useAuthStore, useUIStore } from '../store';
import { shopAPI } from '../services/api';
import { ADMIN_WHATSAPP_NUMBER, ADMIN_EMAIL, SHOP_NAME } from '../config/tenant';
import { buildInvoicePdf, pdfToFile } from '../utils/invoicePdf';
import toast from 'react-hot-toast';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n||0);

// Plain-text version of fmt() — WhatsApp/email don't render the Intl
// currency formatter's non-breaking space cleanly on every client.
const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function CheckoutPage() {
  const navigate   = useNavigate();
  const { items, getSubtotal, getTotal, coupon, couponDiscount, clearCart } = useCartStore();
  const { customer, isLoggedIn, login } = useAuthStore();
  const { openAuth } = useUIStore();
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [sharedPdf, setSharedPdf] = useState(false);  // whether native share already handled it
  const [snapshot, setSnapshot] = useState(null);      // order data frozen at submit time, for the confirmation-screen buttons (cart is cleared by then)

  // Guest vs account is the customer's own choice — 'guest' is the
  // default so the least-friction path is what they get without having
  // to decide anything. Only matters while they're not already logged in.
  const [checkoutMode, setCheckoutMode] = useState('guest'); // 'guest' | 'account'
  const [showPw, setShowPw] = useState(false);

  const [form, setForm] = useState({
    name:    customer?.name    || '',
    phone:   customer?.phone   || '',
    address: customer?.address || '',
    city:    customer?.city    || '',
    state:   '',
    pincode: '',
    notes:   '',
    password: '',
    confirm:  '',
  });

  const subtotal = getSubtotal();
  const total    = getTotal();
  const grandTotal = total; // delivery charge is confirmed by our team on call, not added here

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const wantsAccount = !isLoggedIn && checkoutMode === 'account';

  if (items.length === 0 && !success) {
    navigate('/products'); return null;
  }

  // Plain-text summary — used as the wa.me fallback message and as the
  // mailto: body. Kept separate from the PDF so both channels always
  // have *something* readable even where the richer PDF path can't run.
  const buildOrderText = (snap) => {
    const lines = [
      `New Order — ${SHOP_NAME}`,
      `Order ID: ${snap.orderId || 'Pending confirmation'}`,
      '',
      `Customer: ${snap.customer.name}`,
      `Phone: ${snap.customer.phone}`,
      `Address: ${snap.customer.address}`,
    ];
    if (snap.customer.notes) lines.push(`Notes: ${snap.customer.notes}`);
    lines.push('', `Items (${snap.items.length}):`);
    snap.items.forEach((it, i) => lines.push(`${i + 1}. ${it.name} x${it.qty} — ${money(it.unitPrice * it.qty)}`));
    lines.push('', `Subtotal: ${money(snap.subtotal)}`);
    if (snap.coupon?.amount > 0) lines.push(`Coupon (${snap.coupon.label}): -${money(snap.coupon.amount)}`);
    lines.push(
      `TOTAL: ${money(snap.total)}`,
      '',
      'Delivery charge not included — please confirm with the customer based on their location & parcel, and arrange delivery.',
    );
    return lines.join('\n');
  };

  const buildPdf = (snap) => buildInvoicePdf({
    orderId:  snap.orderId,
    customer: snap.customer,
    items:    snap.items,
    subtotal: snap.subtotal,
    coupon:   snap.coupon,
    total:    snap.total,
  });

  const downloadPdf = (snap) => {
    buildPdf(snap).save(`Order-${snap.orderId || 'draft'}.pdf`);
  };

  const emailAdmin = (snap) => {
    if (!ADMIN_EMAIL) return; // no shop email configured yet
    const subject = `New order ${snap.orderId || ''} — ${snap.customer.name}`;
    const body = buildOrderText(snap) + '\n\n(Invoice PDF: please attach the downloaded copy — email links can\'t carry attachments.)';
    window.open(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const openWhatsAppText = (snap) => {
    const url = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderText(snap))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return url;
  };

  // Tries to hand the PDF straight to WhatsApp via the native share
  // sheet; only wa.me (text-only) if the browser can't share files.
  const shareToWhatsApp = async (snap) => {
    try {
      const file = pdfToFile(buildPdf(snap), `Order-${snap.orderId || 'draft'}.pdf`);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Order ${snap.orderId || ''}`,
          text: buildOrderText(snap),
        });
        setSharedPdf(true);
        return true;
      }
    } catch (err) {
      if (err?.name === 'AbortError') { setSharedPdf(true); return true; } // user just closed the share sheet — don't also fire wa.me
    }
    openWhatsAppText(snap);
    return false;
  };

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast.error('Fill all required fields'); return;
    }
    if (wantsAccount) {
      if (!form.password) { toast.error('Set a password to create your account'); return; }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
      if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    }
    setLoading(true);
    try {
      // Create the account first if they opted in — the order placed
      // right after goes under that new login automatically, so it
      // shows up in "My Orders" with no extra step for them.
      if (wantsAccount) {
        const reg = await shopAPI.register({ name: form.name, phone: form.phone, password: form.password });
        login(reg.data.data.customer, reg.data.data.token);
      }

      const r = await shopAPI.placeOrder({
        items: items.map(i => ({ product_id: i.id, qty: i.qty })),
        payments: [],
        discount_code: coupon?.name || undefined,
        shipping_address: `${form.address}, ${form.city}, ${form.state} ${form.pincode}`,
        notes: form.notes,
        // Only meaningful for a guest order — there's no logged-in
        // customer_id yet, so the backend needs a name/phone to attach
        // the order to. Omitted once logged in (account or existing).
        ...(!isLoggedIn && !wantsAccount ? { guest_name: form.name, guest_phone: form.phone } : {}),
      });
      const data = r.data.data;

      // Freeze everything the receipt needs — the cart is about to be
      // cleared, so `items`/`coupon` won't be readable afterwards.
      const snap = {
        orderId: data?.invoiceNo,
        customer: {
          name: form.name, phone: form.phone,
          address: `${form.address}, ${form.city}${form.state ? ', ' + form.state : ''} ${form.pincode}`.trim(),
          notes: form.notes,
        },
        items: items.map(it => ({
          name: it.name, qty: it.qty,
          unitPrice: (it.has_offer && it.offer_price != null) ? parseFloat(it.offer_price) : parseFloat(it.selling_price || 0),
        })),
        subtotal,
        coupon: couponDiscount > 0 ? { label: coupon?.name, amount: couponDiscount } : null,
        total: data?.grandTotal ?? grandTotal,
      };
      setSnapshot(snap);
      setSuccess(data);
      clearCart();

      // WhatsApp only for now — email notifications are parked until
      // that's set up (see ADMIN_EMAIL in config/tenant.js). Opens
      // directly to WhatsApp with the order as text, no share-sheet
      // popup — the trade-off for that is no PDF file attached; the
      // confirmation screen still offers "Share PDF instead" for
      // anyone who wants the richer version by hand.
      openWhatsAppText(snap);
      toast.success('Order sent to WhatsApp!', { duration: 2500 });
    } catch (e) {
      // Guest checkout may not be wired up on the backend yet — rather
      // than leave them stuck on a failed order, nudge them to the
      // account path with everything they already typed still in place.
      if (!isLoggedIn && !wantsAccount && e.response?.status === 401) {
        setCheckoutMode('account');
        toast.error('Guest checkout needs a quick free account — just add a password below.');
      } else {
        toast.error(e.response?.data?.message || 'Order failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring' }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-500"/>
          </motion.div>
          <h2 className="font-display font-black text-3xl text-gray-900 mb-2">We got your order! 🎆</h2>
          <p className="text-gray-500 mb-6">
            We've received your order details. Our team will call you shortly on{' '}
            <span className="font-semibold text-gray-700">{form.phone}</span> to confirm and arrange delivery.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-bold font-mono">{success.invoiceNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">To Pay</span>
              <span className="font-bold text-red-600">{fmt(success.grandTotal ?? grandTotal)}</span>
            </div>
            {success.loyaltyEarned > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Loyalty Points Earned</span>
                <span className="font-bold text-green-600">+{success.loyaltyEarned} pts ⭐</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5 mb-5">
            <button
              onClick={() => snapshot && openWhatsAppText(snapshot)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: '#25D366' }}
            >
              <PhoneIcon className="h-4 w-4" /> Message us on WhatsApp
            </button>
            <button
              onClick={() => snapshot && emailAdmin(snapshot)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-700"
            >
              <EnvelopeIcon className="h-4 w-4" /> Email us the order
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => snapshot && downloadPdf(snapshot)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-gray-500"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Download PDF
              </button>
              <button
                onClick={() => snapshot && shareToWhatsApp(snapshot)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-gray-500"
              >
                <PhoneIcon className="h-3.5 w-3.5" /> {sharedPdf ? 'Share PDF again' : 'Share PDF instead'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            We've already opened WhatsApp with your order details filled in —
            if it got blocked by your browser, tap the button above to send it yourself.
          </p>

          <div className="flex gap-3">
            <button onClick={() => navigate('/orders')} className="flex-1 btn-outline py-3 rounded-xl text-sm">My Orders</button>
            <button onClick={() => navigate('/products')} className="flex-1 btn-brand py-3 text-sm">Continue Shopping</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-black text-3xl text-gray-900 mb-2">Checkout</h1>
        <p className="text-sm text-gray-500 mb-8">
          No online payment needed — place your order and our team will call to confirm.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {!isLoggedIn && (
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-bold text-gray-800 text-lg mb-1">How would you like to checkout?</h2>
                <p className="text-xs text-gray-400 mb-4">Your call — either way, your order reaches us the same way.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" onClick={() => setCheckoutMode('guest')}
                    className="text-left p-4 rounded-xl border-2 transition-colors"
                    style={{
                      borderColor: checkoutMode === 'guest' ? 'var(--primary-red)' : '#e5e7eb',
                      background:  checkoutMode === 'guest' ? 'var(--surface-2)' : '#fff',
                    }}>
                    <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
                      <BoltIcon className="h-4 w-4 text-orange-500" /> Quick Guest Checkout
                    </p>
                    <p className="text-xs text-gray-500">Just place your order — no account needed</p>
                  </button>
                  <button type="button" onClick={() => setCheckoutMode('account')}
                    className="text-left p-4 rounded-xl border-2 transition-colors"
                    style={{
                      borderColor: checkoutMode === 'account' ? 'var(--primary-red)' : '#e5e7eb',
                      background:  checkoutMode === 'account' ? 'var(--surface-2)' : '#fff',
                    }}>
                    <p className="font-bold text-sm mb-1 flex items-center gap-1.5">
                      <UserPlusIcon className="h-4 w-4 text-red-500" /> Create Account
                    </p>
                    <p className="text-xs text-gray-500">Track this order & save details for next time</p>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => openAuth('login')} className="font-bold" style={{ color:'var(--primary-red)' }}>
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg mb-5">Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="shop-label">Full Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} className="shop-input" placeholder="Your full name" required/></div>
                <div className="col-span-2 sm:col-span-1"><label className="shop-label">Phone *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} className="shop-input" placeholder="10-digit number" required/></div>
                <div className="col-span-2 sm:col-span-1"><label className="shop-label">Pincode *</label><input value={form.pincode} onChange={e => set('pincode', e.target.value)} className="shop-input" placeholder="6-digit pincode" required/></div>

                {wantsAccount && (
                  <>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="shop-label">Set Password *</label>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                          className="shop-input" placeholder="At least 6 characters" required/>
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPw ? <EyeSlashIcon className="h-4 w-4"/> : <EyeIcon className="h-4 w-4"/>}
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="shop-label">Confirm Password *</label>
                      <input type={showPw ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)}
                        className="shop-input" placeholder="Re-enter password" required/>
                    </div>
                  </>
                )}

                <div className="col-span-2"><label className="shop-label">Full Address *</label><textarea value={form.address} onChange={e => set('address', e.target.value)} className="shop-input h-20 resize-none" placeholder="House/Flat No., Street, Area..." required/></div>
                <div><label className="shop-label">City *</label><input value={form.city} onChange={e => set('city', e.target.value)} className="shop-input" placeholder="City" required/></div>
                <div><label className="shop-label">State</label><input value={form.state} onChange={e => set('state', e.target.value)} className="shop-input" placeholder="State"/></div>
                <div className="col-span-2"><label className="shop-label">Order Notes (optional)</label><input value={form.notes} onChange={e => set('notes', e.target.value)} className="shop-input" placeholder="Special instructions..."/></div>
              </div>
              <button onClick={handlePlaceOrder} disabled={loading}
                className="w-full btn-brand mt-5 justify-center py-3.5 text-base disabled:opacity-60">
                {loading ? 'Placing Order...' : wantsAccount ? `Create Account & Place Order — ${fmt(grandTotal)}` : `Place Order — ${fmt(grandTotal)}`}
              </button>
              <p className="text-xs text-gray-400 mt-3 text-center">
                We'll send your order PDF to our team and call you to confirm — no payment needed now.
              </p>
            </motion.div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 h-fit sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-52 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {(item.thumb_url || item.image_url)
                      ? <img src={item.thumb_url || item.image_url} alt={item.name} className="w-full h-full object-cover"/>
                      : '🎆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-red-600 flex-shrink-0">{fmt(parseFloat(item.selling_price) * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              {[['Subtotal', fmt(subtotal)]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon ({coupon?.name})</span>
                  <span className="font-bold">-{fmt(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold">
                <span className="text-gray-900">To Pay</span>
                <span className="text-red-600 text-xl font-black">{fmt(grandTotal)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
              <ShieldCheckIcon className="h-4 w-4 text-green-500 flex-shrink-0"/>
              Delivery charge depends on your location & parcel — our team will confirm it on call.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
