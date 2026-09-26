'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  ArrowLeft,
  X,
  Search,
  Filter,
  Receipt,
  Download,
  Building
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('ALL');

  // Record payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentData(data);
      }
    } catch (err) {
      console.error('Failed to fetch payment details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (client: any) => {
    setSelectedClient(client);
    setPaymentAmount(client.currentBalance || 10000);
    setPaymentMode('CASH');
    setReferenceNumber('');
    setPaymentNotes(`Settlement from ${client.shopName}`);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/payments/admin/record-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          retailerId: selectedClient.id,
          amount: paymentAmount,
          paymentMode,
          referenceNumber,
          notes: paymentNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      setSuccessMsg(data.message);
      setPaymentModalOpen(false);
      await fetchPayments();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const clients = paymentData?.clients || [];
  const filteredClients = clients.filter((c: any) => {
    const matchesSearch =
      c.shopName.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));

    const matchesCycle =
      cycleFilter === 'ALL' ||
      (cycleFilter === '15_DAYS' && c.overdueCycle === '15_DAYS') ||
      (cycleFilter === '30_DAYS' && c.overdueCycle === '30_DAYS_PLUS') ||
      (cycleFilter === 'CURRENT' && c.overdueCycle === 'CURRENT');

    return matchesSearch && matchesCycle;
  });

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F4C81] uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4" />
              <span>Wholesale Accounts &amp; Settlements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Payment Details &amp; Account Statements
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitor retail pharmacy credit limits, track 15-day / 30-day payment cycles, and record manual Cash/Cheque payments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Account Report</span>
            </button>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0B3860] text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Back to Admin Hub
            </Link>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-r-xl font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)}>
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}

        {/* 4 Financial KPI Summary Cards (Light Cyan Boxes) */}
        {paymentData?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Total Outstanding Balance
              </div>
              <div className="text-2xl font-black text-amber-900 mt-1">
                ₹{paymentData.summary.totalOutstandingDebt?.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Pending payments across pharmacies</div>
            </div>

            <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Total Credit Sanctioned
              </div>
              <div className="text-2xl font-black text-[#0F4C81] mt-1">
                ₹{paymentData.summary.totalCreditSanctioned?.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Authorized wholesale limits</div>
            </div>

            <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                15-Day Payment Cycle
              </div>
              <div className="text-2xl font-black text-[#0F4C81] mt-1">
                {paymentData.summary.due15DaysCount} Pharmacies
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Regular credit cycle due</div>
            </div>

            <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-2xl p-5 shadow-xs">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                30-Day Payment Cycle
              </div>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {paymentData.summary.critical30DaysCount} Pharmacies
              </div>
              <div className="text-[10px] text-rose-600 font-semibold mt-1">Settlement reminder advised</div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-[#DFF3FF]/40 border border-[#BEE3F8] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search pharmacy name, owner, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto text-xs">
            {[
              { id: 'ALL', label: 'All Accounts' },
              { id: 'CURRENT', label: 'Current' },
              { id: '15_DAYS', label: '15-Day Cycle' },
              { id: '30_DAYS', label: '30-Day Cycle' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCycleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  cycleFilter === tab.id
                    ? 'bg-[#0F4C81] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Retailers Payment Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Retail Pharmacy Credit Accounts ({filteredClients.length})
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500">
              Loading wholesale payment accounts...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500">
              No pharmacy accounts match the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DFF3FF]/60 text-slate-800 uppercase tracking-wider text-[10px] font-bold border-b border-cyan-200">
                  <tr>
                    <th className="py-3 px-4">Pharmacy &amp; Owner</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Credit Limit (₹)</th>
                    <th className="py-3 px-4">Outstanding Balance (₹)</th>
                    <th className="py-3 px-4">Available Credit (₹)</th>
                    <th className="py-3 px-4">Credit Cycle</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client: any) => (
                    <tr key={client.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{client.shopName}</div>
                        <div className="text-[11px] text-slate-500">
                          {client.ownerName} • DL: {client.dlNumber || 'Pending'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {client.phone}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{client.creditLimit?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-black text-amber-900">
                        ₹{client.currentBalance?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        ₹{client.availableCredit?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {client.overdueCycle === '30_DAYS_PLUS' ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> 30-Day Cycle
                          </span>
                        ) : client.overdueCycle === '15_DAYS' ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3 text-amber-600" /> 15-Day Cycle
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Current
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenPayment(client)}
                          className="bg-[#0F4C81] hover:bg-[#0B3860] text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition"
                        >
                          Record Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Record Manual Payment Modal */}
        {paymentModalOpen && selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0F4C81]" />
                  <h3 className="font-black text-sm text-slate-900">
                    Record Payment Transaction
                  </h3>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Client summary box */}
              <div className="bg-[#DFF3FF]/50 border border-[#BEE3F8] rounded-xl p-3 text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">{selectedClient.shopName}</div>
                <div className="text-slate-600">Owner: {selectedClient.ownerName}</div>
                <div className="flex justify-between font-bold pt-1 border-t border-cyan-200">
                  <span className="text-slate-600">Current Outstanding:</span>
                  <span className="text-amber-900">₹{selectedClient.currentBalance?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Amount (₹):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method:</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800"
                  >
                    <option value="CASH">Cash Payment (Depot Counter)</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="NEFT_RTGS">Bank RTGS / NEFT Transfer</option>
                    <option value="UPI">UPI / QR Code Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Reference / Cheque Number / UTR:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ-409211 or UTR-2026-ERD"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes / Description:</label>
                  <textarea
                    rows={2}
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-[#0F4C81] hover:bg-[#0B3860] text-white rounded-xl font-bold transition shadow-sm"
                  >
                    {submitting ? 'Recording Entry...' : 'Credit Account & Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
