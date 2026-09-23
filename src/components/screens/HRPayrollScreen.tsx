import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  UserCheck, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Printer, 
  FileText, 
  X,
  DollarSign,
  Check
} from 'lucide-react';
import { AttendanceRecord, EmployeePayroll, UserAccount } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface HRPayrollScreenProps {
  attendanceRecords: AttendanceRecord[];
  payrollRecords: EmployeePayroll[];
  currentUser: UserAccount;
  onClockIn: (record: AttendanceRecord) => void;
  isMobileCompact?: boolean;
}

export const HRPayrollScreen: React.FC<HRPayrollScreenProps> = ({
  attendanceRecords,
  payrollRecords,
  currentUser,
  onClockIn,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll'>('attendance');
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Clock-in modal state
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [clockInNotes, setClockInNotes] = useState('');
  const [isCapturingSelfie, setIsCapturingSelfie] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  // Slip Gaji Modal state
  const [selectedSlip, setSelectedSlip] = useState<EmployeePayroll | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasClockedInToday = attendanceRecords.some(r => r.employeeId === currentUser.id);

  const handleExecuteClockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const isLate = now.getHours() >= 8 && now.getMinutes() > 15;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-6)}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      date: new Date().toISOString().split('T')[0],
      clockInTime: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU',
      locationName: 'Outlet Utama BSD (GPS Verified)',
      notes: clockInNotes || (isLate ? 'Keterlambatan tercatat otomatis' : 'Hadir tepat waktu'),
      isSelfieVerified: true,
    };

    onClockIn(newRecord);
    setIsClockInModalOpen(false);
    setSelfieCaptured(false);
    setClockInNotes('');
  };

  const totalPayrollExpenditure = payrollRecords.reduce((sum, p) => sum + p.netSalary, 0);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header & Clock Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-400" />
            <span>SDM, Presensi Harian & Payroll Terpadu</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Presensi biometrik GPS geofencing dan otomatisasi cetak slip gaji karyawan.
          </p>
        </div>

        {/* Live Digital Clock & Attendance Trigger */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-[#0e1422] text-white rounded-lg border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Waktu Server</div>
            <div className="text-xs font-mono font-bold text-amber-400">{currentTime || '08:00:00 WIB'}</div>
          </div>

          <button
            disabled={hasClockedInToday}
            onClick={() => setIsClockInModalOpen(true)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              hasClockedInToday
                ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{hasClockedInToday ? 'Sudah Presensi Hari Ini' : 'Presensi Masuk (Clock-In)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs w-fit">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'attendance'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Presensi Harian Tim ({attendanceRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-colors ${
            activeTab === 'payroll'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>Otomatisasi Slip Gaji & Payroll</span>
        </button>
      </div>

      {/* Tab 1: Attendance Grid */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          
          <div className="bg-[#0e1422] border border-slate-800 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-white">
                Geofence Radius: <span className="font-normal text-slate-400">Gudang & Showroom BSD (Maks 50m)</span>
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Shift Pagi: <strong className="text-slate-200">08:00 - 17:00 WIB</strong> (Toleransi 15 menit)
            </div>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Nama Karyawan</th>
                  <th className="py-2.5 px-4">Departemen</th>
                  <th className="py-2.5 px-4">Jam Masuk</th>
                  <th className="py-2.5 px-4">Lokasi & Verifikasi</th>
                  <th className="py-2.5 px-4">Status Kehadiran</th>
                  <th className="py-2.5 px-4">Catatan Karyawan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {attendanceRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {rec.employeeName}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {rec.department}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {rec.clockInTime || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {rec.locationName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{rec.locationName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        rec.status === 'TEPAT_WAKTU' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                        rec.status === 'TERLAMBAT' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                        rec.status === 'IZIN' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                        'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          rec.status === 'TEPAT_WAKTU' ? 'bg-emerald-400' :
                          rec.status === 'TERLAMBAT' ? 'bg-amber-400' : 'bg-sky-400'
                        }`}></span>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {rec.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 2: Payroll & Slip Gaji */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          
          {/* Payroll Summary Card */}
          <div className="p-4 bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Periode Penggajian</span>
              <div className="text-base font-bold text-white mt-0.5">September 2026 (Proses Final)</div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Beban Payroll THP</span>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-300 mt-0.5">
                {formatRupiah(totalPayrollExpenditure)}
              </div>
            </div>
          </div>

          <div className="bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Nama & Posisi</th>
                  <th className="py-2.5 px-4 text-right">Gaji Pokok</th>
                  <th className="py-2.5 px-4 text-right">Tunjangan & Lembur</th>
                  <th className="py-2.5 px-4 text-right">Insentif Penjualan</th>
                  <th className="py-2.5 px-4 text-right">Potongan (BPJS/Pph)</th>
                  <th className="py-2.5 px-4 text-right">Gaji Bersih (THP)</th>
                  <th className="py-2.5 px-4 text-center">Status & Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {payrollRecords.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{pay.employeeName}</div>
                      <div className="text-[11px] text-slate-400">{pay.roleTitle}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {formatRupiah(pay.baseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {formatRupiah(pay.positionAllowance + pay.overtimePay)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                      +{formatRupiah(pay.salesIncentive)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-400">
                      -{formatRupiah(pay.bpjsDeduction + pay.taxPph21 + pay.latePenaltyDeduction)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-amber-300 text-sm">
                      {formatRupiah(pay.netSalary)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedSlip(pay)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[11px] font-bold flex items-center gap-1 mx-auto shadow-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Slip Gaji</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Clock-In Selfie & Geofence Modal */}
      {isClockInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white">Presensi Masuk Harian (Clock-In)</h3>
                <p className="text-xs text-amber-300">{currentUser.name} · {currentUser.roleTitle}</p>
              </div>
              <button onClick={() => setIsClockInModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteClockIn} className="p-5 space-y-4 text-xs">
              
              {/* Geolocation Status Card */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-300">GPS Terverifikasi</div>
                    <div className="text-[10px] text-emerald-400">Radius 12m dari Outlet Utama BSD</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  Akurat (98%)
                </span>
              </div>

              {/* Camera Simulation for Selfie */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Verifikasi Swafoto (Selfie Kamera)</label>
                <div className="h-40 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden relative flex flex-col items-center justify-center text-white">
                  {selfieCaptured ? (
                    <div className="text-center p-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                      <div className="font-semibold text-white">Swafoto Berhasil Direkam</div>
                      <div className="text-[10px] text-slate-300 mt-1">Biometrik Wajah Valid</div>
                      <button
                        type="button"
                        onClick={() => setSelfieCaptured(false)}
                        className="mt-2 text-[10px] text-amber-400 hover:underline"
                      >
                        Ambil Ulang Swafoto
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <div className="text-[11px] text-slate-400 mb-3">Posisikan wajah Anda tegak ke arah kamera</div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCapturingSelfie(true);
                          setTimeout(() => {
                            setIsCapturingSelfie(false);
                            setSelfieCaptured(true);
                          }, 600);
                        }}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
                      >
                        {isCapturingSelfie ? 'Mengambil Foto...' : 'Ambil Swafoto'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Kehadiran (Opsional)</label>
                <input
                  type="text"
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  placeholder="Misal: Bertugas di kasir shift pagi..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClockInModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selfieCaptured}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Kirim Presensi Masuk</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Official Indonesian Slip Gaji Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <span className="text-xs font-bold text-white">Slip Gaji Karyawan (Dokumen Rahasia)</span>
              <button onClick={() => setSelectedSlip(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Slip Gaji Print Document */}
            <div className="p-6 space-y-4 text-xs font-sans text-slate-200 bg-[#0e1422]">
              
              {/* Header Letterhead */}
              <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-white uppercase tracking-wider">PT PROPERTI MEGA PERKASA</div>
                  <div className="text-[10px] text-slate-400">Kompleks Rukan BSD Sektor VII No. 18, Tangerang</div>
                  <div className="text-[10px] text-slate-400">NPWP: 01.442.981.3-411.000</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-amber-400">SLIP GAJI KARYAWAN</div>
                  <div className="text-[11px] text-slate-400">Periode: {selectedSlip.period}</div>
                </div>
              </div>

              {/* Employee Bio */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <div>
                  <span className="text-slate-400">Nama:</span> <strong className="text-white">{selectedSlip.employeeName}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Departemen:</span> <strong className="text-white">{selectedSlip.department}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Jabatan:</span> <strong className="text-white">{selectedSlip.roleTitle}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Status Pajak:</span> <strong className="text-white">TK/0 (Pph 21)</strong>
                </div>
              </div>

              {/* Two columns: Penerimaan (Earnings) vs Potongan (Deductions) */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Earnings */}
                <div className="space-y-1.5 border border-slate-800 bg-slate-900/40 p-3 rounded">
                  <div className="text-[11px] font-bold text-white border-b border-slate-800 pb-1">
                    A. PENERIMAAN
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gaji Pokok:</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatRupiah(selectedSlip.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tunj. Jabatan:</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatRupiah(selectedSlip.positionAllowance)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Insentif / Bonus:</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-semibold">{formatRupiah(selectedSlip.salesIncentive)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Uang Lembur:</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatRupiah(selectedSlip.overtimePay)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-slate-800 pt-1 text-[11px]">
                    <span>Total Bruto:</span>
                    <span className="font-mono tabular-nums text-amber-300">
                      {formatRupiah(selectedSlip.baseSalary + selectedSlip.positionAllowance + selectedSlip.salesIncentive + selectedSlip.overtimePay)}
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-1.5 border border-slate-800 bg-slate-900/40 p-3 rounded">
                  <div className="text-[11px] font-bold text-white border-b border-slate-800 pb-1">
                    B. POTONGAN
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>BPJS Ketenagakerjaan:</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatRupiah(selectedSlip.bpjsDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>PPh 21:</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatRupiah(selectedSlip.taxPph21)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Denda Keterlambatan:</span>
                    <span className="font-mono tabular-nums text-slate-200">{formatRupiah(selectedSlip.latePenaltyDeduction)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-400 border-t border-slate-800 pt-1 text-[11px]">
                    <span>Total Potongan:</span>
                    <span className="font-mono tabular-nums">
                      {formatRupiah(selectedSlip.bpjsDeduction + selectedSlip.taxPph21 + selectedSlip.latePenaltyDeduction)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Net Take Home Pay */}
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">GAJI BERSIH (TAKE HOME PAY)</span>
                  <div className="text-xs text-slate-400">Ditransfer ke Rekening Mandiri Karyawan</div>
                </div>
                <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                  {formatRupiah(selectedSlip.netSalary)}
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                <span>Dikeluarkan oleh Bagian Keuangan PropertiERP</span>
                <span>Dokumen Sah Tanpa Tanda Tangan Fisik</span>
              </div>

            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Cetak Slip Gaji</span>
              </button>

              <button
                onClick={() => setSelectedSlip(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
