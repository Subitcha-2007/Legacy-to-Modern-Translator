'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import {
  Building2,
  FileText,
  Upload,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Clock
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { fetchDemoUsers } = useAuth();

  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dlNumber: '',
    gstNumber: '',
    bankAccount: '',
    bankIfsc: '',
    address: '',
    pincode: '638001',
    termsAccepted: false
  });

  const [dlFile, setDlFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<any | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept Sakthimurugan Medical Agencies Wholesale Terms & Conditions.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        data.append(key, String(val));
      });

      if (dlFile) data.append('dlDocument', dlFile);
      if (gstFile) data.append('gstDocument', gstFile);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: data
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Registration failed. Please check your details.');
      }

      // Refresh demo switcher so newly registered retailer immediately appears in the switcher!
      await fetchDemoUsers();

      setSuccessResponse(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successResponse) {
    return (
      <div className="bg-white min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-16 h-16 bg-[#DFF3FF] text-[#0F4C81] rounded-full mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Status: Waiting for Admin Approval
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Registration Submitted Successfully!
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Your account for <span className="font-bold text-slate-900">{successResponse.user.shopName}</span> is waiting for admin approval.
            </p>
          </div>

          <div className="bg-[#DFF3FF]/50 border border-[#BEE3F8] rounded-xl p-5 text-left text-xs space-y-2 text-slate-700">
            <div className="flex items-center gap-2 font-bold text-[#0F4C81] pb-1 border-b border-cyan-200">
              <Clock className="w-4 h-4 text-[#0F4C81]" />
              <span>Wholesale Onboarding Next Steps:</span>
            </div>
            <p>1. Our compliance team at Erode Central Depot will verify your Drug License <strong>{successResponse.user.dlNumber}</strong> against Form 20B/21B statutory records.</p>
            <p>2. Upon approval, your initial wholesale credit limit (₹50,000 - ₹2,00,000) will be activated for Credit Account purchases.</p>
            <p>3. Notice: Your medical shop is now live in the database and visible in the Demo Switcher in the top bar for testing!</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/login"
              className="flex-1 bg-[#0F4C81] hover:bg-[#0B3860] text-white font-bold py-3 rounded-xl text-xs transition shadow-sm"
            >
              Go to Sign In
            </Link>
            <Link
              href="/"
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-xs border border-slate-300 transition"
            >
              Browse Medicine Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#0F4C81] text-white p-8 sm:p-10 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white text-[#0F4C81] rounded-xl flex items-center justify-center font-black text-xl shadow-xs">
              SMM
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Retail Pharmacy KYC Onboarding</h1>
              <p className="text-xs text-cyan-200 font-semibold">Sakthimurugan Medical Agencies • Erode Wholesale Division</p>
            </div>
          </div>
          <p className="text-xs text-cyan-100 max-w-2xl leading-relaxed">
            Licensed wholesale supplier for retail chemists, druggists, and nursing homes across Erode district. Please submit your statutory Drug License and GST details for approval.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8 text-xs">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 text-xs text-red-800 font-bold">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Medical Shop Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <Building2 className="w-4 h-4 text-[#0F4C81]" />
              1. Medical Shop &amp; Proprietor Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Retail Medical Shop Name *
                </label>
                <input
                  type="text"
                  name="shopName"
                  required
                  value={formData.shopName}
                  onChange={handleChange}
                  placeholder="e.g. Bhavani Sri Krishna Medicals"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Owner / Pharmacist Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="e.g. M. Anand, B.Pharm"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="pharmacystore@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone / Mobile Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98427 00000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Drug License & GST */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <FileText className="w-4 h-4 text-[#0F4C81]" />
              2. Statutory Drug License &amp; GST Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Drug License Number (20B / 21B) *
                </label>
                <input
                  type="text"
                  name="dlNumber"
                  required
                  value={formData.dlNumber}
                  onChange={handleChange}
                  placeholder="TN-ERD-20B-12345 / 21B-12346"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  GSTIN (Pharma Wholesale Tax ID):
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="33AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Drug License (Form 20B/21B PDF / Image):
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setDlFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  GST Certificate / Bank Proof:
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setGstFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank Details for Credit Account Reconciliation */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <CreditCard className="w-4 h-4 text-[#0F4C81]" />
              3. Bank Details for Account Reconciliation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Account Number:</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  placeholder="50100234981123"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank IFSC Code:</label>
                <input
                  type="text"
                  name="bankIfsc"
                  value={formData.bankIfsc}
                  onChange={handleChange}
                  placeholder="HDFC0001248"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address in Erode District */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <Building2 className="w-4 h-4 text-[#0F4C81]" />
              4. Pharmacy Physical Address (Delivery Fleet Destination)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Shop Street Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 88, Kooduthurai Main Road, Bhavani"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="638301"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Portal Password */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="w-4 h-4 text-[#0F4C81]" />
              5. Portal Security Credentials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="bg-[#DFF3FF]/50 border border-[#BEE3F8] p-4 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-0.5 text-[#0F4C81]"
              />
              <span className="text-[11px] text-slate-700 leading-relaxed">
                I hereby declare that the Drug License, GSTIN, and retail shop details provided are genuine and valid under the Drugs and Cosmetics Act. I agree to the wholesale supply terms, batch verification standards, and the 15/30-day Credit Account payment settlement rules of <strong>Sakthimurugan Medical Agencies, Erode</strong>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F4C81] hover:bg-[#0B3860] disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <span>Submitting Application to SMM Server...</span>
            ) : (
              <>
                <span>Submit Retailer KYC Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
