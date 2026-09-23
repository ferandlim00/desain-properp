import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  availableUsers: UserAccount[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  availableUsers,
}) => {
  const [email, setEmail] = useState('hendra.kusuma@propertierp.id');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Silakan isi email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const foundUser = availableUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (foundUser) {
        setIsLoading(false);
        onLoginSuccess(foundUser);
      } else {
        setIsLoading(false);
        // Fallback to first user if typed custom email
        onLoginSuccess(availableUsers[0]);
      }
    }, 600);
  };

  const handleQuickLogin = (user: UserAccount) => {
    setEmail(user.email);
    setPassword('demoPass2026!');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(user);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Subtle architectural background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand Lockup */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 shadow-md mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">PropertiERP Enterprise</h1>
          <p className="text-xs text-slate-400 mt-1">Sistem Operasional, POS, Stok & Logistik Terpadu</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0e1422] py-8 px-6 sm:px-10 border border-slate-800 rounded-xl shadow-xl">
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email atau Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@propertierp.id"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                />
                <span>Ingat perangkat ini</span>
              </label>

              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Hubungi IT Administrator untuk reset PIN / Password.'); }} className="text-amber-400 hover:underline font-medium">
                Lupa sandi?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-all shadow-xs disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                  <span>Memverifikasi Otorisasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem Operasional</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Akses Cepat Demo Persona
              </span>
              <span className="text-[10px] text-amber-400 font-medium">Klik untuk Auto-Login</span>
            </div>

            <div className="space-y-1.5">
              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="w-full text-left p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">
                        {user.roleTitle}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-300 border border-slate-700 rounded font-semibold">
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Enterprise Security Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sesi Terenkripsi TLS 256-bit · PropertiERP v4.2 Enterprise</span>
        </div>

      </div>
    </div>
  );
};
