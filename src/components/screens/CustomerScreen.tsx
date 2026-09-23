import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  X,
  History
} from 'lucide-react';
import { Customer, TransactionOrder } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface CustomerScreenProps {
  customers: Customer[];
  orders: TransactionOrder[];
  onAddCustomer: (customer: Customer) => void;
  onPayPiutang: (customerId: string, amount: number, notes: string) => void;
}

export const CustomerScreen: React.FC<CustomerScreenProps> = ({
  customers,
  orders,
  onAddCustomer,
  onPayPiutang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Pay Piutang Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payNotes, setPayNotes] = useState<string>('Transfer Rekening BCA Operasional');

  // Add Customer Drawer
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'PLATINUM' | 'GOLD' | 'REGULAR'>('REGULAR');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(50000000);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          c.phone.includes(searchQuery);
    const matchesType = selectedType === 'ALL' || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalPiutangUsaha = customers.reduce((sum, c) => sum + c.usedCredit, 0);
  const totalOverdue = customers.reduce((sum, c) => sum + c.agingBreakdown.over60, 0);

  const openPaymentModal = (customer: Customer) => {
    setPayingCustomer(customer);
    setPayAmount(customer.usedCredit);
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer || payAmount <= 0) return;
    onPayPiutang(payingCustomer.id, payAmount, payNotes);
    setIsPayModalOpen(false);
    setPayingCustomer(null);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust: Customer = {
      id: `CUST-${Date.now().toString().slice(-6)}`,
      code: `C-${type.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      name,
      company: company || undefined,
      type,
      phone,
      email,
      address,
      creditLimit: Number(creditLimit),
      usedCredit: 0,
      totalOrders: 0,
      totalSpend: 0,
      agingBreakdown: { current: 0, days30to60: 0, over60: 0 },
      lastTransactionDate: new Date().toISOString().split('T')[0],
    };

    onAddCustomer(newCust);
    setIsAddDrawerOpen(false);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Manajemen Pelanggan & Piutang Usaha (AR)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            CRM mitra kontraktor, kontrol pagu limit kredit, dan pelacakan aging piutang tempo.
          </p>
        </div>

        <button
          onClick={() => setIsAddDrawerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* KPI Cards: Total Piutang, Overdue & Active Credit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Saldo Piutang Beredar</span>
            <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-white">
            {formatRupiah(totalPiutangUsaha)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Dari {customers.filter(c => c.usedCredit > 0).length} mitra aktif</div>
        </div>

        <div className="p-4 bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Jatuh Tempo Kritis (&gt;60 Hari)</span>
            <div className="w-7 h-7 rounded-md bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-rose-400">
            {formatRupiah(totalOverdue)}
          </div>
          <div className="text-[11px] text-rose-400 font-medium mt-1">Perlu penagihan intensif finance</div>
        </div>

        <div className="p-4 bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Rata-Rata Rasio Pelunasan</span>
            <div className="w-7 h-7 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tabular-nums text-emerald-400">
            94.8%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Kolektibilitas lancar bulan ini</div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama toko, PT kontraktor, telepon..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg text-xs focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="inline-flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              selectedType === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({customers.length})
          </button>
          <button
            onClick={() => setSelectedType('PLATINUM')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              selectedType === 'PLATINUM' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Platinum
          </button>
          <button
            onClick={() => setSelectedType('GOLD')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              selectedType === 'GOLD' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gold
          </button>
          <button
            onClick={() => setSelectedType('REGULAR')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              selectedType === 'REGULAR' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Regular
          </button>
        </div>
      </div>

      {/* Customers Data Table with Aging Breakdown */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Nama Pelanggan / Badan</th>
                <th className="py-2.5 px-4">Tipe Mitra</th>
                <th className="py-2.5 px-4 text-right">Limit Kredit</th>
                <th className="py-2.5 px-4 text-right">Saldo Piutang</th>
                <th className="py-2.5 px-4 text-center">Aging &lt;30 Hari</th>
                <th className="py-2.5 px-4 text-center">Aging 30-60 Hari</th>
                <th className="py-2.5 px-4 text-center">Jatuh Tempo &gt;60 Hari</th>
                <th className="py-2.5 px-4 text-center">Aksi Pelunasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredCustomers.map(customer => {
                const isOverdue = customer.agingBreakdown.over60 > 0;

                return (
                  <tr key={customer.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{customer.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {customer.company || customer.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        customer.type === 'PLATINUM' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' :
                        customer.type === 'GOLD' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {customer.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {customer.creditLimit > 0 ? formatRupiah(customer.creditLimit) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-amber-300">
                      {formatRupiah(customer.usedCredit)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-emerald-400">
                      {formatRupiah(customer.agingBreakdown.current)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-amber-400">
                      {formatRupiah(customer.agingBreakdown.days30to60)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold tabular-nums text-rose-400">
                      {isOverdue ? formatRupiah(customer.agingBreakdown.over60) : 'Rp 0'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {customer.usedCredit > 0 && (
                          <button
                            onClick={() => openPaymentModal(customer)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[11px] font-bold shadow-xs transition-colors"
                          >
                            Bayar Piutang
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="px-2.5 py-1 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-colors"
                        >
                          Riwayat
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Invoices Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0e1422] border-l border-slate-800 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white">{selectedCustomer.name}</h3>
                <p className="text-xs text-amber-300 font-mono">Kode: {selectedCustomer.code} · {selectedCustomer.type}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Alamat Proyek:</span>
                  <span className="font-medium text-white text-right max-w-[260px]">{selectedCustomer.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telepon / WA:</span>
                  <span className="font-mono text-white">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Sisa Limit Kredit:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {formatRupiah(selectedCustomer.creditLimit - selectedCustomer.usedCredit)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Riwayat Transaksi Faktur Terkait</span>
                </h4>

                <div className="space-y-2">
                  {orders.filter(o => o.customerId === selectedCustomer.id).length === 0 ? (
                    <div className="p-4 text-center text-slate-500 border border-dashed border-slate-800 rounded">
                      Belum ada transaksi tersimpan untuk pelanggan ini.
                    </div>
                  ) : (
                    orders.filter(o => o.customerId === selectedCustomer.id).map(order => (
                      <div key={order.id} className="p-3 border border-slate-800 rounded-lg bg-slate-900/60 space-y-1">
                        <div className="flex justify-between font-mono font-bold text-white">
                          <span>{order.invoiceNumber}</span>
                          <span className="text-amber-300">{formatRupiah(order.grandTotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>{order.date}</span>
                          <span className={`px-1.5 py-0.2 rounded font-semibold border ${
                            order.paymentStatus === 'LUNAS' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Tutup Profil
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pay Piutang Modal */}
      {isPayModalOpen && payingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white">Catat Pelunasan Piutang Usaha</h3>
                <p className="text-xs text-amber-300">{payingCustomer.name}</p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-5 space-y-4 text-xs">
              
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-center justify-between">
                <span className="text-slate-300">Total Tagihan Tertunggak:</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {formatRupiah(payingCustomer.usedCredit)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nominal Pembayaran Diterima (Rp)</label>
                <input
                  type="number"
                  min="1"
                  max={payingCustomer.usedCredit}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg font-mono font-bold text-amber-300 text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Keterangan / Bukti Bayar</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Misal: Transfer BCA Ref #88921"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Pembayaran</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Add Customer Drawer */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0e1422] border-l border-slate-800 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white">Registrasi Mitra Pelanggan Baru</h3>
                <p className="text-xs text-slate-400">Pagu kredit & klasifikasi tier kontraktor</p>
              </div>
              <button onClick={() => setIsAddDrawerOpen(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Pelanggan / PIC</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap / Nama Toko"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Perusahaan / Entitas</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Contoh: PT Karya Konstruksi Utama"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tingkatan Mitra</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                  >
                    <option value="REGULAR" className="bg-slate-900 text-white">Regular Retail</option>
                    <option value="GOLD" className="bg-slate-900 text-white">Gold Contractor</option>
                    <option value="PLATINUM" className="bg-slate-900 text-white">Platinum Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pagu Limit Kredit (Rp)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-amber-300 rounded-lg font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kontak@perusahaan.co.id"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Alamat Penagihan & Pengiriman</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Alamat kantor / gudang proyek lengkap..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDrawerOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold shadow-xs transition-colors"
                >
                  Simpan Mitra
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
