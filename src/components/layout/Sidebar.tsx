import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Boxes, 
  Truck, 
  Users, 
  CalendarClock, 
  UserCog, 
  TrendingUp,
} from 'lucide-react';
import { UserRole } from '../../types';

export type ScreenId = 
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'logistics'
  | 'customers'
  | 'hr_payroll'
  | 'users';

interface SidebarProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  userRole: UserRole;
  lowStockCount: number;
  activeDeliveryCount: number;
  pendingPiutangCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onSelectScreen,
  userRole,
  lowStockCount,
  activeDeliveryCount,
  pendingPiutangCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ScreenId,
      label: 'Executive Dashboard',
      subtitle: 'Analitik & Omset',
      icon: LayoutDashboard,
      badge: null,
      allowedRoles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
    },
    {
      id: 'pos' as ScreenId,
      label: 'Point of Sale (Kasir)',
      subtitle: 'Input Transaksi & Struk',
      icon: ShoppingBag,
      badge: 'Kasir',
      badgeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      allowedRoles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
    },
    {
      id: 'inventory' as ScreenId,
      label: 'Produk & Inventaris',
      subtitle: 'Katalog & Mutasi Stok',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Menipis` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      allowedRoles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
    },
    {
      id: 'logistics' as ScreenId,
      label: 'Pengiriman & Logistik',
      subtitle: 'Kanban & Surat Jalan',
      icon: Truck,
      badge: activeDeliveryCount > 0 ? `${activeDeliveryCount} Aktif` : null,
      badgeColor: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
      allowedRoles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
    },
    {
      id: 'customers' as ScreenId,
      label: 'Pelanggan & Piutang',
      subtitle: 'CRM & Riwayat Tempo',
      icon: Users,
      badge: pendingPiutangCount > 0 ? `${pendingPiutangCount} Tempo` : null,
      badgeColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
      allowedRoles: ['OWNER', 'ADMIN'],
    },
    {
      id: 'hr_payroll' as ScreenId,
      label: 'SDM, Presensi & Payroll',
      subtitle: 'Presensi GPS & Slip Gaji',
      icon: CalendarClock,
      badge: null,
      allowedRoles: ['OWNER', 'ADMIN', 'EMPLOYEE'],
    },
    {
      id: 'users' as ScreenId,
      label: 'Pengaturan User & Role',
      subtitle: 'Hak Akses & Otorisasi',
      icon: UserCog,
      badge: 'Admin',
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
      allowedRoles: ['OWNER', 'ADMIN'],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#090d14] border-r border-slate-800/80 flex flex-col shrink-0 text-slate-300
        transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0 md:flex
      `}>
        
        {/* Branch & Status banner */}
        <div className="p-4 border-b border-slate-800/80 bg-[#070a10]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cabang Aktif</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50"></span>
              Online
            </span>
          </div>
          <div className="text-xs font-semibold text-white mt-1">BSD Raya Mega Store</div>
          <div className="text-[11px] text-slate-400">Gudang & Showroom Terpadu</div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Modul Operasional
          </div>

          {menuItems.map((item) => {
            const isAllowed = item.allowedRoles.includes(userRole);
            const isActive = currentScreen === item.id;
            const Icon = item.icon;

            if (!isAllowed) {
              return (
                <div
                  key={item.id}
                  className="px-3 py-2 rounded-lg text-xs text-slate-500 flex items-center justify-between opacity-50 cursor-not-allowed"
                  title="Akses terbatas untuk peran Anda"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                    Terkunci
                  </span>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectScreen(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-white border-l-2 border-amber-400 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  <div className="truncate">
                    <div className={`leading-tight truncate ${isActive ? 'font-bold text-white' : 'text-slate-200'}`}>
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] leading-tight truncate ${
                        isActive ? 'text-amber-300/80' : 'text-slate-400'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap shrink-0 ${
                      isActive ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Summary widget */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070a10]">
          <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-slate-300">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                Target Omset Q3
              </span>
              <span className="font-mono text-amber-400 font-semibold">92.4%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: '92.4%' }}></div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="text-white font-mono">Rp 1.84M tercapai</span>
              <span className="text-slate-400">Goal: 2.0M</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
