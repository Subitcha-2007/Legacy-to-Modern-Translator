'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart, Product } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Layers,
  Calendar,
  Building,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
  const [unitTypes, setUnitTypes] = useState<{ [productId: number]: 'BOX' | 'STRIP' }>({});
  const [notification, setNotification] = useState<string | null>(null);

  const { addToCart, items } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCompany, stockFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCompany !== 'ALL') params.append('companyName', selectedCompany);
      if (stockFilter !== 'ALL') params.append('stockStatus', stockFilter);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const getQty = (productId: number) => quantities[productId] || 1;
  const getUnit = (productId: number) => unitTypes[productId] || 'BOX';

  const handleQtyChange = (productId: number, delta: number) => {
    const current = getQty(productId);
    const updated = Math.max(1, current + delta);
    setQuantities(prev => ({ ...prev, [productId]: updated }));
  };

  const setDirectQty = (productId: number, val: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, val) }));
  };

  const handleUnitToggle = (productId: number, unit: 'BOX' | 'STRIP') => {
    setUnitTypes(prev => ({ ...prev, [productId]: unit }));
  };

  const handleAdd = (product: Product) => {
    const qty = getQty(product.id);
    const unit = getUnit(product.id);
    addToCart(product, qty, unit);

    setNotification(`Added ${qty} ${unit.toLowerCase()}(s) of ${product.brandName} to cart`);
    setTimeout(() => setNotification(null), 3000);
  };

  const companies = [
    'ALL',
    'Micro Labs Limited',
    'GlaxoSmithKline (GSK)',
    'Alkem Laboratories Ltd',
    'Cipla Ltd',
    'USV Private Limited',
    'Glenmark Pharmaceuticals',
    'Abbott Healthcare',
    'Torrent Pharmaceuticals',
    'Pfizer Ltd'
  ];

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F4C81] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-cyan-300">
          <CheckCircle2 className="w-5 h-5 text-cyan-300" />
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Hero Wholesale Section with Pure Colors & Light Cyan Highlights */}
      <section className="bg-white border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#DFF3FF] border border-[#BEE3F8] text-[#0F4C81] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#0F4C81]" />
              Direct Wholesale Stockist • Erode District, Tamil Nadu
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Wholesale Medical Supply for <br />
              <span className="text-[#0F4C81]">
                Retail Pharmacies in Erode
              </span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              Sakthimurugan Medical Agencies (SMM) is a premier wholesale pharmaceutical distributor serving licensed retail pharmacies across Erode, Perundurai, Bhavani, and Gobichettipalayam. Direct manufacturer rates, batch-verified supplies, and dedicated delivery fleet vans.
            </p>

            {/* 4 Trust Metric Cards in Light Cyan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#DFF3FF] rounded-xl p-3.5 border border-[#BEE3F8]">
                <div className="text-xl sm:text-2xl font-black text-[#0F4C81]">500+</div>
                <div className="text-xs text-slate-600 font-medium">Pharmacies in Erode</div>
              </div>
              <div className="bg-[#DFF3FF] rounded-xl p-3.5 border border-[#BEE3F8]">
                <div className="text-xl sm:text-2xl font-black text-[#0F4C81]">Daily</div>
                <div className="text-xs text-slate-600 font-medium">Fleet Van Dispatch</div>
              </div>
              <div className="bg-[#DFF3FF] rounded-xl p-3.5 border border-[#BEE3F8]">
                <div className="text-xl sm:text-2xl font-black text-[#0F4C81]">15-30 D</div>
                <div className="text-xs text-slate-600 font-medium">Credit Account Cycle</div>
              </div>
              <div className="bg-[#DFF3FF] rounded-xl p-3.5 border border-[#BEE3F8]">
                <div className="text-xl sm:text-2xl font-black text-[#0F4C81]">100%</div>
                <div className="text-xs text-slate-600 font-medium">Genuine Formulations</div>
              </div>
            </div>
          </div>

          {/* Quick Action Card in Light Cyan / White */}
          <div className="lg:col-span-4 bg-[#DFF3FF]/60 rounded-2xl p-6 border border-[#BEE3F8] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F4C81] text-white flex items-center justify-center font-black text-xs">
                  SMM
                </div>
                <span className="font-bold text-sm text-[#0F4C81]">Wholesale Portal</span>
              </div>
              <span className="text-[10px] font-bold bg-[#0F4C81] text-white px-2 py-0.5 rounded-full uppercase">
                B2B Erode
              </span>
            </div>

            {user?.role === 'RETAILER' ? (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="text-slate-500">Logged in Medical Shop:</div>
                  <div className="font-bold text-slate-900 text-sm">{user.shopName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">DL: {user.dlNumber || 'Verified'}</div>
                </div>

                <div className="bg-white border border-[#BEE3F8] p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Approved Credit Limit:</span>
                    <span className="font-bold text-slate-900">₹{user.creditLimit?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>Outstanding Balance:</span>
                    <span className="font-bold text-amber-700">₹{user.currentBalance?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#0F4C81] font-bold border-t border-slate-100 pt-1 text-sm">
                    <span>Available Credit:</span>
                    <span>₹{Math.max(0, (user.creditLimit || 0) - (user.currentBalance || 0)).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link
                    href="/cart"
                    className="flex-1 bg-[#0F4C81] hover:bg-[#0B3860] text-white text-center py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Cart ({items.length})</span>
                  </Link>
                  <Link
                    href="/retailer/orders"
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-800 text-center py-2.5 rounded-xl font-bold text-xs border border-slate-300 transition"
                  >
                    Invoices &rarr;
                  </Link>
                </div>
              </div>
            ) : user?.role === 'ADMIN' ? (
              <div className="space-y-3">
                <div className="bg-white border border-slate-200 p-3 rounded-xl text-xs">
                  <div className="font-bold text-[#0F4C81] text-sm">Wholesale Admin Console</div>
                  <p className="text-slate-600 mt-1">Review retailer approvals, manage delivery routes, and update inventory stock.</p>
                </div>
                <Link
                  href="/admin/dashboard"
                  className="w-full bg-[#0F4C81] hover:bg-[#0B3860] text-white text-center py-2.5 rounded-xl font-bold text-xs transition block shadow-sm"
                >
                  Open Admin Hub
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you a licensed retail medical shop in Erode district? Register with your 20B/21B Drug License to access wholesale pricing and Credit Account billing.
                </p>
                <div className="space-y-2">
                  <Link
                    href="/register"
                    className="w-full bg-[#0F4C81] hover:bg-[#0B3860] text-white text-center py-2.5 rounded-xl font-bold text-xs transition block shadow-sm"
                  >
                    Register Retail Medical Shop
                  </Link>
                  <Link
                    href="/login"
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 text-center py-2.5 rounded-xl font-bold text-xs border border-slate-300 transition block"
                  >
                    Existing Shop Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Search & Filter Header Bar */}
        <div className="bg-[#DFF3FF]/50 rounded-2xl border border-[#BEE3F8] p-5 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Live Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tablet brand (Dolo, Augmentin), generic composition, or manufacturer..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] transition"
              />
            </div>

            {/* Manufacturer Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                <option value="ALL">All Pharma Companies</option>
                {companies.filter(c => c !== 'ALL').map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>

            {/* Stock Availability Filter */}
            <div className="md:col-span-3">
              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="in_stock">In Stock (&gt;20 Boxes)</option>
                <option value="low_stock">Low Stock (&le;20 Boxes)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Quick Generic Filter Chips */}
          <div className="flex items-center gap-2 pt-2 border-t border-cyan-200 overflow-x-auto text-xs pb-1">
            <span className="text-slate-500 font-semibold shrink-0 text-[11px]">Popular Formulations:</span>
            {['Paracetamol', 'Amoxicillin', 'Pantoprazole', 'Azithromycin', 'Metformin', 'Telmisartan', 'Vitamin C'].map(chip => (
              <button
                key={chip}
                onClick={() => setSearch(chip)}
                className={`px-3 py-1 rounded-full border text-[11px] transition shrink-0 ${
                  search === chip
                    ? 'bg-[#0F4C81] text-white border-[#0F4C81] font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                {chip}
              </button>
            ))}
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-red-600 text-xs font-semibold ml-2 hover:underline shrink-0"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Product Catalog Grid Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Wholesale Medicine Catalog</h2>
            <span className="bg-[#DFF3FF] text-[#0F4C81] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#BEE3F8]">
              {products.length} Products
            </span>
          </div>
          <span className="text-xs text-slate-500">Pharma GST 12% included • Direct from Manufacturer</span>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#0F4C81] border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading Sakthimurugan wholesale catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No medicines found matching criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting &quot;All Pharma Companies&quot;.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCompany('ALL'); setStockFilter('ALL'); }}
              className="mt-4 bg-[#0F4C81] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => {
              const qty = getQty(product.id);
              const unit = getUnit(product.id);
              const isBox = unit === 'BOX';
              const currentPrice = isBox ? product.pricePerBox : product.pricePerStrip;
              const isOutOfStock = product.stockQuantity === 0;
              const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 20;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-[#BEE3F8] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Image & Status */}
                  <div className="relative h-40 bg-slate-50 border-b border-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
                      alt={product.brandName}
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      {isOutOfStock ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          Low Stock ({product.stockQuantity} boxes)
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          In Stock ({product.stockQuantity} boxes)
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-white/90 text-[10px] font-mono px-2 py-0.5 rounded text-slate-700 shadow-xs">
                      Exp: {product.expiryDate}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">
                        {product.companyName}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                        {product.brandName}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {product.genericName}
                      </p>

                      <div className="mt-2 text-[10px] text-slate-500 font-mono">
                        Batch: {product.batchNumber} • HSN: {product.hsnCode || '3004'}
                      </div>
                    </div>

                    {/* Unit Toggle and Price Display */}
                    <div className="bg-[#DFF3FF]/50 p-2.5 rounded-xl border border-[#BEE3F8] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => handleUnitToggle(product.id, 'BOX')}
                            className={`px-2 py-0.5 rounded-md transition ${
                              isBox ? 'bg-[#0F4C81] text-white' : 'text-slate-600 hover:text-[#0F4C81]'
                            }`}
                          >
                            Box (10x)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUnitToggle(product.id, 'STRIP')}
                            className={`px-2 py-0.5 rounded-md transition ${
                              !isBox ? 'bg-[#0F4C81] text-white' : 'text-slate-600 hover:text-[#0F4C81]'
                            }`}
                          >
                            Strip
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-[#0F4C81]">
                            ₹{currentPrice?.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            per {unit.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Quantity Stepper & Add Button */}
                    <div className="space-y-2 pt-1">
                      {isBox && (
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className="text-slate-400 font-semibold">Bulk:</span>
                          {[5, 10, 25, 50].map(tier => (
                            <button
                              key={tier}
                              onClick={() => setDirectQty(product.id, tier)}
                              className={`px-1.5 py-0.5 rounded border transition font-bold ${
                                qty === tier
                                  ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              +{tier}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                          <button
                            onClick={() => handleQtyChange(product.id, -1)}
                            disabled={qty <= 1}
                            className="p-1.5 hover:bg-slate-100 text-slate-700 disabled:opacity-30 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 font-bold text-xs text-slate-900 min-w-[24px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQtyChange(product.id, 1)}
                            className="p-1.5 hover:bg-slate-100 text-slate-700 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={() => handleAdd(product)}
                          disabled={isOutOfStock}
                          className="flex-1 bg-[#0F4C81] hover:bg-[#0B3860] disabled:bg-slate-300 text-white font-bold py-2 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logistics & Fleet Delivery Section (Light Cyan Boxes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-[#DFF3FF] rounded-3xl p-8 sm:p-10 border border-[#BEE3F8] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white text-[#0F4C81] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#BEE3F8]">
                <Truck className="w-4 h-4 text-[#0F4C81]" />
                Dedicated SMM Logistics Fleet
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Daily Scheduled Wholesale Delivery Across Erode District
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sakthimurugan Medical Agencies operates our own wholesale delivery vans. Morning orders confirmed before 11:30 AM are dispatched on same-day afternoon routes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                <div className="bg-white border border-[#BEE3F8] p-3 rounded-xl">
                  <div className="font-bold text-[#0F4C81]">Route 1: Erode Central</div>
                  <div className="text-slate-500 mt-0.5">Gandhiji Rd, Nethaji Rd, Marapalam, Railway Feeder</div>
                </div>
                <div className="bg-white border border-[#BEE3F8] p-3 rounded-xl">
                  <div className="font-bold text-[#0F4C81]">Route 2: Perundurai Corridor</div>
                  <div className="text-slate-500 mt-0.5">SIPCOT, RS Road, Vijayamangalam, Chennimalai</div>
                </div>
                <div className="bg-white border border-[#BEE3F8] p-3 rounded-xl">
                  <div className="font-bold text-[#0F4C81]">Route 3: Bhavani &amp; Kooduthurai</div>
                  <div className="text-slate-500 mt-0.5">Bhavani Main, Kooduthurai, Komarapalayam border</div>
                </div>
                <div className="bg-white border border-[#BEE3F8] p-3 rounded-xl">
                  <div className="font-bold text-[#0F4C81]">Route 4: Gobi &amp; Sathy Belt</div>
                  <div className="text-slate-500 mt-0.5">Gobichettipalayam, Sathyamangalam, Anthiyur</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-[#BEE3F8] p-6 rounded-2xl space-y-4 shadow-sm">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0F4C81]" />
                Payment Details &amp; Credit Account
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eligible retail pharmacies receive an interest-free 15-day or 30-day wholesale credit cycle. Track your invoices, live balances, and record payments directly via our portal.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="w-full bg-[#0F4C81] hover:bg-[#0B3860] text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Apply for Wholesale Credit Line</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
