import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, EyeIcon, EyeSlashIcon, PhoneIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUIStore, useAuthStore } from '../../store';
import { shopAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { SHOP_NAME } from '../../config/tenant';

export default function AuthModal() {
  const { authModal, closeAuth, openAuth } = useUIStore();
  const { login } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', email:'', password:'', confirm:'', city:'' });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) { toast.error('Phone and password required'); return; }
    setLoading(true);
    try {
      const r = await shopAPI.login({ phone: form.phone, password: form.password });
      login(r.data.data.customer, r.data.data.token);
      toast.success(`Welcome back, ${r.data.data.customer.name.split(' ')[0]}! 🎆`);
      closeAuth();
    } catch (e) { toast.error(e.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) { toast.error('Name, phone and password required'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const r = await shopAPI.register({ name:form.name, phone:form.phone, email:form.email, password:form.password, city:form.city });
      login(r.data.data.customer, r.data.data.token);
      toast.success(`Welcome to ${SHOP_NAME}, ${form.name.split(' ')[0]}! 🎆`);
      closeAuth();
    } catch (e) { toast.error(e.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {authModal && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={closeAuth} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"/>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.9, opacity:0, y:20 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:0.9, opacity:0 }}
              transition={{ type:'spring', damping:25 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

              <div className="bg-gradient-to-br from-red-500 to-orange-500 px-6 py-6 text-white relative">
                <button onClick={closeAuth} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30">
                  <XMarkIcon className="h-4 w-4"/>
                </button>
                <div className="text-3xl mb-2">🎆</div>
                <h2 className="font-display text-2xl font-black">
                  {authModal === 'login' ? 'Welcome Back!' : 'Join the Celebration!'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {authModal === 'login' ? 'Sign in to your account' : 'Create your account and start shopping'}
                </p>
              </div>

              <div className="p-6">
                {authModal === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="shop-label">Phone Number / Email</label>
                      <div className="relative">
                        <PhoneIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
                          className="shop-input pl-10" placeholder="Enter phone or email" required/>
                      </div>
                    </div>
                    <div>
                      <label className="shop-label">Password</label>
                      <div className="relative">
                        <LockClosedIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                          className="shop-input pl-10 pr-10" placeholder="Enter password" required/>
                        <button type="button" onClick={() => setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {showPw ? <EyeSlashIcon className="h-4 w-4"/> : <EyeIcon className="h-4 w-4"/>}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-brand justify-center py-3 text-base mt-2">
                      {loading ? 'Signing in...' : 'Sign In 🎆'}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      New customer?{' '}
                      <button type="button" onClick={() => openAuth('register')} className="text-red-500 font-bold hover:text-red-700">
                        Create Account
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label className="shop-label">Full Name *</label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input value={form.name} onChange={e => set('name', e.target.value)}
                          className="shop-input pl-10" placeholder="Your full name" required/>
                      </div>
                    </div>
                    <div>
                      <label className="shop-label">Phone Number *</label>
                      <div className="relative">
                        <PhoneIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                          className="shop-input pl-10" placeholder="10-digit mobile number" required/>
                      </div>
                    </div>
                    <div>
                      <label className="shop-label">Email (optional)</label>
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                        className="shop-input" placeholder="your@email.com"/>
                    </div>
                    <div>
                      <label className="shop-label">City</label>
                      <input value={form.city} onChange={e => set('city', e.target.value)}
                        className="shop-input" placeholder="Your city"/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="shop-label">Password *</label>
                        <div className="relative">
                          <input type={showPw ? 'text':'password'} value={form.password} onChange={e => set('password', e.target.value)}
                            className="shop-input pr-10" placeholder="Min 6 chars" required/>
                          <button type="button" onClick={() => setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPw ? <EyeSlashIcon className="h-4 w-4"/> : <EyeIcon className="h-4 w-4"/>}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="shop-label">Confirm *</label>
                        <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)}
                          className="shop-input" placeholder="Re-enter" required/>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-brand justify-center py-3 text-base mt-1">
                      {loading ? 'Creating...' : 'Create Account 🎆'}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      Already have an account?{' '}
                      <button type="button" onClick={() => openAuth('login')} className="text-red-500 font-bold hover:text-red-700">
                        Sign In
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
