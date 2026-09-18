import React from 'react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { shopAPI } from '../services/api';
import { useAuthStore, useUIStore } from '../store';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import clsx from 'clsx';

const fmt = (n) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);

const ORDER_STATUS = {
  pending:    { label:'Order Placed',  color:'bg-yellow-100 text-yellow-700',  icon:'⏳', step:0 },
  confirmed:  { label:'Confirmed',     color:'bg-blue-100 text-blue-700',      icon:'✅', step:1 },
  processing: { label:'Packing',       color:'bg-indigo-100 text-indigo-700',  icon:'📦', step:2 },
  shipped:    { label:'Shipped',       color:'bg-purple-100 text-purple-700',  icon:'🚚', step:3 },
  delivered:  { label:'Delivered',     color:'bg-green-100 text-green-700',    icon:'🎉', step:4 },
  cancelled:  { label:'Cancelled',     color:'bg-red-100 text-red-700',        icon:'❌', step:-1 },
  returned:   { label:'Returned',      color:'bg-orange-100 text-orange-700',  icon:'↩️', step:-1 },
};

const TIMELINE = ['pending','confirmed','processing','shipped','delivered'];

export default function OrdersPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuth }   = useUIStore();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { openAuth('login'); return; }
    shopAPI.getOrders()
      .then(r => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display font-black text-3xl text-gray-900 mb-2 flex items-center gap-2">
          <ClipboardDocumentListIcon className="h-8 w-8 text-red-500"/> My Orders
        </h1>
        <p className="text-gray-500 mb-8">Track your fireworks orders in real time</p>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="skeleton h-40 rounded-2xl"/>)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-7xl mb-4">📦</div>
            <h3 className="font-display font-bold text-2xl text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
            <Link to="/products" className="btn-brand">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const osCfg    = ORDER_STATUS[order.order_status] || ORDER_STATUS.pending;
              const stepIdx  = TIMELINE.indexOf(order.order_status);
              const isCancelled = ['cancelled','returned'].includes(order.order_status);

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className={clsx('h-1.5', isCancelled ? 'bg-red-400' : stepIdx >= 4 ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500')}
                    style={{ width: isCancelled ? '100%' : `${Math.max(10, (stepIdx + 1) / TIMELINE.length * 100)}%` }}/>

                  <div className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <p className="font-mono font-bold text-red-600">{order.invoice_no}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{dayjs(order.sale_date).format('DD MMM YYYY, hh:mm A')}</p>
                        <p className="text-xs text-gray-400">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-black text-xl text-red-600">{fmt(order.total_amt)}</p>
                        <span className={clsx('badge text-xs font-bold px-3 py-1 rounded-full mt-1', osCfg.color)}>
                          {osCfg.icon} {osCfg.label}
                        </span>
                      </div>
                    </div>

                    {!isCancelled && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1">
                          {TIMELINE.map((step, i) => {
                            const done    = i <= stepIdx;
                            const current = i === stepIdx;
                            const sCfg    = ORDER_STATUS[step];
                            return (
                              <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                  <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                                    current ? 'bg-red-500 text-white ring-2 ring-red-200' :
                                    done    ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')}>
                                    {done && !current ? '✓' : sCfg.icon}
                                  </div>
                                  <p className={clsx('text-[9px] font-semibold mt-0.5 text-center',
                                    current ? 'text-red-600' : done ? 'text-green-600' : 'text-gray-300')}>
                                    {sCfg.label.split(' ')[0]}
                                  </p>
                                </div>
                                {i < TIMELINE.length - 1 && (
                                  <div className={clsx('flex-1 h-0.5 mb-3 rounded-full', i < stepIdx ? 'bg-green-400' : 'bg-gray-200')}/>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {order.tracking_note && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-3">
                        <p className="text-xs font-semibold text-blue-600">📍 Update from shop</p>
                        <p className="text-sm text-blue-700 mt-0.5">{order.tracking_note}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Link to={`/orders/${order.id}`} className="btn-outline text-sm py-2 px-4 rounded-xl">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
