'use client'

/**
 * POS Page — Point of Sale (FEAT06-POS)
 *
 * Full-screen POS: product grid (left) + cart panel (right)
 * Features: category filter, search, cart management, discount,
 *           payment modal (cash/QR/card), daily summary.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Banknote, QrCode, X, Loader2,
  CheckCircle, ChevronDown, BarChart2,
} from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { key: 'CASH', label: 'เงินสด',    icon: Banknote  },
  { key: 'QR',   label: 'QR/โอน',   icon: QrCode    },
  { key: 'CARD', label: 'บัตร',      icon: CreditCard },
]

const formatTHB = (n) =>
  new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0)

// ─── Category color helper ────────────────────────────────────────────────────
const CAT_COLORS = ['bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-pink-100 text-pink-700']

function catColor(cat, idx) { return CAT_COLORS[idx % CAT_COLORS.length] }

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product, onAdd }) {
  const price = product.posPrice ?? product.basePrice
  return (
    <button
      onClick={() => onAdd(product)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all p-3 text-left flex flex-col gap-2 active:scale-95"
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover rounded-lg" />
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
          <ShoppingCart size={28} className="text-orange-300" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{product.name}</p>
        <p className="text-base font-bold text-orange-500 mt-0.5">฿{formatTHB(price)}</p>
      </div>
    </button>
  )
}

// ─── Cart Item ────────────────────────────────────────────────────────────────

function CartItem({ item, onQty, onRemove }) {
  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-gray-50">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-400">฿{formatTHB(item.unitPrice)} / ชิ้น</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onQty(item.id, item.qty - 1)}
          className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500"
        >
          <Minus size={10} />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-gray-900">{item.qty}</span>
        <button
          onClick={() => onQty(item.id, item.qty + 1)}
          className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500"
        >
          <Plus size={10} />
        </button>
      </div>
      <p className="text-sm font-semibold text-gray-900 w-16 text-right flex-shrink-0">
        ฿{formatTHB(item.unitPrice * item.qty - (item.discount ?? 0))}
      </p>
      <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-400 ml-1">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({ total, onConfirm, onClose, loading }) {
  const [method, setMethod]       = useState('CASH')
  const [cashInput, setCashInput] = useState('')

  const cashReceived = parseFloat(cashInput) || 0
  const change = method === 'CASH' ? Math.max(0, cashReceived - total) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold">ชำระเงิน</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Total */}
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">ยอดรวมทั้งหมด</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">฿{formatTHB(total)}</p>
          </div>

          {/* Method select */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">วิธีชำระ</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    method === key
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Cash change calculator */}
          {method === 'CASH' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">รับเงินมา</label>
              <input
                type="number"
                value={cashInput}
                onChange={e => setCashInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-right text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {cashReceived >= total && (
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-green-700">เงินทอน</span>
                  <span className="text-lg font-bold text-green-600">฿{formatTHB(change)}</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => onConfirm({ method, cashReceived: cashReceived || undefined })}
            disabled={loading || (method === 'CASH' && cashInput && cashReceived < total)}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            ยืนยันชำระเงิน
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Order Success Toast ──────────────────────────────────────────────────────

function SuccessToast({ orderId, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 animate-slide-up">
      <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-gray-900">ชำระเงินสำเร็จ!</p>
        <p className="text-xs text-gray-500">{orderId}</p>
      </div>
    </div>
  )
}

// ─── Main POS Page ─────────────────────────────────────────────────────────────

export default function POSPage() {
  // Products
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [search,     setSearch]     = useState('')
  const [prodLoading, setProdLoading] = useState(true)

  // Cart
  const [cart,       setCart]       = useState([]) // [{id, productId, name, unitPrice, qty, discount}]
  const [discount,   setDiscount]   = useState(0)

  // UI state
  const [showPayment,  setShowPayment]  = useState(false)
  const [paying,       setPaying]       = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)

  // Search debounce
  const searchTimer = useRef(null)

  // ─── VAT config (from tenant config — hardcode 7% for now) ─────────────────
  const VAT_RATE = 7
  const VAT_INCLUDED = true

  // ─── Derived cart totals ──────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + (i.unitPrice * i.qty - (i.discount ?? 0)), 0)
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const vatAmount = VAT_INCLUDED
    ? discountedSubtotal * VAT_RATE / (100 + VAT_RATE)
    : discountedSubtotal * VAT_RATE / 100
  const total = VAT_INCLUDED ? discountedSubtotal : discountedSubtotal + vatAmount

  // ─── Fetch products ───────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (cat, q) => {
    setProdLoading(true)
    try {
      const params = new URLSearchParams({ isPosVisible: 'true', limit: '100' })
      if (cat) params.set('category', cat)
      if (q)   params.set('search', q)
      const res = await fetch(`/api/products?${params}`)
      const json = await res.json()
      if (res.ok) setProducts(json.data.products ?? [])
    } catch (err) {
      console.error('[POS] products error', err)
    } finally {
      setProdLoading(false)
    }
  }, [])

  // Fetch categories once
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/products?categories=1')
        const json = await res.json()
        if (res.ok) setCategories(json.data ?? [])
      } catch {}
    }
    loadCats()
    fetchProducts(null, null)
  }, [fetchProducts])

  // ─── Cart handlers ────────────────────────────────────────────────────────
  function addToCart(product) {
    const price = product.posPrice ?? product.basePrice
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, {
        id:        crypto.randomUUID(),
        productId: product.id,
        name:      product.name,
        unitPrice: price,
        qty:       1,
        discount:  0,
      }]
    })
  }

  function updateQty(itemId, newQty) {
    if (newQty <= 0) {
      setCart(prev => prev.filter(i => i.id !== itemId))
    } else {
      setCart(prev => prev.map(i => i.id === itemId ? { ...i, qty: newQty } : i))
    }
  }

  function removeItem(itemId) {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  function clearCart() {
    setCart([])
    setDiscount(0)
  }

  // ─── Search debounce ──────────────────────────────────────────────────────
  function handleSearch(val) {
    setSearch(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetchProducts(activeCategory, val), 300)
  }

  function handleCategory(cat) {
    setActiveCategory(cat)
    fetchProducts(cat, search)
  }

  // ─── Payment ──────────────────────────────────────────────────────────────
  async function handlePay({ method, cashReceived }) {
    setPaying(true)
    try {
      // 1. Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderType: 'TAKEAWAY',
          items: cart.map(i => ({
            productId: i.productId,
            name:      i.name,
            unitPrice: i.unitPrice,
            qty:       i.qty,
            discount:  i.discount ?? 0,
          })),
          discountAmount: discount,
          vatRate: VAT_RATE,
          vatIncluded: VAT_INCLUDED,
        }),
      })
      const orderJson = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderJson.error ?? 'สร้าง order ไม่ได้')

      // 2. Process payment
      const payRes = await fetch(`/api/orders/${orderJson.data.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, cashReceived }),
      })
      const payJson = await payRes.json()
      if (!payRes.ok) throw new Error(payJson.error ?? 'ชำระเงินไม่ได้')

      setShowPayment(false)
      setSuccessOrder(payJson.data.orderId)
      clearCart()
    } catch (err) {
      alert(err.message)
    } finally {
      setPaying(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-gray-50">

      {/* ── LEFT: Product Browser ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
            <BarChart2 size={14} />
            ยอดวันนี้
          </button>
        </div>

        {/* Category pills */}
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex gap-2 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => handleCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              !activeCategory ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ทั้งหมด
          </button>
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {prodLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 animate-pulse">
                  <div className="h-24 bg-gray-100 rounded-lg mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <ShoppingCart size={40} className="mb-2 opacity-30" />
              <p className="text-sm">ไม่พบสินค้า</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart Panel ── */}
      <div className="w-80 xl:w-96 bg-white border-l border-gray-100 flex flex-col flex-shrink-0">

        {/* Cart header */}
        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-orange-500" />
            <span className="text-sm font-semibold text-gray-900">
              ตะกร้า {cart.length > 0 && <span className="text-orange-500">({cart.reduce((s, i) => s + i.qty, 0)})</span>}
            </span>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1">
              <Trash2 size={11} /> ล้าง
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-300">
              <ShoppingCart size={32} className="mb-2" />
              <p className="text-sm">เพิ่มสินค้าเพื่อเริ่มออเดอร์</p>
            </div>
          ) : (
            cart.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onQty={updateQty}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {/* Discount row */}
        {cart.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 flex-shrink-0">ส่วนลดท้ายบิล</span>
              <input
                type="number"
                value={discount || ''}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="flex-1 text-right text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <span className="text-xs text-gray-500">฿</span>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>ยอดรวม</span>
            <span>฿{formatTHB(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>ส่วนลด</span>
              <span>-฿{formatTHB(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>VAT 7% (รวม)</span>
            <span>฿{formatTHB(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
            <span>รวมทั้งสิ้น</span>
            <span className="text-orange-600">฿{formatTHB(total)}</span>
          </div>
        </div>

        {/* Pay button */}
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl font-bold text-base transition-colors"
          >
            ชำระเงิน
          </button>
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          total={total}
          loading={paying}
          onConfirm={handlePay}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Success toast */}
      {successOrder && (
        <SuccessToast orderId={successOrder} onClose={() => setSuccessOrder(null)} />
      )}
    </div>
  )
}
