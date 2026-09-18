import React, { useState, useEffect, useCallback } from 'react';
import { salesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon, PrinterIcon, ArrowPathIcon,
  XCircleIcon, CheckCircleIcon, EyeIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import clsx from 'clsx';

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  returned:   'bg-yellow-100 text-yellow-700',
};
const PAY_COLORS = {
  paid:     'bg-green-100 text-green-700',
  partial:  'bg-orange-100 text-orange-700',
  credit:   'bg-blue-100 text-blue-700',
  refunded: 'bg-red-100 text-red-700',
};
const TYPE_COLORS = {
  retail:    'bg-gray-100 text-gray-600',
  online:    'bg-purple-100 text-purple-700',
  wholesale: 'bg-blue-100 text-blue-700',
};

// ── Order Detail Modal ────────────────────────────────────────
function OrderDetailModal({ saleId, onClose, onStatusChange }) {
  const [sale, setSale]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    salesAPI.getById(saleId)
      .then(r => setSale(r.data.data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [saleId]);

  const handleStatus = async (status) => {
    if (!window.confirm(`Mark this order as "${status}"?${status === 'cancelled' ? ' Stock will be restored.' : ''}`)) return;
    setUpdating(true);
    try {
      await salesAPI.updateStatus(saleId, { status });
      toast.success(`Order marked as ${status}`);
      setSale(s => ({ ...s, status }));
      onStatusChange();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  const handlePrint = () => {
    const token = JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.accessToken;
    window.open(`http://localhost:5000/api/v1/sales/${saleId}/invoice?token=${token}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">
              {loading ? '...' : sale?.invoice_no}
            </h2>
            {sale && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${TYPE_COLORS[sale.sale_type] || 'bg-gray-100 text-gray-600'}`}>
                  {sale.sale_type === 'online' ? '🌐 Online Order' : sale.sale_type}
                </span>
                <span className={`badge ${STATUS_COLORS[sale.status] || 'bg-gray-100 text-gray-600'}`}>{sale.status}</span>
                <span className={`badge ${PAY_COLORS[sale.payment_status] || 'bg-gray-100 text-gray-600'}`}>{sale.payment_status}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl font-bold">✕</button>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>
        ) : sale ? (
          <div className="p-6 space-y-5">
            {/* Customer & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-3">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Customer</p>
                <p className="font-semibold text-sm">{sale.customer_name || 'Walk-in'}</p>
                {sale.customer_phone && <p className="text-xs text-[var(--text-secondary)]">{sale.customer_phone}</p>}
              </div>
              <div className="card p-3">
                <p className="text-xs text-[var(--text-secondary)] mb-1">Order Date</p>
                <p className="font-semibold text-sm">{dayjs(sale.sale_date).format('DD MMM YYYY')}</p>
                <p className="text-xs text-[var(--text-secondary)]">{dayjs(sale.sale_date).format('hh:mm A')}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                Order Items ({sale.items?.length || 0})
              </h3>
              <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--surface-2)]">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] uppercase">Product</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-[var(--text-secondary)] uppercase">Qty</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-[var(--text-secondary)] uppercase">Rate</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-[var(--text-secondary)] uppercase">Tax</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {(sale.items || []).map((item, i) => (
                      <tr key={i} className="hover:bg-[var(--surface-2)]">
                        <td className="px-4 py-2.5 font-medium">{item.product_name}</td>
                        <td className="px-3 py-2.5 text-center">{item.qty}</td>
                        <td className="px-3 py-2.5 text-center">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-center text-blue-500">₹{parseFloat(item.tax_amt).toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-bold">₹{parseFloat(item.total_amt).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="border border-[var(--border)] rounded-xl p-4 space-y-2">
              {[
                ['Subtotal',  sale.subtotal],
                ['Discount',  `-${sale.discount_amt}`],
                ['Tax (GST)', sale.tax_amt],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">{label}</span>
                  <span className="font-medium">₹{parseFloat(val || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-[var(--border)] pt-2 font-bold text-base">
                <span>Total</span>
                <span className="text-brand-600 text-lg">₹{parseFloat(sale.total_amt).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment details */}
            {sale.payments?.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Payments</h3>
                <div className="space-y-2">
                  {sale.payments.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm bg-[var(--surface-2)] rounded-xl px-4 py-2.5">
                      <span className="text-[var(--text-secondary)]">{p.method_name || 'Cash'}</span>
                      <span className="font-bold text-green-600">₹{parseFloat(p.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
              <button onClick={handlePrint} className="btn-secondary flex items-center gap-1.5 text-sm">
                <PrinterIcon className="h-4 w-4"/> Print Invoice
              </button>

              {sale.status === 'completed' && (
                <>
                  <button onClick={() => handleStatus('cancelled')} disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                    <XCircleIcon className="h-4 w-4"/>
                    {updating ? 'Updating...' : 'Cancel Order'}
                  </button>
                  <button onClick={() => handleStatus('returned')} disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-yellow-200 text-yellow-600 text-sm font-semibold hover:bg-yellow-50 transition-colors disabled:opacity-50">
                    <ArrowPathIcon className="h-4 w-4"/>
                    Return
                  </button>
                </>
              )}

              {sale.status === 'cancelled' && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
                  <XCircleIcon className="h-5 w-5"/>
                  Order Cancelled — Stock Restored
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Main Sales Page ───────────────────────────────────────────
export default function SalesPage() {
  const [sales, setSales]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [fromDate, setFromDate]   = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate]       = useState(dayjs().format('YYYY-MM-DD'));
  const [statusFilter, setStatus] = useState('');
  const [typeFilter, setType]     = useState('');
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({});
  const [viewId, setViewId]       = useState(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesAPI.getAll({
        search,
        from_date:  fromDate,
        to_date:    toDate,
        status:     statusFilter || undefined,
        sale_type:  typeFilter   || undefined,
        page,
        limit: 25,
      });
      setSales(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load sales'); }
    finally { setLoading(false); }
  }, [search, fromDate, toDate, statusFilter, typeFilter, page]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  // Summary stats
  const totalRevenue = sales.reduce((s, sale) => s + parseFloat(sale.total_amt || 0), 0);
  const onlineCount  = sales.filter(s => s.sale_type === 'online').length;
  const retailCount  = sales.filter(s => s.sale_type === 'retail').length;
  const pendingCount = sales.filter(s => s.payment_status !== 'paid').length;

  return (
    <div className="fade-up space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales & Orders</h1>
          <p className="page-subtitle">
            {pagination.total || 0} transactions · {fmt(totalRevenue)} total
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Shown',    value: pagination.total || 0,  color: 'text-[var(--text-primary)]' },
          { label: 'Retail / POS',   value: retailCount,             color: 'text-blue-600'  },
          { label: '🌐 Online Orders', value: onlineCount,           color: 'text-purple-600' },
          { label: 'Pending Payment', value: pendingCount,           color: 'text-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{label}</p>
            <p className={`font-display font-bold text-2xl mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="form-input pl-9 text-sm" placeholder="Invoice no, customer name, phone..." />
        </div>
        <div>
          <label className="form-label">From Date</label>
          <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="form-input text-sm"/>
        </div>
        <div>
          <label className="form-label">To Date</label>
          <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="form-input text-sm"/>
        </div>
        <div>
          <label className="form-label">Order Type</label>
          <select value={typeFilter} onChange={e => { setType(e.target.value); setPage(1); }} className="form-input text-sm w-36">
            <option value="">All Types</option>
            <option value="retail">🏪 Retail / POS</option>
            <option value="online">🌐 Online</option>
            <option value="wholesale">📦 Wholesale</option>
          </select>
        </div>
        <div>
          <label className="form-label">Status</label>
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} className="form-input text-sm w-32">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>
        <button onClick={fetchSales}
          className="btn-secondary text-sm flex items-center gap-1 self-end">
          <ArrowPathIcon className="h-4 w-4"/> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j}><div className="skeleton h-4 rounded"/></td>
                  ))}</tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[var(--text-secondary)]">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="font-semibold">No sales found for the selected filters</p>
                  </td>
                </tr>
              ) : sales.map(s => (
                <tr key={s.id}>
                  <td>
                    <span className={clsx('font-mono text-sm font-bold',
                      s.sale_type === 'online' ? 'text-purple-600' : 'text-brand-600')}>
                      {s.invoice_no}
                    </span>
                  </td>
                  <td>
                    <p className="text-sm">{dayjs(s.sale_date).format('DD/MM/YY')}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{dayjs(s.sale_date).format('hh:mm A')}</p>
                  </td>
                  <td>
                    <p className="text-sm font-semibold">{s.customer_name || 'Walk-in'}</p>
                    {s.customer_phone && <p className="text-xs text-[var(--text-secondary)]">{s.customer_phone}</p>}
                  </td>
                  <td>
                    <span className={`badge ${TYPE_COLORS[s.sale_type] || 'bg-gray-100 text-gray-600'}`}>
                      {s.sale_type === 'online' ? '🌐 Online' : s.sale_type === 'retail' ? '🏪 Retail' : s.sale_type}
                    </span>
                  </td>
                  <td className="font-bold text-sm">{fmt(s.total_amt)}</td>
                  <td>
                    <span className={`badge ${PAY_COLORS[s.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                      {s.payment_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setViewId(s.id)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500"
                        title="View Details">
                        <EyeIcon className="h-4 w-4"/>
                      </button>
                      <button onClick={() => {
                        const token = JSON.parse(localStorage.getItem('auth-store') || '{}')?.state?.accessToken;
                        window.open(`http://localhost:5000/api/v1/sales/${s.id}/invoice?token=${token}`, '_blank');
                      }}
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950 text-green-600"
                        title="Print Invoice">
                        <PrinterIcon className="h-4 w-4"/>
                      </button>
                      {s.status === 'completed' && (
                        <button onClick={async () => {
                          if (!window.confirm('Cancel this order? Stock will be restored.')) return;
                          try {
                            await salesAPI.updateStatus(s.id, { status: 'cancelled' });
                            toast.success('Order cancelled — stock restored');
                            fetchSales();
                          } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
                        }}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                          title="Cancel Order">
                          <XCircleIcon className="h-4 w-4"/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">
              Page {page} of {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {viewId && (
        <OrderDetailModal
          saleId={viewId}
          onClose={() => setViewId(null)}
          onStatusChange={() => { fetchSales(); setViewId(null); }}
        />
      )}
    </div>
  );
}
