import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shopAPI } from '../services/api';
import dayjs from 'dayjs';
import clsx from 'clsx';

const fmt = (n) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);

const ORDER_STATUS = {
  pending:    { label:'Order Placed',  color:'text-yellow-600', bg:'bg-yellow-50 border-yellow-200',  icon:'⏳', desc:'We received your order and are reviewing it.' },
  confirmed:  { label:'Confirmed',     color:'text-blue-600',   bg:'bg-blue-50 border-blue-200',      icon:'✅', desc:'Your order has been confirmed by our team.' },
  processing: { label:'Packing',       color:'text-indigo-600', bg:'bg-indigo-50 border-indigo-200',  icon:'📦', desc:'Your order is being carefully packed.' },
  shipped:    { label:'Shipped',       color:'text-purple-600', bg:'bg-purple-50 border-purple-200',  icon:'🚚', desc:'Your order is on its way to you!' },
  delivered:  { label:'Delivered',     color:'text-green-600',  bg:'bg-green-50 border-green-200',    icon:'🎉', desc:'Your order has been delivered. Enjoy!' },
  cancelled:  { label:'Cancelled',     color:'text-red-600',    bg:'bg-red-50 border-red-200',        icon:'❌', desc:'This order has been cancelled.' },
  returned:   { label:'Returned',      color:'text-orange-600', bg:'bg-orange-50 border-orange-200',  icon:'↩️', desc:'This order has been returned.' },
};

const TIMELINE = ['pending','confirmed','processing','shipped','delivered'];

export default function OrderDetailPage() {
  const { id }   = useParams();
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopAPI.getOrder(id)
      .then(r => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="pt-28 min-h-screen text-center">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link to="/orders" className="btn-brand">My Orders</Link>
      </div>
    );
  }

  const currentStatus = order.order_status || 'pending';
  const osCfg         = ORDER_STATUS[currentStatus] || ORDER_STATUS.pending;
  const stepIdx       = TIMELINE.indexOf(currentStatus);
  const isCancelled   = ['cancelled','returned'].includes(currentStatus);

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/orders" className="text-sm text-red-500 font-bold mb-4 inline-flex items-center gap-1">
          ← Back to Orders
        </Link>

        <div className={clsx('rounded-2xl border-2 p-5 mb-5 flex items-center gap-4', osCfg.bg)}>
          <div className="text-4xl">{osCfg.icon}</div>
          <div>
            <h2 className={clsx('font-display font-black text-xl', osCfg.color)}>{osCfg.label}</h2>
            <p className="text-gray-600 text-sm mt-0.5">{osCfg.desc}</p>
            {order.tracking_note && (
              <div className="mt-2 bg-white/70 rounded-xl px-3 py-2">
                <p className="text-xs font-bold text-gray-500">📍 Shop Update:</p>
                <p className="text-sm font-medium text-gray-700">{order.tracking_note}</p>
              </div>
            )}
          </div>
        </div>

        {!isCancelled && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
            <h3 className="font-bold text-gray-800 mb-5">Order Journey</h3>
            <div className="space-y-0">
              {TIMELINE.map((step, i) => {
                const sCfg   = ORDER_STATUS[step];
                const done   = i <= stepIdx;
                const active = i === stepIdx;
                return (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all border-2',
                        active ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200' :
                        done   ? 'bg-green-500 border-green-500 text-white' :
                                 'bg-gray-100 border-gray-200 text-gray-300')}>
                        {done && !active ? '✓' : sCfg.icon}
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={clsx('w-0.5 h-8 my-1', i < stepIdx ? 'bg-green-400' : 'bg-gray-200')}/>
                      )}
                    </div>
                    <div className={clsx('pb-8 flex-1', i === TIMELINE.length - 1 && 'pb-0')}>
                      <p className={clsx('font-bold text-sm', active ? 'text-red-600' : done ? 'text-green-600' : 'text-gray-400')}>
                        {sCfg.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {active ? 'Current status' : done ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
            <p className="text-white/80 text-xs font-semibold">Order ID</p>
            <p className="font-mono font-black text-white text-xl">{order.invoice_no}</p>
            <p className="text-white/70 text-xs mt-1">{dayjs(order.sale_date).format('DD MMMM YYYY, hh:mm A')}</p>
          </div>
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Items Ordered</h3>
              <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🎆</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.qty} × {fmt(item.unit_price)}</p>
                    </div>
                    <p className="font-bold text-red-600 text-sm flex-shrink-0">{fmt(item.total_amt)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">{fmt(order.subtotal)}</span></div>
              {parseFloat(order.discount_amt || 0) > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span className="font-bold">-{fmt(order.discount_amt)}</span></div>}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-base">
                <span>Total</span><span className="text-red-600 text-xl">{fmt(order.total_amt)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
              <span className="text-sm font-semibold text-gray-600">Payment Status</span>
              <span className={clsx('badge font-bold text-sm px-3 py-1 rounded-full',
                order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                order.payment_status === 'credit' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700')}>
                {order.payment_status === 'paid' ? '✅ Paid' : order.payment_status === 'credit' ? '💳 COD' : order.payment_status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/orders" className="flex-1 btn-outline py-3 rounded-xl text-sm text-center">← All Orders</Link>
          <Link to="/products" className="flex-1 btn-brand justify-center text-sm py-3">Shop More</Link>
        </div>
      </div>
    </div>
  );
}
