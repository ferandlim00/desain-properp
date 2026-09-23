import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Bell, 
  ChevronDown, 
  LogOut, 
  ShieldCheck,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface NavbarProps {
  currentUser: UserAccount;
  onOpenDesignSystem: () => void;
  onLogout: () => void;
  activeScreenTitle: string;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenDesignSystem,
  onLogout,
  activeScreenTitle,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-500/5';
      case 'ADMIN':
        return 'bg-slate-800 text-slate-200 border-slate-700';
      case 'EMPLOYEE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'OWNER (Direksi)';
      case 'ADMIN':
        return 'ADMIN (Operasional)';
      case 'EMPLOYEE':
        return 'EMPLOYEE (Staff)';
    }
  };

  return (
    <header className="h-14 bg-[#0c1017] border-b border-amber-500/20 px-4 lg:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 backdrop-blur-md">
      
      {/* Zone 1: Mobile Hamburger + Wordmark + Subtle Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Toggle Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <a href="#dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-white text-base group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shrink-0 shadow-sm shadow-amber-500/20">
            <Building2 className="w-4 h-4 text-slate-950 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white font-bold tracking-tight">Properti</span>
            <span className="text-amber-400 font-bold tracking-tight">ERP</span>
          </div>
        </a>

        <div className="hidden md:flex items-center text-xs text-slate-500">
          <span className="mx-2 text-slate-600">/</span>
          <span className="font-medium text-slate-300">{activeScreenTitle}</span>
        </div>
      </div>

      {/* Zone 2: Documentation & Design System Spec */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDesignSystem}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 hover:border-amber-400 transition-colors shadow-2xs"
          title="Figma Design Tokens & UI Specs"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Design Spec & Tokens</span>
        </button>
      </div>

      {/* Zone 3: Static Role Model Badge (Non-Editable) & User Profile */}
      <div className="flex items-center gap-2.5">
        
        {/* Model Role Display (Static Badge - Role cannot be changed on the fly) */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-900/90 border border-slate-800 rounded-lg text-slate-300 select-none"
          title={`Peran terdaftar: ${currentUser.roleTitle} (Tidak dapat diubah manual)`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden lg:inline text-slate-400 font-medium">Model Peran:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRoleBadge(currentUser.role)}`}>
            {getRoleDisplayName(currentUser.role)}
          </span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-lg transition-colors relative"
            title="Notifikasi Operasional"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0e1422] border border-slate-800 rounded-lg shadow-2xl py-2 z-40 text-xs animate-in fade-in duration-100">
              <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-white">Pemberitahuan Sistem</span>
                <span className="text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer">Tandai Dibaca</span>
              </div>
              <div className="divide-y divide-slate-800/60">
                <div className="p-3 hover:bg-slate-800/40 cursor-pointer">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-amber-400">Peringatan Stok</span>
                    <span>10m lalu</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1">Stok <strong className="text-white">Cat Dulux Weathershield 20L</strong> tersisa 4 Pail (di bawah batas minimum 8 Pail).</p>
                </div>
                <div className="p-3 hover:bg-slate-800/40 cursor-pointer">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-sky-400">Logistik</span>
                    <span>45m lalu</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1">Surat Jalan <strong className="text-white">SJ/20260922/0088</strong> telah diberangkatkan oleh Kurir Doni Saputra.</p>
                </div>
                <div className="p-3 hover:bg-slate-800/40 cursor-pointer">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-rose-400">Piutang Jatuh Tempo</span>
                    <span>2j lalu</span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1">CV Citra Karya Arsitektur memiliki tagihan Rp 22.500.000 lewat 60 hari.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xs font-bold shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">{currentUser.name}</div>
              <div className="text-[10px] text-amber-300/80 truncate max-w-[120px]">{currentUser.roleTitle}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0e1422] border border-slate-800 rounded-lg shadow-2xl py-1 z-40 text-xs animate-in fade-in duration-100">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="font-medium text-white">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                <div className="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>{currentUser.branch}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenDesignSystem();
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800/50 text-slate-300 hover:text-white flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Dokumentasi Desain & Token</span>
              </button>
              <div className="border-t border-slate-800"></div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-950/30 text-rose-400 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
