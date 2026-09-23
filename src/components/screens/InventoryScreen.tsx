import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Plus, 
  Edit3, 
  X, 
  Upload, 
  PackagePlus, 
  PackageMinus, 
  Barcode
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';

interface InventoryScreenProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onStockAdjustment: (productId: string, adjustmentAmount: number, type: 'IN' | 'OUT', reason: string) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onStockAdjustment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'LOW' | 'OUT' | 'NORMAL'>('ALL');
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Stock Adjustment Modal
  const [adjustmentProduct, setAdjustmentProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustReason, setAdjustReason] = useState<string>('Restock Supplier Rutin');

  // Form State for Drawer
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Keramik & Granit');
  const [formUnit, setFormUnit] = useState('Dus');
  const [formBuyPrice, setFormBuyPrice] = useState<number>(100000);
  const [formSellPrice, setFormSellPrice] = useState<number>(140000);
  const [formStock, setFormStock] = useState<number>(50);
  const [formMinStock, setFormMinStock] = useState<number>(20);
  const [formLocation, setFormLocation] = useState('Gudang A - Rak 1');
  const [formSupplier, setFormSupplier] = useState('PT Distributor Resmi');
  const [formDescription, setFormDescription] = useState('');

  const categories: ProductCategory[] = [
    'Keramik & Granit',
    'Sanitari & Faucet',
    'Cat & Pelapis',
    'Semen & Mortar',
    'Pintu & Hardware',
    'Baja Ringan & Atap',
  ];

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === 'LOW') matchesStatus = p.stock <= p.minStock && p.stock > 0;
    if (selectedStatus === 'OUT') matchesStatus = p.stock === 0;
    if (selectedStatus === 'NORMAL') matchesStatus = p.stock > p.minStock;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openAddDrawer = () => {
    setEditingProduct(null);
    setFormSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
    setFormBarcode(`89910012${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormCategory('Keramik & Granit');
    setFormUnit('Dus (1.44m²)');
    setFormBuyPrice(150000);
    setFormSellPrice(210000);
    setFormStock(50);
    setFormMinStock(20);
    setFormLocation('Gudang A - Lorong 2');
    setFormSupplier('PT Granit Indah Perkasa');
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setFormSku(product.sku);
    setFormBarcode(product.barcode);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormUnit(product.unit);
    setFormBuyPrice(product.buyPrice);
    setFormSellPrice(product.sellPrice);
    setFormStock(product.stock);
    setFormMinStock(product.minStock);
    setFormLocation(product.location);
    setFormSupplier(product.supplier);
    setFormDescription(product.description);
    setIsDrawerOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) return;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        sku: formSku,
        barcode: formBarcode,
        name: formName,
        category: formCategory,
        unit: formUnit,
        buyPrice: Number(formBuyPrice),
        sellPrice: Number(formSellPrice),
        stock: Number(formStock),
        minStock: Number(formMinStock),
        location: formLocation,
        supplier: formSupplier,
        description: formDescription,
      };
      onUpdateProduct(updated);
    } else {
      const created: Product = {
        id: `PRD-${Date.now().toString().slice(-4)}`,
        sku: formSku,
        barcode: formBarcode,
        name: formName,
        category: formCategory,
        unit: formUnit,
        buyPrice: Number(formBuyPrice),
        sellPrice: Number(formSellPrice),
        stock: Number(formStock),
        minStock: Number(formMinStock),
        location: formLocation,
        supplier: formSupplier,
        description: formDescription,
        images: [],
      };
      onAddProduct(created);
    }

    setIsDrawerOpen(false);
  };

  const handleExecuteAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentProduct || adjustAmount <= 0) return;
    onStockAdjustment(adjustmentProduct.id, adjustAmount, adjustType, adjustReason);
    setAdjustmentProduct(null);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>Manajemen Produk & Inventaris Gudang</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Katalog SKU terpadu, batas peringatan stok minimum, mutasi fisik & penetapan margin harga.
          </p>
        </div>

        <button
          onClick={openAddDrawer}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-lg p-3.5 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SKU, Barcode, atau nama material..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Status Filter buttons */}
          <div className="inline-flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedStatus === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setSelectedStatus('LOW')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedStatus === 'LOW' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Menipis ({products.filter(p => p.stock <= p.minStock && p.stock > 0).length})
            </button>
            <button
              onClick={() => setSelectedStatus('OUT')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedStatus === 'OUT' ? 'bg-rose-500 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Habis ({products.filter(p => p.stock === 0).length})
            </button>
          </div>

        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-0.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* High Density Inventory Data Table */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">SKU / Barcode</th>
                <th className="py-2.5 px-4">Nama Produk & Lokasi</th>
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4 text-right">HPP (Beli)</th>
                <th className="py-2.5 px-4 text-right">Harga Jual</th>
                <th className="py-2.5 px-4 text-center">Margin</th>
                <th className="py-2.5 px-4 text-center">Sisa Stok</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-center">Aksi Mutasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data produk yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const marginPct = Math.round(((product.sellPrice - product.buyPrice) / product.sellPrice) * 100);
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock <= product.minStock && product.stock > 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-medium text-white">
                        <div>{product.sku}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Barcode className="w-3 h-3 text-slate-500" />
                          <span>{product.barcode}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-white">{product.name}</div>
                        <div className="text-[10px] text-slate-400">{product.location} · {product.supplier}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-400">
                        {formatRupiah(product.buyPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-amber-300">
                        {formatRupiah(product.sellPrice)}
                        <span className="text-[10px] text-slate-400 font-sans block">/{product.unit}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-semibold text-emerald-400">
                        +{marginPct}%
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="font-mono font-bold text-sm text-white tabular-nums">
                          {formatNumber(product.stock)}
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {product.minStock}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                            Stok Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            Menipis
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Tersedia
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setAdjustmentProduct(product);
                              setAdjustType('IN');
                              setAdjustAmount(20);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-emerald-500/10 transition-colors"
                            title="Stok Masuk / Restock"
                          >
                            <PackagePlus className="w-4 h-4 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => {
                              setAdjustmentProduct(product);
                              setAdjustType('OUT');
                              setAdjustAmount(5);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                            title="Stok Keluar / Afkir"
                          >
                            <PackageMinus className="w-4 h-4 text-rose-400" />
                          </button>
                          <button
                            onClick={() => openEditDrawer(product)}
                            className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 ml-1 transition-colors"
                            title="Edit Data Produk"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Add / Edit Product */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0e1422] border-l border-slate-800 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {editingProduct ? 'Edit Spesifikasi Produk' : 'Tambah Produk Baru'}
                </h3>
                <p className="text-xs text-slate-400">Data katalog, penetapan harga HPP, dan kontrol stok</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">SKU Produk</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-md font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kode Barcode (EAN)</label>
                  <input
                    type="text"
                    required
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-md font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap Material / Produk</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Granit Valentino Gress 60x60..."
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-md focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-md focus:border-amber-400 focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Satuan Unit</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-md focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Dus (1.44m²)" className="bg-slate-900 text-white">Dus (1.44m²)</option>
                    <option value="Dus (1.00m²)" className="bg-slate-900 text-white">Dus (1.00m²)</option>
                    <option value="Set" className="bg-slate-900 text-white">Set</option>
                    <option value="Pcs" className="bg-slate-900 text-white">Pcs</option>
                    <option value="Sak" className="bg-slate-900 text-white">Sak (50kg / 40kg)</option>
                    <option value="Pail" className="bg-slate-900 text-white">Pail (20 Liter)</option>
                    <option value="Batang" className="bg-slate-900 text-white">Batang (6m)</option>
                    <option value="Unit" className="bg-slate-900 text-white">Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Harga Beli / HPP (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formBuyPrice}
                    onChange={(e) => setFormBuyPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-md font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Harga Jual Konsumen (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formSellPrice}
                    onChange={(e) => setFormSellPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-amber-300 rounded-md font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-md font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Peringatan Stok Minimum</label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white rounded-md font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lokasi Rak Gudang</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Gudang A - Rak 2"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-md focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pemasok / Supplier</label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="PT Supplier..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-md focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-angle image slot placeholder */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Foto Produk Multi-Angle (Katalog & POS)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-20 border border-dashed border-slate-700 bg-slate-900/60 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mb-1 text-amber-400" />
                    <span className="text-[10px]">Tampak Depan</span>
                  </div>
                  <div className="h-20 border border-dashed border-slate-700 bg-slate-900/60 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mb-1 text-amber-400" />
                    <span className="text-[10px]">Tampak Samping</span>
                  </div>
                  <div className="h-20 border border-dashed border-slate-700 bg-slate-900/60 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-amber-400 hover:bg-amber-500/10 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mb-1 text-amber-400" />
                    <span className="text-[10px]">Detail Tekstur</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deskripsi & Catatan Spesifikasi</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan garansi, grade kualitas, atau panduan pasang..."
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-md focus:border-amber-400 focus:outline-none"
                ></textarea>
              </div>

              {/* Drawer Footer Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold shadow-xs transition-colors"
                >
                  Simpan Produk
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustmentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white">Penyesuaian Mutasi Fisik Stok</h3>
                <p className="text-xs text-amber-400 font-mono">{adjustmentProduct.sku} · {adjustmentProduct.name}</p>
              </div>
              <button
                onClick={() => setAdjustmentProduct(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="p-5 space-y-4 text-xs">
              
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="text-slate-400">Stok Tercatat Saat Ini:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {adjustmentProduct.stock} {adjustmentProduct.unit}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jenis Mutasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('IN')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      adjustType === 'IN'
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <PackagePlus className="w-4 h-4 text-emerald-400" />
                    <span>Stok Masuk (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('OUT')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      adjustType === 'OUT'
                        ? 'border-rose-400 bg-rose-500/15 text-rose-300 ring-1 ring-rose-400'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <PackageMinus className="w-4 h-4 text-rose-400" />
                    <span>Stok Keluar (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jumlah Perubahan ({adjustmentProduct.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono font-bold text-amber-300 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Alasan Penyesuaian</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                >
                  <option value="Restock Penerimaan Supplier" className="bg-slate-900 text-white">Restock Penerimaan Supplier</option>
                  <option value="Hasil Stock Opname Bulanan" className="bg-slate-900 text-white">Hasil Stock Opname Bulanan</option>
                  <option value="Barang Pecah / Kerusakan di Gudang" className="bg-slate-900 text-white">Barang Pecah / Kerusakan di Gudang</option>
                  <option value="Retur Pengembalian Pelanggan" className="bg-slate-900 text-white">Retur Pengembalian Pelanggan</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentProduct(null)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold shadow-xs transition-colors"
                >
                  Konfirmasi Mutasi
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
