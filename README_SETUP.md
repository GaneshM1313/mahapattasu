# Sri Mahalakshmi Pyro Shop — Setup

## What changed in this revision
- `src/config/tenant.js` (NEW) — hardcoded `TENANT_ID` / `BRANCH_ID`. Change these two
  numbers to point the whole storefront at a different tenant+branch.
- `src/services/api.js` — every request now sends `X-Tenant-Id` / `X-Branch-Id` headers
  automatically (read from `config/tenant.js`). Added `getPaymentMethods()`.
- `src/pages/CheckoutPage.jsx` — **bug fix**: payment method IDs were hardcoded
  (`method_id: 1` for COD, `2` for UPI). Since `payment_methods` rows now have
  per-tenant IDs (not shared/global), this would have silently posted the wrong
  payment method or hit a foreign-key error on a different tenant. Checkout now
  fetches the tenant's actual payment methods via `shopAPI.getPaymentMethods()`
  and lets the customer choose from whatever that tenant has configured.
- `src/components/product/ProductCard.jsx`, `ProductModal.jsx`, `CartDrawer.jsx`,
  `WishlistPage.jsx` — now prefer `product.thumb_url` (small WebP) over
  `product.image_url` (full size) for faster-loading thumbnails, matching the
  image-compression system added to the admin product upload.

## Install
```
npm install
```

## Run (dev)
```
npm start
```
The app expects `/api/v1/shop/*` to be reachable — either via a dev proxy
(add `"proxy": "http://localhost:5000"` to package.json) or by deploying
behind the same origin as the backend in production.

## Backend requirement
This frontend talks to `/api/v1/shop/*` routes that must exist on your
Express backend (`MM-Bharathicrackers-bms/backend`):
- `middleware/shopTenant.js`
- `middleware/shopAuth.js`
- `controllers/shopController.js`
- `routes/shop.js`
…plus 2 lines in `server.js` to register the route and a `SHOP_JWT_SECRET`
env var. These were provided separately — see `customer-shop-tenant-hardcode.zip`
from earlier in this conversation. Without them, every API call from this
frontend will 404.

## To switch tenants later
Edit `src/config/tenant.js`:
```js
export const TENANT_ID = 2;   // ← change
export const BRANCH_ID = 3;   // ← change
```
Rebuild. No other file needs to change.

## Project structure
```
src/
├── config/
│   └── tenant.js              hardcoded tenant/branch
├── services/
│   └── api.js                 axios instance + shopAPI methods
├── store/
│   └── index.js                zustand: cart, auth, wishlist, ui
├── components/
│   ├── layout/   Header.jsx, Footer.jsx
│   ├── auth/     AuthModal.jsx
│   ├── cart/     CartDrawer.jsx
│   └── product/  ProductCard.jsx, ProductModal.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── ProductsPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrdersPage.jsx
│   ├── OrderDetailPage.jsx
│   ├── ProfilePage.jsx
│   └── WishlistPage.jsx
├── App.jsx
├── index.js
└── index.css
```
