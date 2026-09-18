// mahapattasu-shop/src/store/index.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Price a line item should be charged at:
// the store-wide sale price if one is running, else the normal price.
const unitPriceOf = (item) =>
  (item.has_offer && item.offer_price != null)
    ? parseFloat(item.offer_price)
    : parseFloat(item.selling_price || 0);

// stock_qty is a decimal(10,3) column, so the API can serialise it as
// "80.000" — round it for anything shown to the customer.
const qtyFmt = (n) => Math.round(parseFloat(n) || 0);

// ── Cart Store ─────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,          // checkout coupon (is_global = 0)
      couponDiscount: 0,

      addItem: (product, qty = 1) => {
        const items  = get().items;
        const exists = items.find(i => i.id === product.id);
        if (exists) {
          if (exists.qty + qty > product.stock_qty)
            return { error: `Only ${qtyFmt(product.stock_qty)} in stock` };
          set({ items: items.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i) });
        } else {
          if (qty > product.stock_qty)
            return { error: `Only ${qtyFmt(product.stock_qty)} in stock` };
          // product already carries has_offer / offer_price from the API
          set({ items: [...items, { ...product, qty }] });
        }
        return { success: true };
      },

      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),

      updateQty: (id, qty) => {
        if (qty <= 0) { set(s => ({ items: s.items.filter(i => i.id !== id) })); return; }
        set(s => ({ items: s.items.map(i => i.id === id ? { ...i, qty } : i) }));
      },

      clearCart:    () => set({ items: [], coupon: null, couponDiscount: 0 }),
      applyCoupon:  (coupon, discount) => set({ coupon, couponDiscount: discount }),
      removeCoupon: () => set({ coupon: null, couponDiscount: 0 }),

      // ── Helpers used by the UI ──────────────────────────────
      getUnitPrice: (item) => unitPriceOf(item),

      // Saving from the store-wide sale, per line
      getLineSaleSaving: (item) => {
        if (!item.has_offer || item.offer_price == null) return 0;
        const list  = parseFloat(item.selling_price || 0);
        const offer = parseFloat(item.offer_price);
        return parseFloat(((list - offer) * item.qty).toFixed(2));
      },

      // ── Totals ────────────────────────────────────────────
      getCount: () => get().items.reduce((s, i) => s + i.qty, 0),

      // Subtotal already reflects the store-wide sale price
      getSubtotal: () => get().items.reduce((s, i) => s + unitPriceOf(i) * i.qty, 0),

      // What the subtotal would have been at full price
      getListSubtotal: () => get().items.reduce(
        (s, i) => s + parseFloat(i.selling_price || 0) * i.qty, 0),

      // GST is not shown to or charged from the customer on this storefront;
      // getTax() is kept only in case something upstream still needs the
      // figure, but it is no longer added into getTotal().
      getTax: () => get().items.reduce((s, i) => {
        const base = unitPriceOf(i) * i.qty;
        return s + base * (parseFloat(i.tax_rate || 0) / 100);
      }, 0),

      // Total sale discount across the cart
      getSaleDiscount: () => get().getListSubtotal() - get().getSubtotal(),

      getTotal: () => {
        const sub    = get().getSubtotal();
        const coupon = get().coupon;
        let couponOff = 0;
        if (coupon) {
          couponOff = coupon.type === 'percentage'
            ? (sub * coupon.value) / 100
            : coupon.value;
        }
        return Math.round(sub - couponOff);
      },

      // Everything saved: store sale + coupon + MRP
      getTotalSavings: () => {
        const saleSave = get().getSaleDiscount();
        const sub      = get().getSubtotal();
        const coupon   = get().coupon;
        let couponSave = 0;
        if (coupon) {
          couponSave = coupon.type === 'percentage'
            ? (sub * coupon.value) / 100
            : coupon.value;
        }
        return saleSave + couponSave;
      },
    }),
    {
      name: 'shop-cart',
      partialize: s => ({ items: s.items, coupon: s.coupon, couponDiscount: s.couponDiscount }),
    }
  )
);

// ── Auth Store ─────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      customer: null, token: null, isLoggedIn: false,
      login:  (customer, token) => set({ customer, token, isLoggedIn: true }),
      logout: () => { set({ customer:null, token:null, isLoggedIn:false }); localStorage.removeItem('shop-auth'); },
      updateCustomer: (data) => set(s => ({ customer: { ...s.customer, ...data } })),
    }),
    { name: 'shop-auth' }
  )
);

// ── Wishlist Store ─────────────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const items  = get().items;
        const exists = items.find(i => i.id === product.id);
        set({ items: exists ? items.filter(i => i.id !== product.id) : [...items, product] });
      },
      isWishlisted: (id) => get().items.some(i => i.id === id),
    }),
    { name: 'shop-wishlist' }
  )
);

// ── UI Store ───────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  cartOpen: false, authModal: null, productModal: null, searchOpen: false,
  openCart:     () => set({ cartOpen: true }),
  closeCart:    () => set({ cartOpen: false }),
  openAuth: (m) => set({ authModal: m }),
  closeAuth:    () => set({ authModal: null }),
  openProduct: (p) => set({ productModal: p }),
  closeProduct: () => set({ productModal: null }),
  toggleSearch: () => set(s => ({ searchOpen: !s.searchOpen })),
}));
