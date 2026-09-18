import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardDocumentListIcon, HeartIcon, ArrowRightOnRectangleIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAuthStore, useUIStore } from '../store';
import { shopAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { customer, isLoggedIn, logout, updateCustomer } = useAuthStore();
  const { openAuth } = useUIStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ name: customer?.name||'', email: customer?.email||'', city: customer?.city||'', address: customer?.address||'' });
  const [pwForm, setPwForm]   = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [tab, setTab]         = useState('profile');

  if (!isLoggedIn) {
    return (
      <div className="pt-28 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="font-display font-bold text-2xl mb-2">Login Required</h2>
          <button onClick={() => openAuth('login')} className="btn-brand mt-4">Login Now</button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await shopAPI.updateProfile(form); updateCustomer(form); toast.success('Profile updated!'); setEditing(false); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setSaving(true);
    try { await shopAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); toast.success('Password changed!'); setPwForm({ currentPassword:'',newPassword:'',confirm:'' }); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-display font-black text-3xl">
              {customer?.name?.charAt(0)}
            </div>
            <div>
              <h1 className="font-display font-black text-2xl">{customer?.name}</h1>
              <p className="text-white/80">{customer?.phone}</p>
              <div className="flex items-center gap-2 mt-1">
                <StarIcon className="h-4 w-4 text-yellow-300"/>
                <span className="text-sm font-semibold">{customer?.loyalty_points || 0} Loyalty Points</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100">
          {[['profile','My Profile'],['password','Change Password'],['quick','Quick Links']].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab===t?'bg-red-500 text-white shadow-md':'text-gray-500 hover:text-gray-800'}`}>{l}</button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-lg">Profile Information</h2>
              <button onClick={() => setEditing(v=>!v)} className={editing ? 'text-red-400 text-sm font-bold' : 'btn-outline text-sm py-1.5 px-4 rounded-xl'}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div><label className="shop-label">Full Name</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="shop-input"/></div>
                <div><label className="shop-label">Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="shop-input"/></div>
                <div><label className="shop-label">City</label><input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} className="shop-input"/></div>
                <div><label className="shop-label">Address</label><textarea value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} className="shop-input h-20 resize-none"/></div>
                <button type="submit" disabled={saving} className="btn-brand w-full justify-center">{saving?'Saving...':'Save Changes'}</button>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[['Name',customer?.name],['Phone',customer?.phone],['Email',customer?.email||'Not set'],['City',customer?.city||'Not set'],['Loyalty Points',`⭐ ${customer?.loyalty_points||0} pts`],['Member Since','2024']].map(([l,v])=>(
                  <div key={l} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{l}</p>
                    <p className="font-semibold text-gray-800">{v}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'password' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-5">Change Password</h2>
            <form onSubmit={handleChangePw} className="space-y-4 max-w-sm">
              <div><label className="shop-label">Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e=>setPwForm(f=>({...f,currentPassword:e.target.value}))} className="shop-input" required/></div>
              <div><label className="shop-label">New Password</label><input type="password" value={pwForm.newPassword} onChange={e=>setPwForm(f=>({...f,newPassword:e.target.value}))} className="shop-input" required/></div>
              <div><label className="shop-label">Confirm New Password</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} className="shop-input" required/></div>
              <button type="submit" disabled={saving} className="btn-brand w-full justify-center">{saving?'Changing...':'Change Password'}</button>
            </form>
          </div>
        )}

        {tab === 'quick' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['/orders','My Orders','View all your past orders',ClipboardDocumentListIcon,'from-blue-500 to-indigo-500'],
              ['/wishlist','Wishlist','Products you love',HeartIcon,'from-red-500 to-pink-500']].map(([path,title,desc,Icon,grad])=>(
              <Link key={path} to={path} className={`bg-gradient-to-br ${grad} rounded-2xl p-5 text-white hover:scale-105 transition-transform`}>
                <Icon className="h-8 w-8 mb-3 text-white/80"/>
                <h3 className="font-display font-bold text-lg">{title}</h3>
                <p className="text-white/70 text-sm">{desc}</p>
              </Link>
            ))}
            <button onClick={() => { logout(); navigate('/'); toast.success('Logged out'); }}
              className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-5 text-white hover:scale-105 transition-transform text-left">
              <ArrowRightOnRectangleIcon className="h-8 w-8 mb-3 text-white/80"/>
              <h3 className="font-display font-bold text-lg">Sign Out</h3>
              <p className="text-white/70 text-sm">Logout from your account</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
