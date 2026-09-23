import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  FileText, 
  X, 
  Image as ImageIcon,
  ShieldCheck,
  Send,
  Printer
} from 'lucide-react';
import { DeliveryOrder, DeliveryStatus } from '../../types';

interface LogisticsScreenProps {
  deliveries: DeliveryOrder[];
  onUpdateDeliveryStatus: (deliveryId: string, nextStatus: DeliveryStatus, notes?: string, pod?: DeliveryOrder['podProof']) => void;
  onAssignCourier: (deliveryId: string, courierName: string, vehiclePlate: string) => void;
  isMobileCompact?: boolean;
}

export const LogisticsScreen: React.FC<LogisticsScreenProps> = ({
  deliveries,
  onUpdateDeliveryStatus,
  onAssignCourier,
}) => {
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [podReceiver, setPodReceiver] = useState('');
  const [podRelation, setPodRelation] = useState('Penerima Langsung / Mandor');
  const [courierSelection, setCourierSelection] = useState('Agus Pratama');
  const [vehicleSelection, setVehicleSelection] = useState('B 9412 KDA (Daihatsu GranMax)');

  const columns: { status: DeliveryStatus; label: string; badge: string }[] = [
    { status: 'SIAP_KIRIM', label: 'Siap Kirim', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    { status: 'DALAM_PERJALANAN', label: 'Dalam Perjalanan', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
    { status: 'TERKIRIM', label: 'Terkirim (POD Valid)', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    { status: 'BATAL', label: 'Batal / Retur', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  ];

  const handleStartDelivery = (id: string) => {
    onUpdateDeliveryStatus(id, 'DALAM_PERJALANAN', 'Kurir telah berangkat membawa muatan.');
  };

  const openPodModal = (delivery: DeliveryOrder) => {
    setSelectedDelivery(delivery);
    setPodReceiver(delivery.customerName.split(' ')[0] || 'Mandor Proyek');
    setIsPodModalOpen(true);
  };

  const handleConfirmPod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery || !podReceiver.trim()) return;

    const podData = {
      receivedBy: podReceiver,
      relationship: podRelation,
      receivedAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB',
      photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    };

    onUpdateDeliveryStatus(selectedDelivery.id, 'TERKIRIM', 'Barang diterima lengkap dan ditandatangani.', podData);
    setIsPodModalOpen(false);
    setSelectedDelivery(null);
  };

  const handleSaveCourierAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    onAssignCourier(selectedDelivery.id, courierSelection, vehicleSelection);
    setSelectedDelivery(prev => prev ? { ...prev, courierName: courierSelection, vehiclePlate: vehicleSelection } : null);
    alert('Penugasan kurir dan armada berhasil diperbarui!');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Papan Logistik & Pelacakan Pengiriman</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manajemen status Surat Jalan (DO), penugasan kurir armada, dan bukti tanda terima (POD).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Armada Standby: 4 Pick-up · 2 Blind Van
          </span>
        </div>
      </div>

      {/* Kanban Board 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start min-h-[600px]">
        {columns.map(col => {
          const itemsInCol = deliveries.filter(d => d.status === col.status);

          return (
            <div key={col.status} className="bg-[#0e1422] border border-slate-800 rounded-xl p-3 flex flex-col gap-3 min-h-[500px]">
              
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">{col.label}</h3>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${col.badge}`}>
                    {itemsInCol.length}
                  </span>
                </div>
              </div>

              {/* Delivery Cards in this column */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {itemsInCol.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                    Tidak ada kiriman pada status ini
                  </div>
                ) : (
                  itemsInCol.map(delivery => (
                    <div
                      key={delivery.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-2.5 group"
                    >
                      <div>
                        {/* SJ No & Departure Info */}
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold text-amber-300">{delivery.suratJalanNo}</span>
                          {delivery.departureTime && (
                            <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {delivery.departureTime}
                            </span>
                          )}
                        </div>

                        {/* Customer & Address */}
                        <h4 className="text-xs font-bold text-white leading-snug">{delivery.customerName}</h4>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-start gap-1 leading-tight">
                          <MapPin className="w-3 h-3 text-amber-400/80 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{delivery.address}</span>
                        </div>

                        {/* Items Summary */}
                        <div className="mt-2 p-1.5 bg-slate-950/60 rounded text-[11px] text-slate-300 line-clamp-2 border border-slate-800">
                          {delivery.itemsSummary}
                        </div>

                        {/* Courier & Vehicle */}
                        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                          <span className="font-medium text-slate-300 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-slate-500" />
                            {delivery.courierName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{delivery.vehiclePlate.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-xs">
                        <button
                          onClick={() => setSelectedDelivery(delivery)}
                          className="text-slate-400 hover:text-amber-300 font-medium text-[11px] flex items-center gap-0.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Surat Jalan</span>
                        </button>

                        {delivery.status === 'SIAP_KIRIM' && (
                          <button
                            onClick={() => handleStartDelivery(delivery.id)}
                            className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Berangkat</span>
                          </button>
                        )}

                        {delivery.status === 'DALAM_PERJALANAN' && (
                          <button
                            onClick={() => openPodModal(delivery)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Selesaikan POD</span>
                          </button>
                        )}

                        {delivery.status === 'TERKIRIM' && (
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terkirim</span>
                          </span>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Surat Jalan Detail Modal */}
      {selectedDelivery && !isPodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Surat Jalan Pengiriman (Delivery Order)</span>
                </h3>
                <p className="text-xs text-amber-300 font-mono">{selectedDelivery.suratJalanNo} · Order: {selectedDelivery.orderId}</p>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* Courier Assignment Section */}
              <form onSubmit={handleSaveCourierAssignment} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                  Penugasan Kurir & Armada Pengangkut
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Nama Kurir</label>
                    <select
                      value={courierSelection}
                      onChange={(e) => setCourierSelection(e.target.value)}
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 text-white rounded text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="Agus Pratama" className="bg-slate-900 text-white">Agus Pratama (Driver 1)</option>
                      <option value="Doni Saputra" className="bg-slate-900 text-white">Doni Saputra (Driver 2)</option>
                      <option value="Hendra Kurnia" className="bg-slate-900 text-white">Hendra Kurnia (Driver 3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Armada Kendaraan</label>
                    <select
                      value={vehicleSelection}
                      onChange={(e) => setVehicleSelection(e.target.value)}
                      className="w-full p-1.5 bg-slate-900 border border-slate-700 text-white rounded text-xs focus:border-amber-400 focus:outline-none"
                    >
                      <option value="B 9412 KDA (Daihatsu GranMax Pick-up)" className="bg-slate-900 text-white">B 9412 KDA (GranMax Pick-up)</option>
                      <option value="B 9720 SZR (Blind Van Isuzu Traga)" className="bg-slate-900 text-white">B 9720 SZR (Blind Van Traga)</option>
                      <option value="B 9104 CDX (Truk Engkel 4 Roda)" className="bg-slate-900 text-white">B 9104 CDX (Truk Engkel)</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[11px] font-bold shadow-xs transition-colors"
                >
                  Perbarui Penugasan
                </button>
              </form>

              {/* Destination Details */}
              <div className="border border-slate-800 rounded-lg p-3 space-y-2 bg-slate-900/40">
                <div className="flex justify-between text-slate-400">
                  <span>Penerima:</span>
                  <span className="font-bold text-white">{selectedDelivery.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Telepon:</span>
                  <span className="font-mono text-white">{selectedDelivery.customerPhone}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Alamat Bongkar:</span>
                  <span className="text-right text-slate-200 max-w-[280px]">{selectedDelivery.address}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1.5">
                  <span>Muatan Barang:</span>
                  <span className="text-right text-amber-300 font-medium max-w-[280px]">{selectedDelivery.itemsSummary}</span>
                </div>
              </div>

              {/* POD Info if Delivered */}
              {selectedDelivery.podProof && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Bukti Serah Terima (Proof of Delivery / POD) Terverifikasi</span>
                  </div>
                  <div className="text-emerald-400 text-[11px]">
                    Diterima oleh: <strong>{selectedDelivery.podProof.receivedBy}</strong> ({selectedDelivery.podProof.relationship}) pada {selectedDelivery.podProof.receivedAt}.
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Surat Jalan</span>
              </button>

              <button
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Proof of Delivery (POD) Modal */}
      {isPodModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white">Konfirmasi Bukti Tanda Terima (POD)</h3>
                <p className="text-xs text-amber-300 font-mono">{selectedDelivery.suratJalanNo}</p>
              </div>
              <button onClick={() => setIsPodModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPod} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Orang Yang Menerima Muatan</label>
                <input
                  type="text"
                  required
                  value={podReceiver}
                  onChange={(e) => setPodReceiver(e.target.value)}
                  placeholder="Nama Mandor / PIC Lapangan..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Hubungan / Peran Penerima</label>
                <select
                  value={podRelation}
                  onChange={(e) => setPodRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                >
                  <option value="Pemilik Proyek Langsung" className="bg-slate-900 text-white">Pemilik Proyek Langsung</option>
                  <option value="Mandor / Pelaksana Lapangan" className="bg-slate-900 text-white">Mandor / Pelaksana Lapangan</option>
                  <option value="Kepala Gudang / Logistik Toko" className="bg-slate-900 text-white">Kepala Gudang / Logistik Toko</option>
                  <option value="Sekuriti Pos Jaga" className="bg-slate-900 text-white">Sekuriti Pos Jaga</option>
                </select>
              </div>

              {/* Digital signature and camera simulation */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                <span className="font-semibold text-slate-300 block text-[11px]">Tanda Tangan Digital & Foto Bongkar</span>
                <div className="h-24 bg-slate-900 border border-dashed border-slate-700 rounded flex flex-col items-center justify-center text-slate-400 text-center cursor-pointer hover:border-amber-400/50">
                  <ImageIcon className="w-5 h-5 mb-1 text-amber-400" />
                  <span className="text-[10px]">Foto Surat Jalan Bertandatangan Telah Terlampir</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPodModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesaikan & Verifikasi POD</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
