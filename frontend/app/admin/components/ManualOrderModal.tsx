'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Search, Plus, Minus, Trash2, ShoppingBag, User, Phone,
  MapPin, MessageSquare, CreditCard, CheckCircle, Loader2, AlertCircle,
} from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface Product {
  id: number;
  title: string;
  price: string | number;
  main_image_url: string;
  stock: number;
  sku?: string;
  brand?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: { order_number: string; id: number }) => void;
}

export default function ManualOrderModal({ isOpen, onClose, onOrderCreated }: ManualOrderModalProps) {
  const { isDark } = useAdminTheme();
  const [step, setStep] = useState<1 | 2>(1);

  // Product search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Customer form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Doha');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Paid'>('COD');
  const [notes, setNotes] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ order_number: string; id: number } | null>(null);

  // Shipping config
  const [shippingFee, setShippingFee] = useState(15);
  const [freeThreshold, setFreeThreshold] = useState(49);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('griva_admin_token') || '';
    fetch(`${API_BASE}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          setShippingFee(parseFloat(data.settings.shippingFee) || 15);
          setFreeThreshold(parseFloat(data.settings.freeShippingThreshold) || 49);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const token = localStorage.getItem('griva_admin_token') || '';
      const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(q)}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || data.data || []);
        setShowDropdown(true);
      }
    } catch {}
    setSearching(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current && !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSearchQuery('');
      setSearchResults([]);
      setShowDropdown(false);
      setCartItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setAddress('');
      setCity('Doha');
      setPaymentMethod('COD');
      setNotes('');
      setError('');
      setSuccess(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  const addProduct = (product: Product) => {
    const price = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
    setCartItems(prev => {
      const existing = prev.find(ci => ci.product.id === product.id);
      if (existing) {
        return prev.map(ci =>
          ci.product.id === product.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: price }];
    });
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  const updateQty = (productId: number, delta: number) => {
    setCartItems(prev =>
      prev
        .map(ci => ci.product.id === productId ? { ...ci, quantity: ci.quantity + delta } : ci)
        .filter(ci => ci.quantity > 0)
    );
  };

  const removeItem = (productId: number) => {
    setCartItems(prev => prev.filter(ci => ci.product.id !== productId));
  };

  const subtotal = cartItems.reduce((sum, ci) => sum + ci.unitPrice * ci.quantity, 0);
  const shipping = subtotal > 0 && subtotal < freeThreshold ? shippingFee : 0;
  const total = subtotal + shipping;

  const handleSubmit = async () => {
    setError('');
    if (!customerName.trim()) { setError('Customer name is required.'); return; }
    if (!address.trim()) { setError('Delivery address is required.'); return; }
    if (cartItems.length === 0) { setError('Add at least one product.'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('griva_admin_token') || '';
      const res = await fetch(`${API_BASE}/orders/admin/manual-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim() || null,
          customer_email: customerEmail.trim() || null,
          shipping_address: address.trim(),
          city: city.trim() || 'Doha',
          payment_method: paymentMethod,
          notes: notes.trim() || null,
          items: cartItems.map(ci => ({ product_id: ci.product.id, quantity: ci.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create order.'); setSubmitting(false); return; }
      setSuccess(data.order);
      onOrderCreated(data.order);
    } catch {
      setError('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const inputClass = `w-full text-xs font-semibold px-3 py-2.5 border rounded-xl outline-none transition-all ${
    isDark
      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-orange-500'
      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:bg-white'
  }`;
  const labelClass = `block text-[10px] font-black uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!submitting ? onClose : undefined} />
      <div className={`relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
      }`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className={`text-sm font-black ${isDark ? 'text-zinc-100' : 'text-gray-800'}`}>Create Manual Order</h2>
              <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>WhatsApp / Instagram / Phone orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <button onClick={() => setStep(1)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${step === 1 ? 'bg-orange-500 text-white shadow-md' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}>
              <ShoppingBag className="h-3 w-3" /> Products
            </button>
            <div className={`w-4 h-px ${isDark ? 'bg-zinc-700' : 'bg-gray-200'}`} />
            <button onClick={() => cartItems.length > 0 && setStep(2)} disabled={cartItems.length === 0} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40 ${step === 2 ? 'bg-orange-500 text-white shadow-md' : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-gray-100 text-gray-500 hover:text-gray-700'}`}>
              <User className="h-3 w-3" /> Customer
            </button>
          </div>
          <button onClick={onClose} disabled={submitting} className={`p-2 rounded-xl transition-colors cursor-pointer ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-400'}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className={`text-base font-black ${isDark ? 'text-zinc-100' : 'text-gray-800'}`}>Order Created! 🎉</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                Order number: <span className="font-black text-orange-500">{success.order_number}</span>
              </p>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>Added to your orders list with "pending" status.</p>
            </div>
            <button onClick={onClose} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer">Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">

              {/* STEP 1 — Products */}
              {step === 1 && (
                <div className="p-5 space-y-4">
                  <div>
                    <label className={labelClass}>Search &amp; Add Products</label>
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} />
                      {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500 animate-spin" />}
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="Type product name to search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        className={`${inputClass} pl-9`}
                      />
                      {showDropdown && searchResults.length > 0 && (
                        <div ref={dropdownRef} className={`absolute top-full mt-1 left-0 right-0 rounded-xl border shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'}`}>
                          {searchResults.map(product => {
                            const price = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
                            const inCart = cartItems.some(ci => ci.product.id === product.id);
                            return (
                              <button key={product.id} type="button" onClick={() => addProduct(product)} className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${isDark ? 'hover:bg-zinc-700 border-b border-zinc-700 last:border-0' : 'hover:bg-orange-50 border-b border-gray-50 last:border-0'}`}>
                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                                  {product.main_image_url
                                    ? <img src={product.main_image_url} alt={product.title} className="w-full h-full object-contain" />
                                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag className="h-4 w-4" /></div>
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-[11px] font-bold truncate ${isDark ? 'text-zinc-100' : 'text-gray-800'}`}>{product.title}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black text-orange-500">QAR {price.toFixed(2)}</span>
                                    <span className={`text-[9px] font-semibold ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
                                  </div>
                                </div>
                                {inCart
                                  ? <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex-shrink-0">In cart</span>
                                  : <Plus className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                }
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {showDropdown && !searching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                        <div ref={dropdownRef} className={`absolute top-full mt-1 left-0 right-0 rounded-xl border shadow-xl z-50 px-4 py-3 text-xs text-center ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-white border-gray-200 text-gray-400'}`}>
                          No products found for &quot;{searchQuery}&quot;
                        </div>
                      )}
                    </div>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed ${isDark ? 'border-zinc-700 text-zinc-600' : 'border-gray-200 text-gray-300'}`}>
                      <ShoppingBag className="h-8 w-8" />
                      <p className="text-xs font-semibold">No products added yet</p>
                      <p className="text-[10px]">Search and select products above</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className={labelClass}>Order Items ({cartItems.length})</label>
                      {cartItems.map(ci => (
                        <div key={ci.product.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                            {ci.product.main_image_url
                              ? <img src={ci.product.main_image_url} alt={ci.product.title} className="w-full h-full object-contain" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag className="h-4 w-4" /></div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-bold truncate ${isDark ? 'text-zinc-100' : 'text-gray-800'}`}>{ci.product.title}</p>
                            <p className="text-[10px] font-black text-orange-500">
                              QAR {(ci.unitPrice * ci.quantity).toFixed(2)}
                              <span className={`ml-1 font-semibold ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>× {ci.quantity} @ QAR {ci.unitPrice.toFixed(2)}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button type="button" onClick={() => updateQty(ci.product.id, -1)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}><Minus className="h-3 w-3" /></button>
                            <span className={`w-6 text-center text-xs font-black ${isDark ? 'text-zinc-100' : 'text-gray-800'}`}>{ci.quantity}</span>
                            <button type="button" onClick={() => updateQty(ci.product.id, 1)} disabled={ci.quantity >= ci.product.stock} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 ${isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}><Plus className="h-3 w-3" /></button>
                            <button type="button" onClick={() => removeItem(ci.product.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer ml-1"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                      <div className={`rounded-xl border p-3 space-y-1.5 mt-2 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-orange-50 border-orange-100'}`}>
                        <div className={`flex justify-between text-[11px] ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}><span className="font-semibold">Subtotal</span><span className="font-bold">QAR {subtotal.toFixed(2)}</span></div>
                        <div className={`flex justify-between text-[11px] ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}><span className="font-semibold">Shipping {subtotal >= freeThreshold ? '(Free)' : ''}</span><span className="font-bold">{shipping > 0 ? `QAR ${shipping.toFixed(2)}` : 'FREE'}</span></div>
                        <div className={`flex justify-between text-xs border-t pt-1.5 ${isDark ? 'border-zinc-700 text-zinc-100' : 'border-orange-200 text-gray-800'}`}><span className="font-black">Total</span><span className="font-black text-orange-500">QAR {total.toFixed(2)}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2 — Customer */}
              {step === 2 && (
                <div className="p-5 space-y-4">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}><User className="h-3 w-3" /> Customer Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="e.g. Ahmed Al-Rashid" value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}><span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" /> Phone</span></label>
                        <input type="tel" placeholder="+974 5555 1234" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>Email (optional)</label>
                        <input type="email" placeholder="customer@example.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}><MapPin className="h-3 w-3" /> Delivery Address</p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Street / Area / Building <span className="text-red-500">*</span></label>
                        <textarea placeholder="e.g. Building 12, Al Sadd Street, Al Sadd" value={address} onChange={e => setAddress(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                      </div>
                      <div>
                        <label className={labelClass}>City</label>
                        <input type="text" placeholder="Doha" value={city} onChange={e => setCity(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}><span className="flex items-center gap-1"><CreditCard className="h-2.5 w-2.5" /> Payment Method</span></label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['COD', 'Paid'] as const).map(method => (
                          <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`py-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${paymentMethod === method ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md' : isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-orange-500/40' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                            {method === 'COD' ? '💵 COD' : '✅ Paid'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}><span className="flex items-center gap-1"><MessageSquare className="h-2.5 w-2.5" /> Notes (optional)</span></label>
                      <textarea placeholder="Delivery notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
                    </div>
                  </div>

                  <div className={`rounded-xl border p-3 space-y-1 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-orange-50 border-orange-100'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Order Summary</p>
                    {cartItems.map(ci => (
                      <div key={ci.product.id} className={`flex justify-between text-[11px] ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
                        <span className="truncate max-w-[60%]">{ci.product.title} × {ci.quantity}</span>
                        <span className="font-bold">QAR {(ci.unitPrice * ci.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className={`flex justify-between text-xs border-t pt-1.5 mt-1 ${isDark ? 'border-zinc-700 text-zinc-100' : 'border-orange-200 text-gray-800'}`}>
                      <span className="font-black">Total {shipping > 0 ? `(+ QAR ${shipping.toFixed(2)} shipping)` : '(Free shipping)'}</span>
                      <span className="font-black text-orange-500">QAR {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <p className="text-[11px] font-semibold text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between px-5 py-4 border-t gap-3 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-gray-50'}`}>
              <button type="button" onClick={onClose} disabled={submitting} className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${isDark ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                Cancel
              </button>
              {step === 1 ? (
                <button type="button" disabled={cartItems.length === 0} onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  Next: Customer Details <User className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setStep(1)} disabled={submitting} className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 ${isDark ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                    ← Back
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-60">
                    {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating Order...</> : <><CheckCircle className="h-3.5 w-3.5" /> Create Order</>}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
