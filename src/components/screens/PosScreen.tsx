import React, { useState } from 'react';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Clock, 
  Printer, 
  CheckCircle2, 
  X,
  Truck,
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import { Product, CartItem, Customer, TransactionOrder, PaymentMethod, DeliveryOrder } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

interface PosScreenProps {
  products: Product[];
  customers: Customer[];
  onCompleteTransaction: (order: TransactionOrder, delivery?: DeliveryOrder) => void;
  currentUser: { name: string };
  isMobileCompact?: boolean;
}

export const PosScreen: React.FC<PosScreenProps> = ({
  products,
  customers,
  onCompleteTransaction,
  currentUser,
  isMobileCompact = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[3]?.id || 'CUST-004'); // Default Pelanggan Umum
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [applyTax, setApplyTax] = useState<boolean>(true);
  const [deliveryNeeded, setDeliveryNeeded] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  
  // Checkout Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [tempoDays, setTempoDays] = useState<number>(30);
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Receipt Preview State
  const [completedOrder, setCompletedOrder] = useState<TransactionOrder | null>(null);

  const categories = ['ALL', 'Keramik & Granit', 'Sanitari & Faucet', 'Cat & Pelapis', 'Semen & Mortar', 'Pintu & Hardware', 'Baja Ringan & Atap'];

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[3];

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode.includes(searchQuery);
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Maksimal stok tercapai untuk ${product.name} (Tersedia: ${product.stock})`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1, discountPercent: 0 }];
      }
    });
  };

  // Adjust quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) {
            alert(`Stok hanya tersisa ${item.product.stock} ${item.product.unit}`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  // Remove item
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  // Barcode scanner simulator
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(p => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase());
    if (matched) {
      handleAddToCart(matched);
      setBarcodeInput('');
    } else {
      alert(`Barcode "${barcodeInput}" tidak terdaftar dalam database.`);
    }
  };

  // Financial calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = applyTax ? Math.round(afterDiscount * 0.11) : 0; // PPN 11%
  const grandTotal = afterDiscount + taxAmount;
  const changeAmount = paymentMethod === 'TUNAI' ? Math.max(0, cashGiven - grandTotal) : 0;

  // Open checkout modal
  const openPaymentModal = () => {
    if (cart.length === 0) return;
    setCashGiven(grandTotal);
    setIsPaymentModalOpen(true);
  };

  // Final checkout trigger
  const handleFinalCheckout = () => {
    if (paymentMethod === 'TUNAI' && cashGiven < grandTotal) {
      alert(`Uang tunai Rp ${cashGiven.toLocaleString('id-ID')} kurang dari total tagihan Rp ${grandTotal.toLocaleString('id-ID')}`);
      return;
    }

    if (paymentMethod === 'TEMPO') {
      const remainingLimit = selectedCustomer.creditLimit - selectedCustomer.usedCredit;
      if (grandTotal > remainingLimit) {
        alert(`Transaksi melebihi sisa limit kredit ${selectedCustomer.name} (Sisa: ${formatRupiah(remainingLimit)}). Perlu otorisasi Owner.`);
        return;
      }
    }

    const newOrder: TransactionOrder = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV/${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}${new Date().getDate()}/${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().slice(0, 5),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerType: selectedCustomer.type === 'PLATINUM' ? 'PARTNER' : selectedCustomer.type === 'GOLD' ? 'KONTRAKTOR' : 'UMUM',
      cashierName: currentUser.name,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        unit: item.product.unit,
        unitPrice: item.product.sellPrice,
        quantity: item.quantity,
        discount: item.discountPercent,
        subtotal: item.product.sellPrice * item.quantity,
      })),
      subtotal,
      discountTotal: discountAmount,
      taxAmount,
      grandTotal,
      paidAmount: paymentMethod === 'TUNAI' ? cashGiven : (paymentMethod === 'TEMPO' ? 0 : grandTotal),
      changeAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'TEMPO' ? 'BELUM_LUNAS' : 'LUNAS',
      dueDate: paymentMethod === 'TEMPO' 
        ? new Date(Date.now() + tempoDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        : undefined,
      deliveryNeeded,
      notes: paymentNotes || (deliveryNeeded ? 'Perlu kirim armada' : 'Bawa langsung'),
    };

    let newDelivery: DeliveryOrder | undefined = undefined;
    if (deliveryNeeded) {
      newDelivery = {
        id: `DEL-${Date.now().toString().slice(-6)}`,
        suratJalanNo: `SJ/${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}${new Date().getDate()}/${Math.floor(100 + Math.random() * 900)}`,
        orderId: newOrder.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        address: deliveryAddress || selectedCustomer.address,
        courierName: 'Belum Ditugaskan',
        courierPhone: '-',
        vehiclePlate: 'Armada Siap Muat',
        status: 'SIAP_KIRIM',
        itemsSummary: cart.map(i => `${i.quantity} ${i.product.unit} ${i.product.name}`).join(', '),
        notes: paymentNotes || 'Surat Jalan otomatis dari POS',
      };
    }

    onCompleteTransaction(newOrder, newDelivery);
    setCompletedOrder(newOrder);
    setIsPaymentModalOpen(false);
    setCart([]);
  };

  return (
    <div className={`h-full flex flex-col ${isMobileCompact ? 'p-2' : 'p-4 lg:p-6'} space-y-4 max-w-7xl mx-auto`}>
      
      {/* Top Header & Barcode simulation bar */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Point of Sale (Kasir Operasional)</span>
          </h1>
          <p className="text-xs text-slate-400">Scan barcode, kelola keranjang belanja, cetak faktur & opsi tempo</p>
        </div>

        {/* Barcode Quick Scanner Input */}
        <form onSubmit={handleBarcodeScan} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
              <Barcode className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan Barcode / SKU..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap shadow-xs transition-colors"
          >
            Scan Item
          </button>
        </form>
      </div>

      {/* Main Split View: Left Catalog (60%) | Right Cart (40%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
        
        {/* Left Side (Catalog & Filters): 7 cols on desktop */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          
          {/* Search & Category Pills */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-lg p-3 space-y-2.5 shadow-sm">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang, granit, cat, semen..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1 max-h-[580px]">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock <= product.minStock && product.stock > 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && handleAddToCart(product)}
                  className={`border rounded-lg p-3 bg-[#0e1422] flex flex-col justify-between transition-all group ${
                    isOutOfStock 
                      ? 'opacity-50 bg-slate-900/60 cursor-not-allowed border-slate-800' 
                      : 'cursor-pointer hover:border-amber-500/50 hover:shadow-xs border-slate-800'
                  }`}
                >
                  <div>
                    {/* Visual Fallback Product Banner */}
                    <div className="h-20 bg-slate-900/80 rounded-md border border-slate-800 mb-2 flex items-center justify-center text-slate-500 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
                      <Barcode className="w-7 h-7" />
                    </div>

                    <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
                      <span className="text-slate-400">{product.sku}</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold border ${
                        isOutOfStock 
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                          : isLowStock 
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        Stok: {product.stock}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white mt-1 line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold font-mono text-amber-300 tabular-nums">
                        {formatRupiah(product.sellPrice)}
                      </div>
                      <div className="text-[10px] text-slate-400">/{product.unit}</div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className={`p-1.5 rounded-md ${
                        isOutOfStock 
                          ? 'bg-slate-800 text-slate-600' 
                          : 'bg-slate-900 border border-slate-700 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400 text-slate-300 transition-colors'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side (Active Cart): 5 cols on desktop */}
        <div className="lg:col-span-5 bg-[#0e1422] border border-slate-800 rounded-lg flex flex-col shadow-sm overflow-hidden">
          
          {/* Cart Header & Customer Selector */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Keranjang Kasir ({cart.reduce((a, b) => a + b.quantity, 0)} Item)
              </span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Customer Dropdown */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-700 text-white rounded-md py-1.5 px-2 focus:border-amber-400 focus:outline-none"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.type}) {c.creditLimit > 0 ? `· Limit Sisa: ${formatRupiah(c.creditLimit - c.usedCredit)}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px]">
            {cart.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
                <ShoppingBag className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
                <p className="font-medium text-slate-300">Keranjang Masih Kosong</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Pilih produk di katalog atau scan barcode untuk transaksi</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="p-2 border border-slate-800 rounded-lg flex items-center justify-between gap-2 bg-slate-900/60">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">{item.product.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatRupiah(item.product.sellPrice)} x {item.quantity} {item.product.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    
                    <div className="w-20 text-right font-mono font-semibold text-xs text-amber-300 tabular-nums">
                      {formatRupiah(item.product.sellPrice * item.quantity)}
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Summary & Options */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-900/50 space-y-2.5">
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Subtotal Produk</span>
              <span className="font-mono tabular-nums text-white">{formatRupiah(subtotal)}</span>
            </div>

            {/* Discount & Tax Row */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Diskon:</span>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-white rounded text-xs text-center font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <span className="ml-1 text-slate-500 font-bold">%</span>
                </div>
              </div>

              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span>PPN 11% ({formatRupiah(taxAmount)})</span>
              </label>
            </div>

            {/* Delivery Needed Option */}
            <div className="pt-1 border-t border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={deliveryNeeded}
                  onChange={(e) => setDeliveryNeeded(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                <span>Perlu Pengiriman Armada (Buat Surat Jalan Otomatis)</span>
              </label>

              {deliveryNeeded && (
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={`Alamat Tujuan: ${selectedCustomer.address}`}
                  className="w-full mt-1.5 px-2 py-1 text-xs bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-md focus:outline-none focus:border-amber-400"
                />
              )}
            </div>

            {/* Grand Total */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">TOTAL TAGIHAN</span>
                <span className="text-lg font-bold font-mono text-amber-300 tabular-nums">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={openPaymentModal}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-slate-950" />
                <span>BAYAR (F9)</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Payment Modal (Tunai / QRIS / Tempo) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div>
                <h3 className="text-sm font-bold text-white">Metode Pembayaran Kasir</h3>
                <p className="text-xs text-slate-400">Pilih skema pembayaran untuk faktur ini</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Grand Total Display */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-center">
                <span className="text-xs text-slate-400">Total Yang Harus Dibayar</span>
                <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums mt-0.5">
                  {formatRupiah(grandTotal)}
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('TUNAI')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'TUNAI'
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 ring-1 ring-amber-400'
                      : 'border-slate-800 hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 ring-1 ring-amber-400'
                      : 'border-slate-800 hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS Instan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TEMPO')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'TEMPO'
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 ring-1 ring-amber-400'
                      : 'border-slate-800 hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Tempo / Kredit</span>
                </button>
              </div>

              {/* Tab 1: Tunai Details */}
              {paymentMethod === 'TUNAI' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nominal Uang Diterima
                    </label>
                    <input
                      type="number"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[grandTotal, 50000, 100000, 200000, 500000, 1000000, 2000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashGiven(val)}
                        className="px-2.5 py-1 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800"
                      >
                        {val === grandTotal ? 'Uang Pas' : formatRupiah(val)}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-300">Kembalian:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                      {formatRupiah(changeAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: QRIS Details */}
              {paymentMethod === 'QRIS' && (
                <div className="space-y-3 pt-2 text-center">
                  <div className="w-40 h-40 mx-auto p-2 bg-white rounded-lg flex flex-col items-center justify-center">
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-amber-300 rounded font-mono text-[10px] p-2 text-center border border-amber-500/40">
                      [QRIS STANDAR BI · DYNAMIC 000201]
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Scan via BCA Mobile, GoPay, OVO, ShopeePay, Livin
                  </div>
                  <button
                    type="button"
                    onClick={handleFinalCheckout}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pembayaran QRIS Berhasil</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Tempo / Kredit Details */}
              {paymentMethod === 'TEMPO' && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-amber-300 font-semibold">
                      <span>Pelanggan Terpilih:</span>
                      <span className="text-white">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-amber-400">
                      <span>Sisa Limit Kredit:</span>
                      <span className="font-mono font-bold">
                        {formatRupiah(selectedCustomer.creditLimit - selectedCustomer.usedCredit)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Termin Jatuh Tempo (Hari)
                    </label>
                    <select
                      value={tempoDays}
                      onChange={(e) => setTempoDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value={14} className="bg-slate-900 text-white">14 Hari</option>
                      <option value={30} className="bg-slate-900 text-white">30 Hari (Standar Kontraktor)</option>
                      <option value={60} className="bg-slate-900 text-white">60 Hari (Mitra Platinum)</option>
                      <option value={90} className="bg-slate-900 text-white">90 Hari</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Notes input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Catatan Faktur / Transaksi</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Misal: Proyek Cluster Bintaro, titip mandor..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-md focus:outline-none focus:border-amber-400"
                />
              </div>

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Batal
              </button>

              {paymentMethod !== 'QRIS' && (
                <button
                  type="button"
                  onClick={handleFinalCheckout}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  Selesaikan Transaksi (Enter)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <span className="text-xs font-bold text-white">Struk Transaksi Selesai</span>
              <button onClick={() => setCompletedOrder(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Print Receipt Simulation (Clean White Minimalist High Contrast) */}
            <div className="p-5 font-mono text-[11px] text-slate-900 space-y-3 bg-white">
              
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <div className="font-bold text-sm text-slate-950">PROPERTI ERP STORE</div>
                <div className="text-slate-700">BSD RAYA MEGA SHOWROOM</div>
                <div className="text-[10px] text-slate-500">Telp: 021-55667788 · NPWP: 01.234.567.8-012.000</div>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>No. Faktur:</span>
                  <span className="font-bold">{completedOrder.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{completedOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{completedOrder.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>{completedOrder.customerName}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="font-semibold text-slate-900 truncate">{item.productName}</div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>{item.quantity} {item.unit} x {formatNumber(item.unitPrice)}</span>
                      <span>{formatNumber(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(completedOrder.subtotal)}</span>
                </div>
                {completedOrder.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon:</span>
                    <span>-{formatRupiah(completedOrder.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PPN 11%:</span>
                  <span>{formatRupiah(completedOrder.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-950 text-sm pt-1 border-t border-slate-200">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(completedOrder.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Metode:</span>
                  <span className="font-bold">{completedOrder.paymentMethod}</span>
                </div>
                {completedOrder.paymentMethod === 'TUNAI' && (
                  <>
                    <div className="flex justify-between text-[11px]">
                      <span>Uang Diterima:</span>
                      <span>{formatRupiah(completedOrder.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(completedOrder.changeAmount)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
                Terima kasih atas kunjungan Anda.<br/>
                Barang yang sudah dibeli dapat ditukar max 7 hari dengan struk asli.
              </div>

            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Thermal 80mm</span>
              </button>

              <button
                onClick={() => setCompletedOrder(null)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold"
              >
                Selesai
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
