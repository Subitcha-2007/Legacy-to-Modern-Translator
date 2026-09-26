'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import {
  FileText,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  ShieldCheck,
  X,
  ExternalLink,
  Store,
  Download,
  AlertCircle
} from 'lucide-react';

export default function RetailerOrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PAYMENTS'>('ORDERS');

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersRes = await fetch('/api/retailer/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
      }

      // Fetch payment details
      const payRes = await fetch('/api/payments/my-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (payRes.ok) {
        const pData = await payRes.json();
        setPaymentData(pData);
      }
    } catch (err) {
      console.error('Failed to load retailer orders data:', err);
    } finally {
      setLoading(false);
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

  const handlePrint = () => {
    window.print();
  };

  const retailer = paymentData?.retailer || user;
  const creditLimit = Number(retailer?.creditLimit || 0);
  const currentBalance = Number(retailer?.currentBalance || 0);
  const availableCredit = Math.max(0, creditLimit - currentBalance);

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F4C81] uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Retail Pharmacy Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Wholesale Orders &amp; Tax Invoices
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.shopName || 'Retail Pharmacy'} • DL: {user?.dlNumber || 'Verified Wholesale Account'}
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'ORDERS'
                  ? 'bg-[#0F4C81] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F4C81]'
              }`}
            >
              Wholesale Orders ({orders.length})
            </button>
            <Link
              href="/retailer/payments"
              className="px-4 py-2 rounded-lg text-slate-600 hover:text-[#0F4C81] transition flex items-center gap-1.5"
            >
              <span>Payment Details &amp; Statement</span>
            </Link>
          </div>
        </div>

        {/* Live Credit Metrics (Light Cyan Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Approved Credit Limit
            </span>
            <div className="text-2xl font-black text-[#0F4C81] mt-1">
              ₹{creditLimit.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">Maximum allowable wholesale credit</span>
          </div>

          <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Outstanding Balance
            </span>
            <div className="text-2xl font-black text-amber-900 mt-1">
              ₹{currentBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">Unsettled credit purchases</span>
          </div>

          <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Available Credit
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              ₹{availableCredit.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">Ready for instant dispatch orders</span>
          </div>
        </div>

        {/* Orders Listing View */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
            Loading wholesale orders from database...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base">No Wholesale Orders Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse Sakthimurugan Medical Agencies catalog and place orders via Credit Account or Online.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block bg-[#0F4C81] hover:bg-[#0B3860] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
            >
              Order Tablets &amp; Medicines
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-[#BEE3F8] transition shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#0F4C81] bg-[#DFF3FF] px-3 py-1 rounded-lg border border-[#BEE3F8]">
                      {order.invoiceNumber}
                    </span>

                    {/* Order Status Badge */}
                    {order.orderStatus === 'COMPLETED' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Consignment Delivered
                      </span>
                    ) : order.orderStatus === 'DISPATCHED' ? (
                      <span className="bg-blue-100 text-[#0F4C81] text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Fleet Van Dispatched
                      </span>
                    ) : order.orderStatus === 'CANCELLED' ? (
                      <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        Cancelled
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Packing / Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Invoice Total:</span>
                      <span className="text-base font-black text-[#0F4C81]">
                        ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => openInvoiceModal(order.id)}
                      className="bg-[#DFF3FF] hover:bg-cyan-100 text-[#0F4C81] text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-[#BEE3F8]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View &amp; Print Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Delivery and Payment summary */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between gap-3">
                  <div>
                    <span className="text-slate-500 font-semibold">Delivery Method: </span>
                    <span className="font-bold text-slate-800">
                      {order.deliveryType === 'DOOR_DELIVERY' ? 'Local Erode Door Delivery' : 'Counter Self-Pickup'}
                    </span>
                    <span className="text-slate-500 ml-2">({order.dispatchRoute})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Payment: </span>
                    <span className="font-bold text-slate-800">
                      {order.paymentMethod === 'CREDIT_ACCOUNT' || order.paymentMethod === 'CREDIT_LEDGER'
                        ? 'Credit Account'
                        : order.paymentMethod}
                    </span>
                    <span className="text-slate-400 ml-2">• Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Products list preview */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                    Ordered Consignments ({order.items?.length || 0}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">{item.product?.brandName || `Item #${item.productId}`}</div>
                          <div className="text-[11px] text-slate-500">{item.product?.genericName}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-[#0F4C81]">{item.quantity} {item.unitType}</span>
                          <div className="text-[10px] text-slate-400">@ ₹{item.priceAtPurchase}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 printable-invoice">
              {/* Modal Top Bar */}
              <div className="flex justify-between items-center border-b pb-4">
                <Logo size="md" clickable={false} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 bg-[#0F4C81] hover:bg-[#0B3860] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tax Invoice Header */}
              <div className="text-center py-2 bg-[#DFF3FF]/50 border border-[#BEE3F8] rounded-xl">
                <h3 className="font-black text-sm tracking-wider uppercase text-slate-900">
                  Tax Invoice / Wholesale Supply Consignment
                </h3>
                <span className="text-[10px] font-mono text-slate-600">
                  Invoice No: <strong>{selectedInvoice.order.invoiceNumber}</strong> • Date: {new Date(selectedInvoice.order.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              {/* Two Column Particulars: Supplier vs Retailer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-[#0F4C81] uppercase text-[10px]">Wholesale Supplier:</span>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedInvoice.agency.agencyName}</div>
                  <div className="text-slate-600">{selectedInvoice.agency.address}</div>
                  <div className="text-slate-600 font-mono text-[11px] pt-1">
                    <div>GSTIN: {selectedInvoice.agency.gstin}</div>
                    <div>DL: {selectedInvoice.agency.dlNumber}</div>
                    <div>Contact: {selectedInvoice.agency.phone}</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Bill To (Licensed Retailer):</span>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {selectedInvoice.order.retailer?.shopName || 'Retail Pharmacy'}
                  </div>
                  <div className="text-slate-600">Owner: {selectedInvoice.order.retailer?.ownerName}</div>
                  <div className="text-slate-600">
                    {selectedInvoice.order.deliveryAddress || selectedInvoice.order.retailer?.address || 'Erode, Tamil Nadu'}
                  </div>
                  <div className="text-slate-600 font-mono text-[11px] pt-1">
                    <div>DL: {selectedInvoice.order.retailer?.dlNumber || 'Pending'}</div>
                    <div>GSTIN: {selectedInvoice.order.retailer?.gstNumber || 'Unregistered'}</div>
                    <div>Phone: {selectedInvoice.order.retailer?.phone}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#DFF3FF]/60 text-slate-800 text-[10px] font-bold uppercase tracking-wider border-b border-cyan-200">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Medicine Formulation</th>
                      <th className="py-2.5 px-3">Batch</th>
                      <th className="py-2.5 px-3">Exp</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.order.items?.map((item: any, idx: number) => {
                      const total = item.quantity * item.priceAtPurchase;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {item.product?.brandName}
                            <span className="block text-[10px] font-normal text-slate-500">
                              {item.product?.genericName} • {item.product?.companyName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{item.product?.batchNumber || 'SMM-BT-01'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{item.product?.expiryDate || '10/2027'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {item.quantity} {item.unitType}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                            ₹{item.priceAtPurchase.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">
                            ₹{total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total Summary Breakdown */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div><strong>Payment Method:</strong> {selectedInvoice.order.paymentMethod === 'CREDIT_ACCOUNT' || selectedInvoice.order.paymentMethod === 'CREDIT_LEDGER' ? 'Credit Account (15/30 Day Cycle)' : selectedInvoice.order.paymentMethod}</div>
                  <div><strong>Delivery Fleet:</strong> {selectedInvoice.order.dispatchRoute}</div>
                  <div><strong>Notes:</strong> {selectedInvoice.order.notes || 'Goods once sold are subject to manufacturer wholesale return policy.'}</div>
                </div>

                <div className="bg-[#DFF3FF]/50 border border-[#BEE3F8] rounded-xl p-4 w-full sm:w-64 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span>₹{(selectedInvoice.order.totalAmount / 1.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pharma GST (12%):</span>
                    <span>₹{(selectedInvoice.order.totalAmount - selectedInvoice.order.totalAmount / 1.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm border-t border-cyan-200 pt-2">
                    <span>Total Amount:</span>
                    <span className="text-[#0F4C81]">₹{selectedInvoice.order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp & Authorization */}
              <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-2">
                <div>Sakthimurugan Medical Agencies, Erode. Computer generated invoice, verified by batch quality inspector.</div>
                <div className="font-bold text-slate-700 text-right">
                  Authorized Signatory / Warehouse Supervisor
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
