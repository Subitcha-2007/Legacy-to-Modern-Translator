'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  CreditCard,
  Download,
  Printer,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  AlertCircle,
  Building,
  RefreshCw,
  Search
} from 'lucide-react';

export default function RetailerPaymentsPage() {
  const { user, token } = useAuth();
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [statementData, setStatementData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'DETAILS' | 'STATEMENT'>('DETAILS');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (token) {
      fetchPaymentInfo();
    }
  }, [token]);

  const fetchPaymentInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch payment details & transactions
      const res = await fetch('/api/payments/my-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentData(data);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to load payment details.');
      }

      // Fetch full account statement
      const stmtRes = await fetch('/api/payments/statement', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (stmtRes.ok) {
        const stmt = await stmtRes.json();
        setStatementData(stmt.statement);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with SMM server.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const transactions = paymentData?.transactions || [];
  const filteredTransactions = transactions.filter((t: any) =>
    (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.referenceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const retailer = paymentData?.retailer || user;
  const creditLimit = Number(retailer?.creditLimit || 0);
  const currentBalance = Number(retailer?.currentBalance || 0);
  const availableCredit = Math.max(0, creditLimit - currentBalance);

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F4C81] uppercase tracking-wider bg-[#DFF3FF] px-2.5 py-0.5 rounded-full border border-[#BEE3F8]">
                B2B Wholesale Account
              </span>
              <span className="text-xs text-slate-500">• {retailer?.shopName || 'Retail Pharmacy'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Payment Details &amp; Account Statement
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time wholesale credit tracking, payment history, and downloadable GST statement with Sakthimurugan Medical Agencies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPaymentInfo}
              className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Statement</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs rounded-r-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3 Key Financial Metric Cards (Light Cyan Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center text-slate-700 text-xs font-bold uppercase tracking-wider">
              <span>Approved Credit Limit</span>
              <Building className="w-4 h-4 text-[#0F4C81]" />
            </div>
            <div className="text-3xl font-black text-[#0F4C81] mt-2">
              ₹{creditLimit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Sanctioned by Sakthimurugan Medical Agencies
            </div>
          </div>

          <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center text-slate-700 text-xs font-bold uppercase tracking-wider">
              <span>Outstanding Balance</span>
              <CreditCard className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-3xl font-black text-amber-900 mt-2">
              ₹{currentBalance.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Unsettled invoices (Subject to 15/30-day payment cycle)
            </div>
          </div>

          <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center text-slate-700 text-xs font-bold uppercase tracking-wider">
              <span>Available Credit</span>
              <CreditCard className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-3xl font-black text-emerald-800 mt-2">
              ₹{availableCredit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Available for immediate tablet and medicine dispatch
            </div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <button
            onClick={() => setActiveView('DETAILS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeView === 'DETAILS'
                ? 'bg-[#0F4C81] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Payment Transactions &amp; History
          </button>
          <button
            onClick={() => setActiveView('STATEMENT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeView === 'STATEMENT'
                ? 'bg-[#0F4C81] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Detailed Account Statement
          </button>
        </div>

        {/* View 1: Payment Transactions & History */}
        {activeView === 'DETAILS' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-bold text-sm text-slate-900">
                Payment Transactions ({filteredTransactions.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search invoice or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Loading payment transactions from database...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No payment transactions recorded for this account yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DFF3FF]/60 text-slate-700 uppercase tracking-wider text-[10px] font-bold border-b border-cyan-200">
                    <tr>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Reference / Invoice</th>
                      <th className="py-3 px-4">Description / Notes</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                      <th className="py-3 px-4 text-right">Balance After (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((txn: any) => {
                      const isDebit = txn.transactionType === 'DEBIT';
                      return (
                        <tr key={txn.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            TXN-{String(txn.id).padStart(4, '0')}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                isDebit
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isDebit ? (
                                <>
                                  <ArrowUpRight className="w-3 h-3 text-amber-600" />
                                  <span>DEBIT</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                  <span>CREDIT</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {txn.referenceNumber || (txn.orderId ? `Order #${txn.orderId}` : '—')}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {txn.notes || 'Wholesale account entry'}
                          </td>
                          <td className={`py-3 px-4 text-right font-black ${isDebit ? 'text-amber-800' : 'text-emerald-700'}`}>
                            {isDebit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-[#0F4C81]">
                            ₹{txn.balanceAfter.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View 2: Detailed Account Statement */}
        {activeView === 'STATEMENT' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 printable-statement">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider bg-[#DFF3FF] px-2 py-0.5 rounded-full">
                  Official Statement of Account
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Sakthimurugan Medical Agencies
                </h2>
                <p className="text-xs text-slate-500">
                  Wholesale Pharmaceutical Supplier • No. 45 Nethaji Road, Erode - 638001
                </p>
              </div>

              <div className="text-right text-xs text-slate-600">
                <div><strong>Statement Date:</strong> {new Date().toLocaleDateString('en-IN')}</div>
                <div><strong>GSTIN:</strong> 33AAACS1234M1Z8</div>
                <div><strong>DL No:</strong> TN-ERD-20B-00129 / 21B-00130</div>
              </div>
            </div>

            {/* Client Particulars */}
            <div className="bg-[#DFF3FF]/40 border border-[#BEE3F8] rounded-xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold">Retail Pharmacy:</span>
                <div className="font-bold text-slate-900 text-sm">{retailer?.shopName || 'Retailer Shop'}</div>
                <div className="text-slate-600">Proprietor: {retailer?.ownerName}</div>
                <div className="text-slate-600">Address: {retailer?.address || 'Erode, Tamil Nadu'}</div>
              </div>
              <div className="sm:text-right">
                <div className="text-slate-600"><strong>DL Number:</strong> {retailer?.dlNumber || 'Pending'}</div>
                <div className="text-slate-600"><strong>GST Number:</strong> {retailer?.gstNumber || 'Unregistered'}</div>
                <div className="text-slate-900 font-bold mt-1">
                  Approved Credit Limit: ₹{creditLimit.toLocaleString('en-IN')}
                </div>
                <div className="text-[#0F4C81] font-black">
                  Current Outstanding Balance: ₹{currentBalance.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Statement Grid */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DFF3FF]/60 text-slate-800 text-[11px] font-bold border-b border-cyan-200">
                  <tr>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Reference / Order ID</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3 text-right">Debit (₹)</th>
                    <th className="py-3 px-3 text-right">Credit (₹)</th>
                    <th className="py-3 px-3 text-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t: any) => {
                    const isDebit = t.transactionType === 'DEBIT';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-600">
                          {new Date(t.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[10px]">
                          {isDebit ? (
                            <span className="text-amber-800">DEBIT</span>
                          ) : (
                            <span className="text-emerald-700">CREDIT</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {t.referenceNumber || (t.orderId ? `INV-${t.orderId}` : '—')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {t.notes || 'Wholesale purchase / settlement'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          {isDebit ? `₹${t.amount.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                          {!isDebit ? `₹${t.amount.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-[#0F4C81]">
                          ₹{t.balanceAfter.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t flex flex-col sm:flex-row justify-between items-center gap-2">
              <div>
                Payment Terms: 15-day / 30-day wholesale credit cycle. Please pay by Cheque, RTGS/NEFT or counter cash.
              </div>
              <div className="font-bold text-slate-700">
                Sakthimurugan Medical Agencies, Erode
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
