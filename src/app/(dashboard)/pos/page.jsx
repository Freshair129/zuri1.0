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
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-gray-50">

      {/* LEFT: Product browser */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* POS toolbar */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          {/* TODO: search products */}
          <div className="flex-1 h-9 bg-gray-100 rounded-lg flex items-center px-3 gap-2">
            <div className="h-4 w-4 bg-gray-300 rounded-sm" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
          {/* TODO: barcode scan button */}
          <div className="h-9 w-9 bg-gray-100 rounded-lg" />
          {/* TODO: new order / open orders dropdown */}
          <div className="h-9 w-28 bg-orange-100 rounded-lg" />
        </div>

        {/* Category tabs */}
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {/* TODO: ProductTile component — image, name, price, stock badge */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <button
                key={i}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-left hover:border-orange-300 hover:shadow-md transition-all active:scale-95"
              >
                {/* Product image placeholder */}
                <div className="h-20 bg-orange-50 rounded-lg mb-2" />
                <div className="h-3.5 w-3/4 bg-gray-200 rounded mb-1.5" />
                <div className="flex items-center justify-between">
                  <div className="h-4 w-12 bg-orange-100 rounded" />
                  {/* Stock indicator */}
                  <div className="h-3 w-8 bg-green-100 rounded" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart & payment panel */}
      <div className="w-80 xl:w-96 flex flex-col bg-white border-l border-gray-100 shadow-sm">

        {/* Cart header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Current Order</h2>
          {/* TODO: clear cart button */}
          <div className="h-6 w-16 bg-red-50 rounded text-xs text-red-400" />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* TODO: map over cartItems, render CartRow component */}
          {cartItems.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-2">
                <div className="h-12 w-12 bg-gray-100 rounded-full mx-auto" />
                <p className="text-sm text-gray-400">Cart is empty</p>
                <p className="text-xs text-gray-300">Tap a product to add it</p>
              </div>
            </div>
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
                {/* Qty stepper */}
                <div className="flex items-center gap-1">
                  <div className="h-6 w-6 bg-gray-100 rounded" />
                  <div className="h-4 w-6 bg-gray-200 rounded text-center" />
                  <div className="h-6 w-6 bg-gray-100 rounded" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* TODO: Discount / promo code row */}
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gray-50 border border-dashed border-gray-200 rounded-lg" />
            <div className="h-8 w-16 bg-gray-100 rounded-lg" />
          </div>
        </div>

        {/* Order summary */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-1.5">
          {['Subtotal', 'Discount', 'Tax (7%)'].map((label) => (
            <div key={label} className="flex justify-between text-sm text-gray-500">
              <span>{label}</span>
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
          ))}
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-orange-600">฿{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-2">Payment method</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  paymentMethod === m
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Charge button */}
        <div className="p-4 border-t border-gray-100">
          {/* TODO: processPayment() on click */}
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors text-base">
            Charge ฿{cartTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
