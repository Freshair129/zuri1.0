'use client';

// POS — PremiumPOS standalone point-of-sale
// Full-screen POS interface: product grid, cart, payment processing.
// Intended for culinary school retail / canteen / ingredient sales.

import { useState } from 'react';

const CATEGORIES = ['All', 'Food & Bev', 'Ingredients', 'Equipment', 'Merchandise', 'Course Fees'];
const PAYMENT_METHODS = ['Cash', 'Card', 'QR / E-Wallet', 'Invoice'];

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Card');

  // TODO: fetch products from /api/pos/products
  // TODO: addToCart, removeFromCart, adjustQty handlers
  // TODO: applyDiscount / promo code
  // TODO: processPayment → open payment gateway / cash drawer

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-surface">

      {/* LEFT: Product browser */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* POS toolbar */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/15 px-4 py-3 flex items-center gap-3">
          {/* TODO: search products */}
          <div className="flex-1 h-9 bg-surface-container-low rounded-lg flex items-center px-3 gap-2 border border-outline-variant/15">
            <div className="h-4 w-4 text-outline flex items-center justify-center material-symbols-outlined text-sm">search</div>
            <div className="h-4 w-32 bg-outline-variant/30 rounded" />
          </div>
          {/* TODO: barcode scan button */}
          <div className="h-9 w-9 bg-surface-container-high rounded-lg flex items-center justify-center text-secondary border border-outline-variant/15"><span className="material-symbols-outlined text-sm">barcode_scanner</span></div>
          {/* TODO: new order / open orders dropdown */}
          <div className="h-9 w-28 gold-gradient rounded-lg shadow-sm" />
        </div>

        {/* Category tabs */}
        <div className="bg-surface-container-lowest border-b border-outline-variant/15 px-6 py-3 flex gap-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-label text-xs uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? 'gold-gradient text-on-primary shadow-md'
                  : 'bg-surface-container-low text-secondary hover:bg-surface-container hover:text-primary shadow-sm border border-outline-variant/15'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {/* TODO: ProductTile component — image, name, price, stock badge */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <button
                key={i}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-4 text-left hover:border-primary/50 hover:shadow-floating transition-all active:scale-95 group"
              >
                {/* Product image placeholder */}
                <div className="aspect-square bg-surface-container-low rounded-xl mb-3 flex items-center justify-center text-outline-variant/30 group-hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined text-4xl">fastfood</span>
                </div>
                <div className="h-3 w-3/4 bg-outline-variant/40 rounded mb-2" />
                <div className="flex items-center justify-between">
                  <div className="h-4 w-12 bg-primary/20 rounded font-label text-xs text-primary flex items-center justify-center font-bold">฿120</div>
                  {/* Stock indicator */}
                  <div className="h-3 w-8 bg-secondary/20 rounded" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart & payment panel */}
      <div className="w-[340px] xl:w-[400px] flex flex-col bg-surface-container-lowest border-l border-outline-variant/15 shadow-[0_0_40px_rgba(16,24,40,0.04)] z-10">

        {/* Cart header */}
        <div className="px-6 py-5 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low/50">
          <h2 className="font-headline font-bold text-on-surface text-lg">Current Order</h2>
          {/* TODO: clear cart button */}
          <button className="px-3 py-1 bg-error/10 hover:bg-error/20 rounded text-[10px] font-label font-bold tracking-widest uppercase text-error transition-colors">Clear</button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar">
          {/* TODO: map over cartItems, render CartRow component */}
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">shopping_basket</span>
              <p className="font-label text-sm uppercase tracking-widest text-secondary font-bold">Cart is empty</p>
              <p className="font-body text-xs text-secondary mt-1">Tap a product to add it</p>
            </div>
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/15">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex-shrink-0 flex items-center justify-center text-primary/50"><span className="material-symbols-outlined">fastfood</span></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-on-surface/10 rounded" />
                  <div className="h-3 w-16 bg-on-surface/5 rounded" />
                </div>
                {/* Qty stepper */}
                <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-outline-variant/15">
                  <div className="h-6 w-6 bg-surface-container-high rounded flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-[1rem]">remove</span></div>
                  <div className="h-4 w-6 font-label text-xs text-center font-bold text-on-surface">1</div>
                  <div className="h-6 w-6 bg-surface-container-high rounded flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-[1rem]">add</span></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TODO: Discount / promo code row */}
        <div className="px-6 py-4 border-t border-outline-variant/15 bg-surface-container-low/50">
          <div className="flex gap-2 relative group">
            <input placeholder="Add promo code" className="flex-1 px-3 py-2 text-sm font-body bg-surface border border-dashed border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
            <button className="px-4 bg-inverse-surface hover:bg-on-surface text-white rounded-lg font-label text-[10px] uppercase tracking-widest font-bold transition-colors">Apply</button>
          </div>
        </div>

        {/* Order summary */}
        <div className="px-6 py-5 border-t border-outline-variant/15 space-y-3 bg-surface-container-lowest">
          {['Subtotal', 'Discount', 'Tax (7%)'].map((label) => (
            <div key={label} className="flex justify-between font-body text-sm text-secondary">
              <span>{label}</span>
              <div className="h-4 w-16 bg-outline-variant/30 rounded" />
            </div>
          ))}
          <div className="flex justify-between font-headline text-lg font-bold text-on-surface pt-4 border-t border-outline-variant/20">
            <span>Total</span>
            <span className="text-primary tracking-tight">฿{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="px-6 py-4 border-t border-outline-variant/15 bg-surface-container-low/30">
          <p className="font-label uppercase text-[10px] tracking-widest text-secondary font-bold mb-3">Payment method</p>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-3 rounded-lg text-xs font-label uppercase tracking-wider font-bold border transition-all ${
                  paymentMethod === m
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-outline-variant/30 text-secondary hover:bg-surface-container-low hover:border-outline-variant/50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Charge button */}
        <div className="p-6 border-t border-outline-variant/15 bg-surface-container-lowest">
          {/* TODO: processPayment() on click */}
          <button className="w-full gold-gradient hover:shadow-[0_8px_20px_rgba(121,89,0,0.3)] hover:scale-[1.02] active:scale-[0.98] text-[#0B2D5E] font-label font-bold tracking-widest py-4 rounded-xl transition-all text-sm uppercase">
            Charge ฿{cartTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
