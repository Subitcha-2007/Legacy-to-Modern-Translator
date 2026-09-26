'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  Truck,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  CreditCard,
  Package,
  TrendingUp,
  MapPin,
  Calendar,
  XCircle,
  AlertTriangle,
  X,
  FileText,
  ExternalLink,
  ShieldCheck,
  Users
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [pendingRetailers, setPendingRetailers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [selectedRetailer, setSelectedRetailer] = useState<any | null>(null);
  const [creditLimitInput, setCreditLimitInput] = useState<number>(100000);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // Stats
      const statsRes = await fetch('/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }

      // Pending retailers
      const pendingRes = await fetch('/api/admin/pending-retailers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pendingRes.ok) {
        const pData = await pendingRes.json();
        setPendingRetailers(pData.retailers || []);
      }

      // Orders
      const ordersRes = await fetch('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (retailerId: number) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/approve-retailer/${retailerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ creditLimit: creditLimitInput })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message);
        setSelectedRetailer(null);
        await loadAdminData();
      } else {
        alert(data.error || 'Failed to approve retailer');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (retailerId: number) => {
    if (!confirm('Are you sure you want to reject this retailer registration?')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reject-retailer/${retailerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Drug License or GST verification failed.' })
      });
      if (res.ok) {
        setActionMessage('Retailer registration has been rejected.');
        await loadAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F4C81] uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Wholesale Administration Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Admin Executive Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sakthimurugan Medical Agencies • Central Wholesale Depot, Erode, Tamil Nadu
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/inventory"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-[#0F4C81]" />
              <span>Inventory</span>
            </Link>
            <Link
              href="/admin/orders"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-[#0F4C81]" />
              <span>Orders</span>
            </Link>
            <Link
              href="/admin/payments"
              className="bg-[#0F4C81] hover:bg-[#0B3860] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Details</span>
            </Link>
          </div>
        </div>

        {actionMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-emerald-700">Dismiss</button>
          </div>
        )}

        {/* 8 Official Statistic KPI Cards (Light Cyan Boxes) */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Total Retailers */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Retailers</span>
                <Users className="w-3.5 h-3.5 text-[#0F4C81]" />
              </div>
              <div className="text-2xl font-black text-[#0F4C81]">
                {stats.totalRetailers}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{stats.approvedRetailersCount} Approved Active</span>
            </div>

            {/* 2. Pending Approvals */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Approvals</span>
                <Clock className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="text-2xl font-black text-amber-900">
                {stats.pendingApprovalsCount}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Waiting for DL/GST review</span>
            </div>

            {/* 3. Total Products */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Products</span>
                <Package className="w-3.5 h-3.5 text-[#0F4C81]" />
              </div>
              <div className="text-2xl font-black text-[#0F4C81]">
                {stats.totalProducts}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Wholesale medicine lines</span>
            </div>

            {/* 4. Low Stock Products */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock Products</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800">
                {stats.lowStockProductsCount}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Stock under 20 boxes</span>
            </div>

            {/* 5. Out of Stock Products */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700">
                {stats.outOfStockProductsCount}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Requires factory PO</span>
            </div>

            {/* 6. Total Orders */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
                <FileText className="w-3.5 h-3.5 text-[#0F4C81]" />
              </div>
              <div className="text-2xl font-black text-[#0F4C81]">
                {stats.totalOrders}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">₹{stats.totalRevenue?.toLocaleString('en-IN')} total</span>
            </div>

            {/* 7. Pending Orders */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Orders</span>
                <Truck className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="text-2xl font-black text-amber-800">
                {stats.pendingOrdersCount}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{stats.dispatchedOrdersCount} in transit today</span>
            </div>

            {/* 8. Total Outstanding Balance */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-600 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding Balance</span>
                <CreditCard className="w-3.5 h-3.5 text-amber-900" />
              </div>
              <div className="text-2xl font-black text-amber-900">
                ₹{stats.totalOutstandingDebt?.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Credit accounts receivable</span>
            </div>
          </div>
        )}

        {/* Section: Pending Retailer Approvals (Requirement 11) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>Pending Retailer Approvals ({pendingRetailers.length})</span>
                {pendingRetailers.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Action Required
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Verify Drug License (Form 20B/21B), GSTIN, and assign initial wholesale credit limit.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500">Loading pending applications...</div>
          ) : pendingRetailers.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 flex flex-col items-center gap-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <span className="font-semibold text-slate-700">All retailer applications have been reviewed.</span>
              <span className="text-slate-400">Newly registered pharmacies will appear here automatically.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingRetailers.map((ret) => (
                <div key={ret.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{ret.shopName}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        DL: {ret.dlNumber || 'Pending'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Owner: <strong>{ret.ownerName}</strong> • Phone: <span className="font-mono">{ret.phone}</span> • Email: {ret.email}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      GSTIN: {ret.gstNumber || 'Unregistered'} • Registered: {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                    </div>
                    {ret.dlDocumentUrl && (
                      <div className="pt-1">
                        <a
                          href={ret.dlDocumentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0F4C81] text-xs font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Uploaded Drug License PDF</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(ret.id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRetailer(ret);
                        setCreditLimitInput(100000);
                      }}
                      className="px-4 py-1.5 bg-[#0F4C81] hover:bg-[#0B3860] text-white text-xs font-bold rounded-lg shadow-xs transition"
                    >
                      Review &amp; Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Recent Wholesale Orders */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Recent Consignment Dispatches ({orders.slice(0, 5).length})
              </h3>
              <p className="text-xs text-slate-500">Active wholesale deliveries across Erode fleet</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#0F4C81] hover:underline"
            >
              View All Orders →
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#BEE3F8] transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0F4C81]">{order.invoiceNumber}</span>
                    <span className="font-bold text-slate-900">• {order.retailer?.shopName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Route: {order.dispatchRoute} • Payment: {order.paymentMethod === 'CREDIT_ACCOUNT' || order.paymentMethod === 'CREDIT_LEDGER' ? 'Credit Account' : order.paymentMethod}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 text-sm">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.orderStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'DISPATCHED'
                        ? 'bg-blue-100 text-[#0F4C81]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Modal */}
        {selectedRetailer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0F4C81]" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Approve Retailer &amp; Sanction Credit
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRetailer(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#DFF3FF]/50 border border-[#BEE3F8] rounded-xl p-3 text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">{selectedRetailer.shopName}</div>
                <div className="text-slate-600">Owner: {selectedRetailer.ownerName}</div>
                <div className="text-slate-600 font-mono text-[11px]">
                  DL: {selectedRetailer.dlNumber || 'TN-ERD-20B'} • GSTIN: {selectedRetailer.gstNumber || '33AAAAA'}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sanctioned Wholesale Credit Limit (₹):
                  </label>
                  <input
                    type="number"
                    step={10000}
                    min={10000}
                    value={creditLimitInput}
                    onChange={(e) => setCreditLimitInput(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Retailer can place tablet orders on Credit Account up to this limit.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRetailer(null)}
                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleApprove(selectedRetailer.id)}
                    className="flex-1 py-2.5 bg-[#0F4C81] hover:bg-[#0B3860] text-white rounded-xl font-bold transition shadow-sm"
                  >
                    {actionLoading ? 'Approving...' : 'Activate & Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
