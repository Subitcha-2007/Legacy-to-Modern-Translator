'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Logo from '@/components/Logo';
import {
  ShoppingBag,
  Building2,
  Truck,
  FileText,
  Package,
  Layers,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Phone,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, demoUsers, switchDemoUser, fetchDemoUsers } = useAuth();
  const { totalBoxesCount } = useCart();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [refreshingDemo, setRefreshingDemo] = useState(false);

  const handleRefreshDemo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshingDemo(true);
    await fetchDemoUsers();
    setRefreshingDemo(false);
  };

  const handleSwitchUser = async (id: number) => {
    await switchDemoUser(id);
    setDemoMenuOpen(false);
  };

  const availableCredit = user?.role === 'RETAILER'
    ? Math.max(0, (user.creditLimit || 0) - (user.currentBalance || 0))
    : 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Wholesale Hotline & Logistics Notice Bar */}
      <div className="bg-[#0F4C81] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
              Erode Wholesale
            </span>
            <span className="text-cyan-100">
              Serving 500+ Licensed Retail Pharmacies across Erode, Perundurai, Bhavani &amp; Gobichettipalayam
            </span>
          </div>

          <div className="flex items-center gap-4 text-cyan-100">
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <Phone className="w-3.5 h-3.5 text-cyan-300" />
              <span>Wholesale Desk: +91 94433 12345</span>
            </div>

            {/* Real Database-Connected Demo Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="bg-[#0B3860] hover:bg-slate-900 text-xs px-3 py-1 rounded flex items-center gap-1.5 text-amber-300 font-semibold border border-amber-300/30 transition shadow-xs"
                title="Switch active user (Connected to PostgreSQL / Real DB)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Switcher (DB Connected)</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${demoMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Live Database Accounts
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {demoUsers.length} accounts loaded from PostgreSQL
                      </div>
                    </div>
                    <button
                      onClick={handleRefreshDemo}
                      disabled={refreshingDemo}
                      className="text-slate-400 hover:text-[#0F4C81] p-1 rounded transition"
                      title="Reload retailers from database"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${refreshingDemo ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {/* Admin section */}
                    {demoUsers.filter(u => u.role === 'ADMIN').map(adm => {
                      const isActive = user?.id === adm.id;
                      return (
                        <button
                          key={adm.id}
                          onClick={() => handleSwitchUser(adm.id)}
                          className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 transition flex items-center justify-between ${
                            isActive ? 'bg-[#DFF3FF]/50 border-l-4 border-[#0F4C81]' : ''
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Wholesale Admin</span>
                              {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C81]" />}
                            </div>
                            <div className="text-[11px] text-slate-500">Managing Director • Central Depot</div>
                          </div>
                          <span className="text-[10px] bg-blue-100 text-[#0F4C81] font-bold px-2 py-0.5 rounded-full">
                            ADMIN
                          </span>
                        </button>
                      );
                    })}

                    {/* Approved Retailers */}
                    <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Approved Retail Pharmacies
                    </div>
                    {demoUsers.filter(u => u.role === 'RETAILER' && u.isApproved).map(ret => {
                      const isActive = user?.id === ret.id;
                      return (
                        <button
                          key={ret.id}
                          onClick={() => handleSwitchUser(ret.id)}
                          className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 transition flex items-center justify-between ${
                            isActive ? 'bg-[#DFF3FF]/50 border-l-4 border-[#0F4C81]' : ''
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[#0F4C81] flex items-center gap-1.5">
                              <span>{ret.shopName}</span>
                              {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C81]" />}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Limit: ₹{ret.creditLimit.toLocaleString('en-IN')} • Bal: ₹{ret.currentBalance.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                            Approved
                          </span>
                        </button>
                      );
                    })}

                    {/* Pending Retailers */}
                    {demoUsers.some(u => u.role === 'RETAILER' && !u.isApproved) && (
                      <>
                        <div className="px-3.5 py-1.5 bg-amber-50 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          Pending KYC Approval
                        </div>
                        {demoUsers.filter(u => u.role === 'RETAILER' && !u.isApproved).map(ret => {
                          const isActive = user?.id === ret.id;
                          return (
                            <button
                              key={ret.id}
                              onClick={() => handleSwitchUser(ret.id)}
                              className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 transition flex items-center justify-between ${
                                isActive ? 'bg-amber-100/50 border-l-4 border-amber-600' : ''
                              }`}
                            >
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{ret.shopName}</span>
                                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                                </div>
                                <div className="text-[11px] text-amber-700">Waiting for Admin DL/GST Approval</div>
                              </div>
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> Pending
                              </span>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>

                  <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 text-center">
                    New registrations automatically appear in this list.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* SMM Brand Logo */}
          <Logo size="lg" />

          {/* Role-Based Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-[#DFF3FF]/40 transition"
            >
              Wholesale Catalog
            </Link>

            {user?.role === 'RETAILER' && (
              <>
                <Link
                  href="/retailer/orders"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-[#DFF3FF]/40 transition flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-[#0F4C81]" />
                  <span>Orders &amp; Invoices</span>
                </Link>

                <Link
                  href="/retailer/payments"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-[#DFF3FF]/40 transition flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-[#0F4C81]" />
                  <span>Payment Details</span>
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-[#DFF3FF]/40 transition flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-[#0F4C81]" />
                  <span>Admin Hub</span>
                </Link>

                <Link
                  href="/admin/inventory"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-[#DFF3FF]/40 transition flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4 text-[#0F4C81]" />
                  <span>Inventory</span>
                </Link>

                <Link
                  href="/admin/orders"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-[#DFF3FF]/40 transition flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-[#0F4C81]" />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/admin/payments"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-[#0F4C81] hover:bg-[#DFF3FF]/40 transition flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-[#0F4C81]" />
                  <span>Payment Details</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Live Credit Account Badge for Retailer */}
            {user && user.role === 'RETAILER' && (
              <Link
                href="/retailer/payments"
                className="hidden lg:flex items-center gap-2.5 bg-[#DFF3FF] border border-[#BEE3F8] px-3.5 py-1.5 rounded-lg hover:border-[#0F4C81] transition"
                title="View Credit Account & Outstanding Balance"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Credit Account</div>
                  <div className="text-xs font-bold text-[#0F4C81]">
                    ₹{availableCredit.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-600">avail</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 bg-[#DFF3FF] hover:bg-cyan-100 text-[#0F4C81] rounded-xl border border-[#BEE3F8] transition flex items-center gap-2"
              title="View Wholesale Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-bold text-xs">Cart</span>
              {totalBoxesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#0F4C81] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalBoxesCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login status */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user.shopName || user.ownerName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {user.role === 'ADMIN' ? 'Wholesale Administrator' : (user.isApproved ? 'Verified Retailer' : 'Pending Verification')}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-[#0F4C81] hover:bg-[#DFF3FF] rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold bg-[#0F4C81] text-white hover:bg-[#0B3860] rounded-lg shadow-sm transition"
                >
                  Register Shop
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
