import React, { useState } from 'react';
import { 
  TrendingUp, 
  Truck, 
  AlertTriangle, 
  CreditCard, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ChevronRight,
  DollarSign,
  Package
} from 'lucide-react';
import { Product, TransactionOrder, DeliveryOrder, Customer } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface DashboardScreenProps {
  orders: TransactionOrder[];
  products: Product[];
  deliveries: DeliveryOrder[];
  customers: Customer[];
  onNavigateTo: (screen: any) => void;
  onViewOrder: (order: TransactionOrder) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  orders,
  products,
  deliveries,
  customers,
  onNavigateTo,
  onViewOrder,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit' | 'cogs'>('revenue');

  // Compute live KPIs
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.grandTotal, 1842500000);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalPiutang = customers.reduce((acc, c) => acc + c.usedCredit, 342800000);

  // Chart data points (Monthly Trend)
  const chartPoints = [
    { label: '01 Sep', revenue: 42000000, profit: 14700000, cogs: 27300000 },
    { label: '05 Sep', revenue: 58000000, profit: 20300000, cogs: 37700000 },
    { label: '09 Sep', revenue: 51000000, profit: 17850000, cogs: 33150000 },
    { label: '13 Sep', revenue: 84000000, profit: 29400000, cogs: 54600000 },
    { label: '17 Sep', revenue: 69000000, profit: 24150000, cogs: 44850000 },
    { label: '20 Sep', revenue: 92000000, profit: 32200000, cogs: 59800000 },
    { label: '22 Sep (Hari Ini)', revenue: 115000000, profit: 40250000, cogs: 74750000 },
  ];

  const maxVal = Math.max(...chartPoints.map(p => p[chartMetric])) * 1.15;

  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Faktur,Tanggal,Pelanggan,Total,Metode,Status\n' +
      orders.map(o => `${o.invoiceNumber},${o.date},"${o.customerName}",${o.grandTotal},${o.paymentMethod},${o.paymentStatus}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Eksekutif_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Executive Header with Period Selector & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Ringkasan Eksekutif Operasional</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Konsolidasi performa penjualan cabang, status pengiriman armada, stok kritis, dan arus piutang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Filter Tabs */}
          <div className="inline-flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                period === 'today' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                period === 'week' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                period === 'month' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-slate-900 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 hover:border-amber-400 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards (Low-lighting luxury cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Revenue */}
        <div className="p-4 bg-[#0e1422] border border-slate-800/90 rounded-lg shadow-sm hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Omset Penjualan</span>
            <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {formatRupiah(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span className="inline-flex items-center text-emerald-400 font-semibold font-mono">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +14.2%
              </span>
              <span className="text-slate-400">vs bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Deliveries */}
        <div 
          onClick={() => onNavigateTo('logistics')}
          className="p-4 bg-[#0e1422] border border-slate-800/90 rounded-lg shadow-sm hover:border-sky-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pengiriman Armada Aktif</span>
            <div className="w-7 h-7 rounded-md bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:bg-sky-500/25 transition-colors">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {deliveries.filter(d => d.status === 'DALAM_PERJALANAN').length} Berjalan <span className="text-sm font-normal text-slate-400">/ {deliveries.length} Total</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-sky-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{deliveries.filter(d => d.status === 'SIAP_KIRIM').length} Surat Jalan Siap Muat</span>
            </div>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div 
          onClick={() => onNavigateTo('inventory')}
          className="p-4 bg-[#0e1422] border border-slate-800/90 rounded-lg shadow-sm hover:border-amber-400/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Peringatan Stok Kritis</span>
            <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 group-hover:bg-amber-500/30 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono tabular-nums text-amber-400">
              {lowStockProducts.length} Item Menipis
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{products.filter(p => p.stock === 0).length} Item Habis Total (Reorder Segera)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Piutang (AR) */}
        <div 
          onClick={() => onNavigateTo('customers')}
          className="p-4 bg-[#0e1422] border border-slate-800/90 rounded-lg shadow-sm hover:border-rose-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Piutang Usaha (AR)</span>
            <div className="w-7 h-7 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 group-hover:bg-rose-500/25 transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {formatRupiah(totalPiutang)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
              <span>Rp 22.500.000 Lewat Jatuh Tempo</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Chart Section: Sales, Margin & Profitability Trend */}
      <div className="p-5 bg-[#0e1422] border border-slate-800/90 rounded-lg shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Tren Penjualan & Margin Keuntungan</h2>
            <p className="text-xs text-slate-400">Pergerakan omset bruto vs estimasi margin laba bersih harian</p>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChartMetric('revenue')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                chartMetric === 'revenue' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Omset Penjualan
            </button>
            <button
              onClick={() => setChartMetric('profit')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                chartMetric === 'profit' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Laba Bersih (~35%)
            </button>
            <button
              onClick={() => setChartMetric('cogs')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                chartMetric === 'cogs' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              HPP / Modal
            </button>
          </div>
        </div>

        {/* Clean SVG Area & Bar Graphic */}
        <div className="h-64 pt-4 flex flex-col justify-end">
          <div className="flex items-end justify-between gap-2 sm:gap-6 h-48 border-b border-slate-800 px-2">
            {chartPoints.map((pt, idx) => {
              const currentVal = pt[chartMetric];
              const heightPercent = Math.max(10, Math.round((currentVal / maxVal) * 100));
              const isToday = idx === chartPoints.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-amber-500/40 text-amber-300 text-[11px] font-mono px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap mb-1">
                    {formatRupiah(currentVal)}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t transition-all ${
                      chartMetric === 'revenue'
                        ? isToday ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20' : 'bg-amber-500/25 group-hover:bg-amber-500/50'
                        : chartMetric === 'profit'
                        ? isToday ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20' : 'bg-emerald-500/25 group-hover:bg-emerald-500/50'
                        : isToday ? 'bg-slate-600' : 'bg-slate-800 group-hover:bg-slate-700'
                    }`}
                  ></div>

                  {/* Label */}
                  <span className={`text-[10px] sm:text-xs truncate ${isToday ? 'font-bold text-amber-400' : 'text-slate-400'}`}>
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
            <span>Baseline: 0</span>
            <span className="font-mono text-amber-400">Puncak Terkini: {formatRupiah(maxVal)}</span>
          </div>
        </div>

      </div>

      {/* Split Section: Recent Transactions & Active Deliveries Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Recent Transactions Table */}
        <div className="lg:col-span-2 bg-[#0e1422] border border-slate-800/90 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Transaksi Kasir Terbaru</h3>
              <p className="text-[11px] text-slate-400">Aktivitas penjualan langsung dan pesanan proyek</p>
            </div>
            <button
              onClick={() => onNavigateTo('pos')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>Buka POS Kasir</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">No. Faktur</th>
                  <th className="py-2.5 px-4">Pelanggan</th>
                  <th className="py-2.5 px-4">Metode</th>
                  <th className="py-2.5 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-white">
                      {order.invoiceNumber}
                      <div className="text-[10px] text-slate-400 font-sans">{order.date}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-white">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400">{order.items.length} item barang</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-amber-300">
                      {formatRupiah(order.grandTotal)}
                    </td>
                    <td className="py-2.5 px-4">
                      {order.paymentStatus === 'LUNAS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          Tempo (Pending)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors"
                        title="Lihat Struk Faktur"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Active Delivery & Urgent Reorder List */}
        <div className="space-y-4">
          
          {/* Active Deliveries Widget */}
          <div className="bg-[#0e1422] border border-slate-800/90 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Armada Pengiriman</h3>
              <button
                onClick={() => onNavigateTo('logistics')}
                className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-medium"
              >
                Papan Kanban
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {deliveries.slice(0, 3).map((del) => (
                <div key={del.id} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-white">{del.suratJalanNo}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      del.status === 'DALAM_PERJALANAN' 
                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' 
                        : del.status === 'SIAP_KIRIM' 
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {del.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-white font-medium mt-1 truncate">{del.customerName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-amber-400/80 shrink-0" />
                    <span className="truncate">{del.courierName} ({del.vehiclePlate.split(' ')[0]})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Reorder Alert Widget */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Perlu Restock Segera</span>
            </div>
            <div className="space-y-2 text-xs">
              {lowStockProducts.slice(0, 2).map((item) => (
                <div key={item.id} className="p-2 bg-slate-900/90 rounded border border-amber-500/30 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-amber-400 font-mono">Sisa: {item.stock} {item.unit}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTo('inventory')}
                    className="shrink-0 px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[10px] font-bold shadow-xs transition-colors"
                  >
                    PO Supplier
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
