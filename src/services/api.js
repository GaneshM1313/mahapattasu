import axios from 'axios';
import { TENANT_ID, BRANCH_ID } from '../config/tenant';

const api = axios.create({
  baseURL: '/api/v1/shop',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ────────────────────────────────────────
// 1. Attaches customer auth token (if logged in)
// 2. Attaches the hardcoded tenant + branch on EVERY request, so the
//    backend can scope products/customers/orders without needing
//    tenant info from the URL or a logged-in session.
//    See src/config/tenant.js to change which tenant this shop serves.
api.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('shop-auth') || '{}');
  const token  = stored?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  config.headers['X-Tenant-Id'] = TENANT_ID;
  config.headers['X-Branch-Id'] = BRANCH_ID;

  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shop-auth');
    }
    return Promise.reject(err);
  }
);

export const shopAPI = {
  // Products
  getProducts:      (params) => api.get('/products', { params }),
  getProduct:       (id)     => api.get(`/products/${id}`),
  getCategories:    ()       => api.get('/categories'),
  getFeatured:      ()       => api.get('/featured'),
  getOffers:        ()       => api.get('/offers'),
  searchSuggest:    (q)      => api.get('/search-suggest', { params: { q } }),
  getPaymentMethods:()       => api.get('/payment-methods'),

  // Auth
  register:       (data)   => api.post('/auth/register', data),
  login:          (data)   => api.post('/auth/login', data),
  me:             ()       => api.get('/auth/me'),
  updateProfile:  (data)   => api.put('/auth/profile', data),
  changePassword: (data)   => api.put('/auth/change-password', data),

  // Orders
  placeOrder:     (data)   => api.post('/orders', data),
  getOrders:      (params) => api.get('/orders', { params }),
  getOrder:       (id)     => api.get(`/orders/${id}`),

  // Coupon
  applyCoupon:    (data)   => api.post('/apply-coupon', data),
};

export default api;
