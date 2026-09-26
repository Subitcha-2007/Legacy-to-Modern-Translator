import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, MapPin, Phone, Mail, Award, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-smm-navy text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wholesale Features Highlights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-smm-blue flex items-center justify-center text-smm-mint shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Daily Erode Fleet</h4>
              <p className="text-xs text-slate-400">Same-day delivery across Erode, Perundurai &amp; Bhavani</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-smm-blue flex items-center justify-center text-smm-mint shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">100% Genuine Pharma</h4>
              <p className="text-xs text-slate-400">Direct from Cipla, Sun Pharma, GSK &amp; Abbott</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-smm-blue flex items-center justify-center text-smm-mint shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">DL 20B/21B Compliant</h4>
              <p className="text-xs text-slate-400">Licensed wholesale distributor with batch tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-smm-blue flex items-center justify-center text-smm-mint shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Payment Details &amp; Credit</h4>
              <p className="text-xs text-slate-400">15 to 30 days flexible credit cycle for retail shops</p>
            </div>
          </div>
        </div>

        {/* Detailed Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand & SMM Badge */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-smm-blue rounded-xl flex items-center justify-center border border-smm-mint/50">
                <span className="text-white font-black text-lg">SMM</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">Sakthimurugan</h3>
                <span className="text-smm-mint font-semibold text-xs">Medical Agencies</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Wholesale pharmaceutical supplier providing genuine formulations, syrups, tablets, and medical essentials to 500+ licensed retail pharmacies across Erode district.
            </p>
            <div className="mt-4 text-[11px] text-slate-400 font-mono space-y-1">
              <div>DL No: TN-ERD-20B-00129 / 21B-00130</div>
              <div>GSTIN: 33AAACS1234M1Z8</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Wholesale Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-smm-mint transition">Tablet &amp; Capsule Catalog</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-smm-mint transition">Bulk Order Cart</Link>
              </li>
              <li>
                <Link href="/retailer/orders" className="hover:text-smm-mint transition">Retailer Tax Invoices</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-smm-mint transition">Retailer KYC Onboarding</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-smm-mint transition">Agency Staff / Admin Login</Link>
              </li>
            </ul>
          </div>

          {/* Delivery Network */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Erode Fleet Routes</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Erode Central &amp; Railway Feeder</li>
              <li>• Perundurai Industrial &amp; Town Route</li>
              <li>• Bhavani &amp; Kooduthurai Corridor</li>
              <li>• Gobichettipalayam Agro Hub</li>
              <li>• Sathyamangalam &amp; Anthiyur Dispatch</li>
              <li>• Kodumudi &amp; Modakkurichi Route</li>
            </ul>
          </div>

          {/* Contact Depot */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Wholesale Depot</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-smm-mint shrink-0 mt-0.5" />
                <span>No. 45, Nethaji Road, Wholesale Market Complex, Erode - 638001, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-smm-mint shrink-0" />
                <span>+91 94433 12345 / 0424-2256789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-smm-mint shrink-0" />
                <span>orders@sakthimurugan.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="border-t border-slate-800/80 pt-6 text-center text-xs text-slate-400">
          <p>© Sakthimurugan Medical Agencies, Erode. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
