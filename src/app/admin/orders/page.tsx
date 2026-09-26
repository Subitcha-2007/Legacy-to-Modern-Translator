'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import {
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Printer,
  X,
  Building,
  UserCheck
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (res.ok) {
        setMessage(`Order #${orderId} status updated to ${newStatus}.`);
        setTimeout(() => setMessage(null), 4000);
        await fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const openInvoiceModal = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedInvoice(data.invoice);
      }
    } catch (e) {
      console.error('Failed to fetch invoice:', e);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.retailer?.shopName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.retailer?.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.dispatchRoute || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F4C81] uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4" />
              <span>Logistics &amp; Dispatch Fleet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Wholesale Order Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track bulk pharmacy orders, assign delivery fleet routes, and update fulfillment statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
            >
              Back to Admin Hub
            </Link>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-r-xl font-bold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-[#DFF3FF]/40 border border-[#BEE3F8] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search invoice, shop, or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-2xs"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto text-xs">
            {['ALL', 'PENDING', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  statusFilter === st
                    ? 'bg-[#0F4C81] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Loading wholesale orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No orders match the selected filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#BEE3F8] transition shadow-xs space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-[#0F4C81] bg-[#DFF3FF] px-2.5 py-1 rounded-lg border border-[#BEE3F8]">
                      {order.invoiceNumber}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {order.retailer?.shopName || 'Retail Pharmacy'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Owner: {order.retailer?.ownerName} • Phone: {order.retailer?.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Amount:</span>
                      <span className="text-base font-black text-[#0F4C81]">
                        ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => openInvoiceModal(order.id)}
                      className="bg-[#DFF3FF] hover:bg-cyan-100 text-[#0F4C81] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#BEE3F8] transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Logistics & Route */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Fleet Logistics:</span>
                    <span className="font-bold text-slate-800">{order.dispatchRoute}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Payment Terms:</span>
                    <span className="font-bold text-slate-800">
                      {order.paymentMethod === 'CREDIT_ACCOUNT' || order.paymentMethod === 'CREDIT_LEDGER'
                        ? 'Credit Account (15/30 Days)'
                        : order.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Placed On:</span>
                    <span className="text-slate-700">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Items & Status Action */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                  <div className="text-xs text-slate-600 flex-1">
                    <span className="font-semibold text-slate-900">Items ({order.items?.length || 0}): </span>
                    {order.items?.map((i: any) => `${i.product?.brandName || 'Product'} (${i.quantity} ${i.unitType})`).join(', ')}
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Change Status:</span>
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="DISPATCHED">DISPATCHED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice View Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8 printable-invoice">
              <div className="flex justify-between items-center border-b pb-4">
                <Logo size="md" clickable={false} />
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#DFF3FF]/50 border border-[#BEE3F8] rounded-xl p-3 text-center">
                <div className="font-bold text-xs uppercase text-slate-800">
                  Tax Invoice #{selectedInvoice.order.invoiceNumber}
                </div>
                <div className="text-[10px] text-slate-500">
                  Retailer: {selectedInvoice.order.retailer?.shopName} • Date: {new Date(selectedInvoice.order.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#DFF3FF]/60 text-slate-800 text-[10px] font-bold border-b border-cyan-200">
                    <tr>
                      <th className="p-2.5">Medicine</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.order.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="p-2.5 font-bold text-slate-900">{item.product?.brandName}</td>
                        <td className="p-2.5 text-right">{item.quantity} {item.unitType}</td>
                        <td className="p-2.5 text-right">₹{item.priceAtPurchase}</td>
                        <td className="p-2.5 text-right font-black text-slate-900">
                          ₹{(item.quantity * item.priceAtPurchase).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="bg-[#0F4C81] hover:bg-[#0B3860] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Invoice Total</span>
                  <span className="text-lg font-black text-[#0F4C81]">
                    ₹{selectedInvoice.order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
