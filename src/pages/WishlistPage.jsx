import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useWishlistStore, useCartStore } from '../store';
import toast from 'react-hot-toast';
const fmt = (n) => `₹${parseFloat(n||0).toFixed(0)}`;
export default function WishlistPage() {
  const { items, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display font-black text-3xl text-gray-900 mb-8 flex items-center gap-2">
          <HeartIcon className="h-8 w-8 text-red-500"/>My Wishlist <span className="text-gray-400 text-xl font-medium">({items.length})</span>
        </h1>
        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-7xl mb-4">❤️</div>
            <h3 className="font-display font-bold text-2xl text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-6">Save products you love to buy them later</p>
            <Link to="/products" className="btn-brand">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item,i) => (
              <motion.div key={item.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center text-5xl overflow-hidden">
                  {(item.thumb_url || item.image_url)
                    ? <img src={item.thumb_url || item.image_url} alt={item.name} className="w-full h-full object-cover"/>
                    : '🎆'}
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-800 line-clamp-2 mb-2">{item.name}</p>
                  <p className="font-black text-red-600 mb-3">{fmt(item.selling_price)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { addItem(item); toast.success('Added to cart!'); }}
                      className="flex-1 btn-brand text-xs py-2 justify-center">Add to Cart</button>
                    <button onClick={() => { toggle(item); toast('Removed from wishlist'); }}
                      className="p-2 rounded-xl border-2 border-red-200 text-red-400 hover:bg-red-50">
                      <TrashIcon className="h-4 w-4"/>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
