// src/App.jsx
// COMPLETE FILE — replace your existing one.
//
// Adds the /combos route for the new Combo Collection page.

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ProductModal from './components/product/ProductModal';
import WhatsAppButton from './components/common/WhatsAppButton';
import ScrollToTop from './components/common/ScrollToTop';

import HomePage          from './pages/HomePage';
import ProductsPage      from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OffersPage        from './pages/OffersPage';
import CombosPage        from './pages/CombosPage';   // ← NEW
import CheckoutPage      from './pages/CheckoutPage';
import OrdersPage        from './pages/OrdersPage';
import OrderDetailPage   from './pages/OrderDetailPage';
import WishlistPage      from './pages/WishlistPage';
import ProfilePage       from './pages/ProfilePage';
import PriceListPage     from './pages/PriceListPage';
import AboutPage         from './pages/AboutPage';
import ContactPage       from './pages/ContactPage';

import './index.css';

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ScrollToTop />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2600,
          style: {
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '14px',
            background: '#fff',
            color: '#1a1416',
            boxShadow: '0 12px 32px rgba(157,2,8,.16)',
          },
          success: { iconTheme: { primary: '#0f9d58', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#d90429', secondary: '#fff' } },
        }}
      />

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 pb-12 md:pb-16">
          <Routes>
            <Route path="/"            element={<HomePage />} />
            <Route path="/products"    element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/offers"      element={<OffersPage />} />
            <Route path="/combos"      element={<CombosPage />} />   {/* ← NEW */}
            <Route path="/price-list"  element={<PriceListPage />} />
            <Route path="/about"       element={<AboutPage />} />
            <Route path="/contact"     element={<ContactPage />} />
            <Route path="/wishlist"    element={<WishlistPage />} />
            <Route path="/orders"      element={<OrdersPage />} />
            <Route path="/orders/:id"  element={<OrderDetailPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/checkout"    element={<CheckoutPage />} />

            {/* Catch-all so a bad URL shows something useful */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <Footer />
        <CartDrawer />
        <ProductModal />
        <WhatsAppButton />
      </div>
    </BrowserRouter>
  );
}
