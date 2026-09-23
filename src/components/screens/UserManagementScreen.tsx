import React, { useState } from 'react';
import { 
  UserCog, 
  Plus, 
  Check, 
  X, 
  Key
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface UserManagementScreenProps {
  users: UserAccount[];
  onToggleUserStatus: (userId: string) => void;
  onAddUser: (user: UserAccount) => void;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({
  users,
  onToggleUserStatus,
  onAddUser,
}) => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [roleTitle, setRoleTitle] = useState('Staff Operasional Kasir');
  const [department, setDepartment] = useState('Operasional Kasir');
  const [branch, setBranch] = useState('Cabang BSD Raya');

  const permissionsMatrix = [
    { feature: 'POS Kasir & Transaksi Langsung', owner: true, admin: true, employee: true },
    { feature: 'Katalog & Edit Harga HPP Stok', owner: true, admin: true, employee: false },
    { feature: 'Surat Jalan & Dispatch Kurir', owner: true, admin: true, employee: true },
    { feature: 'Buku Piutang & Limit Kredit CRM', owner: true, admin: true, employee: false },
    { feature: 'Presensi Biometrik & Ajukan Cuti', owner: true, admin: true, employee: true },
    { feature: 'Generate Payroll & Nominal Gaji', owner: true, admin: false, employee: false },
    { feature: 'Manajemen Akun User & Otoritas', owner: true, admin: false, employee: false },
  ];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserAccount = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name,
      email,
      phone,
      role,
      roleTitle,
      department,
      branch,
      status: 'ACTIVE',
      lastLogin: 'Belum pernah login',
    };

    onAddUser(newUser);
    setIsAddUserModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCog className="w-5 h-5 text-amber-400" />
            <span>Pengaturan User, Peran & Hak Akses (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar kredensial personil, toggle status aktifasi, dan matriks wewenang operasional.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* User Accounts Data Table */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Daftar Akun Pengguna Sistem</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Nama & Email</th>
                <th className="py-2.5 px-4">Peran (Role Badge)</th>
                <th className="py-2.5 px-4">Jabatan & Departemen</th>
                <th className="py-2.5 px-4">Cabang Penempatan</th>
                <th className="py-2.5 px-4">Aktivitas Terakhir</th>
                <th className="py-2.5 px-4 text-center">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email} · {user.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      user.role === 'OWNER' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                      user.role === 'ADMIN' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-200">{user.roleTitle}</div>
                    <div className="text-[11px] text-slate-400">{user.department}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {user.branch}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                    {user.lastLogin}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleUserStatus(user.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors border ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      <span>{user.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Overview */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span>Matriks Hak Akses & Kewenangan (Role Permission Matrix)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Pemetaan otorisasi fitur berdasarkan hierarki jabatan enterprise</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="py-2.5 px-4">Fitur Modul Operasional</th>
                <th className="py-2.5 px-4 text-center font-bold text-amber-400">OWNER (Direksi)</th>
                <th className="py-2.5 px-4 text-center font-bold text-sky-400">ADMIN (Operasional/Kasir)</th>
                <th className="py-2.5 px-4 text-center font-bold text-emerald-400">EMPLOYEE (Staff/Kurir)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-medium text-slate-200">{item.feature}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-block p-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.admin ? (
                      <span className="inline-block p-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-block p-1 bg-slate-800 text-slate-500 rounded-full">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.employee ? (
                      <span className="inline-block p-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-block p-1 bg-slate-800 text-slate-500 rounded-full">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div>
                <h3 className="text-sm font-bold text-white">Tambah Akun Karyawan Baru</h3>
                <p className="text-xs text-slate-400">Konfigurasi peran dan wewenang akses</p>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Personil"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email Resmi Perusahaan</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@propertierp.id"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tingkatan Peran (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                  >
                    <option value="ADMIN" className="bg-slate-900 text-white">ADMIN (Operasional Kasir/Gudang)</option>
                    <option value="EMPLOYEE" className="bg-slate-900 text-white">EMPLOYEE (Staff/Kurir)</option>
                    <option value="OWNER" className="bg-slate-900 text-white">OWNER (Direksi)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cabang Penempatan</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Cabang BSD Raya" className="bg-slate-900 text-white">Cabang BSD Raya</option>
                    <option value="Kantor Pusat Jakarta" className="bg-slate-900 text-white">Kantor Pusat Jakarta</option>
                    <option value="Gudang Daan Mogot" className="bg-slate-900 text-white">Gudang Daan Mogot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:text-white font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold shadow-xs transition-colors"
                >
                  Buat Akun
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
