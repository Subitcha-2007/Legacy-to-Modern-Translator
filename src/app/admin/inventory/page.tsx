'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/context/CartContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  ArrowLeft,
  X,
  RefreshCw,
  Building,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    brandName: '',
    genericName: '',
    companyName: 'Cipla Ltd',
    description: '',
    pricePerBox: 500,
    pricePerStrip: 50,
    stockQuantity: 100,
    batchNumber: 'SMM-BT-1001',
    expiryDate: '12/2027',
    hsnCode: '3004',
    gstRate: 12,
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      brandName: '',
      genericName: '',
      companyName: 'Cipla Ltd',
      description: '',
      pricePerBox: 500,
      pricePerStrip: 50,
      stockQuantity: 100,
      batchNumber: `SMM-BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: '12/2027',
      hsnCode: '3004',
      gstRate: 12,
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      brandName: p.brandName,
      genericName: p.genericName,
      companyName: p.companyName,
      description: p.description,
      pricePerBox: p.pricePerBox,
      pricePerStrip: p.pricePerStrip,
      stockQuantity: p.stockQuantity,
      batchNumber: p.batchNumber,
      expiryDate: p.expiryDate,
      hsnCode: p.hsnCode || '3004',
      gstRate: p.gstRate || 12,
      imageUrl: p.imageUrl || ''
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this medicine from wholesale inventory?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActionMsg('Product removed from wholesale catalog.');
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const body = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        body.append(k, String(v));
      });
      if (imageFile) {
        body.append('image', imageFile);
      }

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      setActionMsg(data.message || 'Product saved successfully.');
      setModalOpen(false);
      fetchProducts();
      setTimeout(() => setActionMsg(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.brandName.toLowerCase().includes(search.toLowerCase()) ||
    p.genericName.toLowerCase().includes(search.toLowerCase()) ||
    p.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen py-10 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0F4C81] uppercase tracking-wider mb-1">
              <Link href="/admin/dashboard" className="hover:underline flex items-center gap-1 text-slate-500">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span>/ Inventory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Wholesale Medicine Stock &amp; Inventory Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Maintain wholesale tablet stock counts, batch numbers, expiry dates, and distributor box/strip prices.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-[#0F4C81] hover:bg-[#0B3860] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>

        {actionMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionMsg}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-emerald-700">Dismiss</button>
          </div>
        )}

        {/* Search & Overview Bar */}
        <div className="bg-[#DFF3FF]/40 border border-[#BEE3F8] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by brand, generic, or manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 shadow-2xs"
            />
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-4">
            <span>Total Wholesale Items: <strong>{products.length}</strong></span>
            <span>Low Stock: <strong className="text-amber-700">{products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 20).length}</strong></span>
            <span>Out of Stock: <strong className="text-rose-600">{products.filter(p => p.stockQuantity === 0).length}</strong></span>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500">
              Loading wholesale inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500">
              No products found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#DFF3FF]/60 text-slate-800 uppercase tracking-wider text-[10px] font-bold border-b border-cyan-200">
                  <tr>
                    <th className="py-3 px-4">Brand &amp; Composition</th>
                    <th className="py-3 px-4">Manufacturer</th>
                    <th className="py-3 px-4">Batch / Exp</th>
                    <th className="py-3 px-4 text-right">Box Rate (₹)</th>
                    <th className="py-3 px-4 text-right">Strip Rate (₹)</th>
                    <th className="py-3 px-4 text-center">Available Stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((product) => {
                    const isOutOfStock = product.stockQuantity === 0;
                    const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 20;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{product.brandName}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{product.genericName}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {product.companyName}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          <div>{product.batchNumber}</div>
                          <div className="text-slate-400">Exp: {product.expiryDate}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-[#0F4C81]">
                          ₹{product.pricePerBox?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-700">
                          ₹{product.pricePerStrip?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isOutOfStock ? (
                            <span className="bg-rose-100 text-rose-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
                              0 (Out of Stock)
                            </span>
                          ) : isLowStock ? (
                            <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
                              {product.stockQuantity} boxes (Low)
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
                              {product.stockQuantity} boxes
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-1.5 hover:bg-[#DFF3FF] text-[#0F4C81] rounded-lg transition"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0F4C81]" />
                  <h3 className="font-black text-sm text-slate-900">
                    {editingProduct ? 'Edit Medicine Line' : 'Add New Medicine Line'}
                  </h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dolo 650 Tablet"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Generic Composition:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol 650 mg"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Manufacturing Company:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Micro Labs Limited"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Stock (Boxes):</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Box Price (₹):</label>
                    <input
                      type="number"
                      step={0.5}
                      required
                      value={formData.pricePerBox}
                      onChange={(e) => setFormData({ ...formData, pricePerBox: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Strip Price (₹):</label>
                    <input
                      type="number"
                      step={0.5}
                      required
                      value={formData.pricePerStrip}
                      onChange={(e) => setFormData({ ...formData, pricePerStrip: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batch Number:</label>
                    <input
                      type="text"
                      required
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expiry Date:</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YYYY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Description &amp; Dosage:</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Image URL / Upload:</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-xs mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-500"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-[#0F4C81] hover:bg-[#0B3860] text-white rounded-xl font-bold transition shadow-sm"
                  >
                    {actionLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
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
