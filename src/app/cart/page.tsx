'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, totalBoxesCount } = useCart();
  const { user, token, refreshUser } = useAuth();

  const [deliveryType, setDeliveryType] = useState<'DOOR_DELIVERY' | 'STORE_PICKUP'>('DOOR_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH' | 'CREDIT_ACCOUNT'>('CREDIT_ACCOUNT');
  const [dispatchRoute, setDispatchRoute] = useState('Erode Central Delivery Fleet');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '124, Gandhiji Road, Near Railway Station, Erode - 638002');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Credit calculation
  const approvedLimit = Number(user?.creditLimit || 0);
  const currentDebt = Number(user?.currentBalance || 0);
  const availableCredit = Math.max(0, approvedLimit - currentDebt);
  const creditExceeded = paymentMethod === 'CREDIT_ACCOUNT' && (currentDebt + totalAmount > approvedLimit);
  const projectedBalanceAfter = currentDebt + totalAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'ADMIN') {
      setError('You are currently signed in as Wholesale Admin. Please switch to an Approved Retailer account (via Demo Switcher) to place wholesale orders.');
      return;
    }

    if (!user.isApproved) {
      setError('Your retail shop account is waiting for admin approval. Bulk order placement will be unlocked once approved.');
      return;
    }

    if (creditExceeded) {
      setError(`Cannot place order on Credit Account: Order total ₹${totalAmount.toLocaleString('en-IN')} exceeds your available credit of ₹${availableCredit.toLocaleString('en-IN')}. Outstanding balance is ₹${currentDebt.toLocaleString('en-IN')} out of ₹${approvedLimit.toLocaleString('en-IN')}. Please choose Online Payment or Cash on Delivery.`);
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitType: i.unitType
        })),
        deliveryType,
        deliveryAddress: deliveryType === 'DOOR_DELIVERY' ? deliveryAddress : 'SMM Wholesale Central Depot, Erode',
        dispatchRoute: deliveryType === 'DOOR_DELIVERY' ? dispatchRoute : 'Counter Self-Pickup',
        paymentMethod,
        notes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place wholesale order.');
      }

      clearCart();
      await refreshUser();
      setOrderSuccess(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-[#DFF3FF] text-[#0F4C81] rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0F4C81] bg-[#DFF3FF] border border-[#BEE3F8] px-3 py-1 rounded-full uppercase tracking-wider">
              Invoice #{orderSuccess.invoiceNumber}
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Wholesale Order Placed Successfully!
            </h2>
            <p className="text-sm text-slate-600">
              Your wholesale order has been recorded in the database and dispatched to Sakthimurugan Medical Agencies fulfillment hub.
            </p>
          </div>

          <div className="bg-[#DFF3FF]/50 border border-[#BEE3F8] rounded-xl p-5 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-cyan-200 pb-2">
              <span className="text-slate-600 font-semibold">Total Invoice Amount:</span>
              <span className="font-extrabold text-[#0F4C81] text-sm">₹{orderSuccess.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-b border-cyan-200 pb-2">
              <span className="text-slate-600 font-semibold">Delivery Method:</span>
              <span className="font-bold text-slate-800">
                {orderSuccess.deliveryType === 'DOOR_DELIVERY' ? 'Local Erode Door Delivery' : 'Counter Self-Pickup'}
              </span>
            </div>
            <div className="flex justify-between border-b border-cyan-200 pb-2">
              <span className="text-slate-600 font-semibold">Fleet Route:</span>
              <span className="font-bold text-[#0F4C81]">{orderSuccess.dispatchRoute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">Payment Method:</span>
              <span className="font-bold text-slate-800">
                {orderSuccess.paymentMethod === 'CREDIT_ACCOUNT' ? 'Credit Account' : orderSuccess.paymentMethod}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/retailer/orders"
              className="flex-1 bg-[#0F4C81] hover:bg-[#0B3860] text-white font-bold py-3 rounded-xl text-xs transition shadow-sm"
            >
              View Orders &amp; Download Invoice
            </Link>
            <Link
              href="/"
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-xs border border-slate-300 transition"
            >
              Continue Ordering
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-white min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[#DFF3FF] rounded-2xl flex items-center justify-center text-[#0F4C81] mx-auto mb-4 border border-[#BEE3F8]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Wholesale Cart is Empty</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Explore genuine medicines, tablets, and medical essentials from Sakthimurugan Medical Agencies to replenish your shop inventory.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 bg-[#0F4C81] hover:bg-[#0B3860] text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
        >
          <span>Browse Wholesale Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Wholesale Order Checkout
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify medicine quantities, choose delivery fleet options, and select payment terms.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">Cart Total</span>
            <div className="text-2xl font-black text-[#0F4C81]">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs rounded-r-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Checkout Validation Notice</div>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              <span>Selected Products ({items.length})</span>
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 transition"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const isStrip = item.unitType === 'STRIP';
                const unitPrice = isStrip ? item.product.pricePerStrip : item.product.pricePerBox;
                const lineTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.unitType}`}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#BEE3F8] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[#DFF3FF] border border-[#BEE3F8] flex items-center justify-center shrink-0 text-[#0F4C81] font-black text-xs">
                        {item.product.companyName.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.product.brandName}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.product.genericName}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                          <span>Batch: {item.product.batchNumber}</span>
                          <span>•</span>
                          <span>Exp: {item.product.expiryDate}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#0F4C81]">
                            {item.unitType === 'BOX' ? 'Whole Box' : 'Individual Strip'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.unitType, item.quantity - 1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-xs text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.unitType, item.quantity + 1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-right min-w-[90px]">
                        <div className="text-sm font-black text-slate-900">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ₹{unitPrice} / {item.unitType.toLowerCase()}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart(item.product.id, item.unitType)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick SMM Quality Guarantee Banner */}
            <div className="bg-[#DFF3FF] border border-[#BEE3F8] rounded-xl p-4 text-xs text-slate-700 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#0F4C81] shrink-0" />
              <div>
                <span className="font-bold text-[#0F4C81]">100% Genuine Wholesale Stock: </span>
                All consignments dispatched with licensed manufacturer test reports, GST invoice, and batch serial stickers.
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Options & Total */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Delivery &amp; Payment Options
            </h2>

            {/* Delivery Method Selector */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#0F4C81]" />
                1. Delivery Method
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryType('DOOR_DELIVERY')}
                  className={`p-3 rounded-xl border text-left transition ${
                    deliveryType === 'DOOR_DELIVERY'
                      ? 'border-[#0F4C81] bg-[#DFF3FF] ring-2 ring-[#0F4C81]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#0F4C81]" />
                    <span>Local Erode Door Delivery</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Free daily delivery van to your shop
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('STORE_PICKUP')}
                  className={`p-3 rounded-xl border text-left transition ${
                    deliveryType === 'STORE_PICKUP'
                      ? 'border-[#0F4C81] bg-[#DFF3FF] ring-2 ring-[#0F4C81]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#0F4C81]" />
                    <span>Counter Self-Pickup</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Collect from Erode Central Depot
                  </p>
                </button>
              </div>

              {deliveryType === 'DOOR_DELIVERY' && (
                <div className="mt-3 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dispatch Fleet Route:
                    </label>
                    <select
                      value={dispatchRoute}
                      onChange={(e) => setDispatchRoute(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                    >
                      <option value="Erode Central Delivery Fleet">Erode Central Delivery Fleet</option>
                      <option value="Perundurai & RS Road Route">Perundurai &amp; RS Road Route</option>
                      <option value="Bhavani & Kooduthurai Corridor">Bhavani &amp; Kooduthurai Corridor</option>
                      <option value="Gobichettipalayam Agro Corridor">Gobichettipalayam Agro Corridor</option>
                      <option value="Sathyamangalam Express Van">Sathyamangalam Express Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Delivery Address:
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Shop address in Erode"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#0F4C81]" />
                2. Select Payment Method
              </h3>

              <div className="space-y-2 text-xs">
                {/* Option 1: Credit Account */}
                <label
                  className={`block p-3 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'CREDIT_ACCOUNT'
                      ? 'border-[#0F4C81] bg-[#DFF3FF] ring-2 ring-[#0F4C81]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_ACCOUNT"
                      checked={paymentMethod === 'CREDIT_ACCOUNT'}
                      onChange={() => setPaymentMethod('CREDIT_ACCOUNT')}
                      className="mt-0.5 text-[#0F4C81]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Credit Account
                        </span>
                        <span className="text-[10px] font-bold bg-[#0F4C81] text-white px-2 py-0.5 rounded-full">
                          15-30 Days Cycle
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Charge directly to your approved wholesale credit account with Sakthimurugan Medical Agencies.
                      </p>

                      {/* Live Credit Verification Box */}
                      {user?.role === 'RETAILER' && (
                        <div className="mt-2.5 pt-2.5 border-t border-cyan-200 text-[11px] space-y-1">
                          <div className="flex justify-between text-slate-600">
                            <span>Approved Credit Limit:</span>
                            <span className="font-semibold text-slate-900">₹{approvedLimit.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Current Outstanding Balance:</span>
                            <span className="font-semibold text-amber-700">₹{currentDebt.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between font-bold text-[#0F4C81]">
                            <span>Available Credit:</span>
                            <span>₹{availableCredit.toLocaleString('en-IN')}</span>
                          </div>

                          {creditExceeded ? (
                            <div className="bg-red-100 text-red-800 font-bold p-2 rounded text-[11px] mt-2 flex items-start gap-1.5">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <div>
                                <div>Credit Limit Exceeded!</div>
                                <div className="font-normal text-[10px] mt-0.5">
                                  Order total ₹{totalAmount.toLocaleString('en-IN')} exceeds available credit ₹{availableCredit.toLocaleString('en-IN')}. Please choose Online Payment or Cash on Delivery.
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-700 font-medium">
                              Remaining credit after order: ₹{(availableCredit - totalAmount).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Option 2: Cash on Delivery / Counter Payment */}
                <label
                  className={`block p-3 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'CASH'
                      ? 'border-[#0F4C81] bg-[#DFF3FF] ring-2 ring-[#0F4C81]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH"
                      checked={paymentMethod === 'CASH'}
                      onChange={() => setPaymentMethod('CASH')}
                      className="mt-0.5 text-[#0F4C81]"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-[#0F4C81]" />
                        <span>Cash on Delivery / Counter Payment</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pay cash directly to SMM delivery driver upon receiving consignment with printed invoice.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option 3: Pay Online */}
                <label
                  className={`block p-3 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'ONLINE'
                      ? 'border-[#0F4C81] bg-[#DFF3FF] ring-2 ring-[#0F4C81]/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="mt-0.5 text-[#0F4C81]"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-[#0F4C81]" />
                        <span>Pay Online (UPI / Card / NEFT)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Instant payment confirmation via SMM wholesale gateway.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Wholesale Order Instructions */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Order Notes / Special Batch Instructions:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ensure latest 2027 batch expiry, deliver before 2 PM"
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
              />
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalBoxesCount} units):</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fleet Delivery &amp; Handling:</span>
                <span className="text-emerald-700 font-bold">FREE (Erode Route)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pharma GST (12% Included):</span>
                <span className="text-slate-500 font-mono">Inclusive</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 text-base pt-2 border-t border-slate-200">
                <span>Total Payable:</span>
                <span className="text-[#0F4C81]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit Checkout Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading || creditExceeded}
              className={`w-full font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md ${
                creditExceeded
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#0F4C81] hover:bg-[#0B3860] text-white'
              }`}
            >
              {loading ? (
                <span>Confirming Order with SMM Server...</span>
              ) : creditExceeded ? (
                <span>Credit Limit Exceeded - Switch Payment Method</span>
              ) : (
                <>
                  <span>Place Wholesale Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              By confirming, you acknowledge that orders are subject to Drug License verification and wholesale dispatch schedule from Erode Central Depot.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
