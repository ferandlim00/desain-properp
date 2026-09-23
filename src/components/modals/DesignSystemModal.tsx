import React, { useState } from 'react';
import { X, Copy, Check, Layers, Palette, Type, Box, ShieldCheck } from 'lucide-react';

interface DesignSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesignSystemModal: React.FC<DesignSystemModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'typography' | 'components' | 'guidelines'>('tokens');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const colorTokens = [
    { name: 'Obsidian Canvas', hex: '#0A0D14', role: 'Global Low-Lighting Background', class: 'bg-[#0a0d14] text-white border border-slate-800' },
    { name: 'Card Surface', hex: '#0E1422', role: 'Container & Elevated Surfaces', class: 'bg-[#0e1422] text-white border border-slate-800' },
    { name: 'Subdued Border', hex: '#1E293B', role: 'Structural 1px Dividers', class: 'bg-slate-800 text-slate-300' },
    { name: 'Imperial Gold', hex: '#F59E0B', role: 'Primary Accent & Action Buttons', class: 'bg-amber-500 text-slate-950 font-bold' },
    { name: 'Pure White Text', hex: '#FFFFFF', role: 'High Contrast Primary Headings', class: 'bg-white text-slate-950 font-bold' },
    { name: 'Muted Slate', hex: '#94A3B8', role: 'Secondary Metadata & Labels', class: 'bg-slate-600 text-white' },
    { name: 'Semantic Emerald', hex: '#10B981', role: 'Success / Lunas / Selesai', class: 'bg-emerald-500 text-slate-950 font-bold' },
    { name: 'Semantic Sky', hex: '#0EA5E9', role: 'Logistics / Dalam Pengiriman', class: 'bg-sky-500 text-slate-950 font-bold' },
    { name: 'Semantic Rose', hex: '#F43F5E', role: 'Alert / Jatuh Tempo / Habis', class: 'bg-rose-500 text-white font-bold' },
  ];

  const typographyScale = [
    { level: 'Display / Page Title', size: '20px / 28px', weight: 'Bold (700)', sample: 'Ringkasan Eksekutif & Omset Bisnis' },
    { level: 'Section Title (H2)', size: '16px / 24px', weight: 'SemiBold (600)', sample: 'Katalog Produk & Transaksi Kasir' },
    { level: 'Card Header / Label (H3)', size: '13px / 18px', weight: 'SemiBold (600)', sample: 'Surat Jalan Pengiriman SJ-2026-0089' },
    { level: 'Body Regular', size: '12px / 16px', weight: 'Regular (400)', sample: 'Granit Valentino Gress Glazed Polished 60x60' },
    { level: 'Tabular Currency (Mono)', size: '14px / 20px', weight: 'Bold (700)', sample: 'Rp 1.842.500.000', isMono: true },
    { level: 'Micro Metadata', size: '10px / 14px', weight: 'Medium (500)', sample: 'SKU: GRN-VAL-6060 · Gudang BSD' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
      <div className="bg-[#0e1422] rounded-xl shadow-2xl border border-slate-800 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">PropertiERP Low-Lighting Design System</h2>
              <p className="text-xs text-slate-400">Palet temaram mewah, aksen emas champagne, tipografi kontras tinggi & presisi data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'tokens'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Color Tokens (Low-Lighting Gold)
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'typography'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Typography & Tabular Scale
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'components'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            UI Component Specs
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'guidelines'
                ? 'border-amber-400 text-amber-300 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Filosofi & Audit DOs / DON'Ts
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300">
          
          {activeTab === 'tokens' && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Palet Warna Temaram Rendah Silau (Low-Lighting Minimalist)</h3>
                <p className="text-xs text-slate-400">Dominasi obsidian gelap 60%, surface kontras 30%, dan aksen emas fungsional 10%.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {colorTokens.map((t, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-lg p-3 flex items-center justify-between bg-slate-900/50 hover:border-amber-500/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center text-xs font-bold ${t.class}`}>
                        Aa
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{t.name}</div>
                        <div className="text-[11px] text-slate-400">{t.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(t.hex, t.name)}
                      className="flex items-center gap-1 text-[11px] font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                      title="Copy HEX"
                    >
                      {copiedToken === t.name ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>{t.hex}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4">
                <h4 className="text-xs font-semibold text-white mb-2">Border Radius & Spatial Hierarchy</h4>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="p-2 border border-slate-800 rounded-sm bg-slate-900">`rounded-sm` (2px) - Tooltips</div>
                  <div className="p-2 border border-slate-800 rounded-md bg-slate-900">`rounded-md` (6px) - Inputs, Buttons</div>
                  <div className="p-2 border border-slate-800 rounded-lg bg-slate-900">`rounded-lg` (8px) - Cards, Tables</div>
                  <div className="p-2 border border-slate-800 rounded-xl bg-slate-900">`rounded-xl` (12px) - Modals, Panels</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">Hierarki Tipografi & Tabular Angka Monospace</h3>
                <p className="text-xs text-slate-400">Menggunakan `font-mono tabular-nums` untuk nominal Rupiah guna mencegah visual jitter saat angka diperbarui.</p>
              </div>

              <div className="space-y-3">
                {typographyScale.map((item, idx) => (
                  <div key={idx} className="p-3.5 border border-slate-800 rounded-lg bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="w-48 shrink-0">
                      <div className="text-xs font-semibold text-white">{item.level}</div>
                      <div className="text-[11px] text-slate-400">{item.size} · {item.weight}</div>
                    </div>
                    <div className={`flex-1 text-slate-200 ${item.isMono ? 'font-mono tabular-nums font-bold text-amber-300' : ''}`}>
                      {item.sample}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-white mb-3">Status Badges (Temaram Elegan & Aksesibel)</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Lunas / Selesai (Success)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Stok Menipis / Tempo (Warning)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    Dalam Perjalanan (Logistics)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    Jatuh Tempo / Habis (Danger)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white mb-3">Interactive Button States</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors shadow-xs">
                    Primary Gold CTA
                  </button>
                  <button className="px-4 py-2 text-xs font-medium text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors shadow-xs">
                    Secondary Dark
                  </button>
                  <button className="px-4 py-2 text-xs font-medium text-slate-300 bg-transparent border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                    Ghost Outline
                  </button>
                  <button disabled className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-900 border border-slate-800 rounded-lg cursor-not-allowed">
                    Disabled State
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white mb-3">Segmented Filter Tabs (Clickable Buttons)</h4>
                <div className="inline-flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="px-3 py-1.5 text-xs font-bold rounded-md bg-amber-500 text-slate-950 shadow-xs">
                    Semua Kategori
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white">
                    Keramik & Granit
                  </span>
                  <span className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white">
                    Semen & Mortar
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">✅ Prinsip Desain Terpilih (DOs)</h4>
                <ul className="text-xs text-emerald-400 space-y-1.5 list-disc list-inside">
                  <li><strong>Low-Lighting Mastery:</strong> Background temaram `#0a0d14` dan container `#0e1422` mengurangi ketegangan mata operator kasir & gudang yang menatap layar berjam-jam.</li>
                  <li><strong>Aksen Emas Champagne:</strong> Elemen penting (tombol utama, status piutang, total transaksi) menggunakan warna amber/emas untuk memancarkan kesan prestisius dan profesional.</li>
                  <li><strong>Tabular Figures (`tabular-nums`):</strong> Setiap nominal Rupiah menggunakan font monospace agar desimal dan digit sejajar rapi.</li>
                  <li><strong>Hairline Dividers:</strong> Garis tipis 1px `border-slate-800` memberikan struktur modular yang jelas tanpa visual noise.</li>
                </ul>
              </div>

              <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">❌ Larangan Anti-Pattern (DON'Ts)</h4>
                <ul className="text-xs text-rose-400 space-y-1.5 list-disc list-inside">
                  <li>Hindari gradasi neon menyolok gaya web3/crypto yang membuat silau.</li>
                  <li>Hindari teks abu-abu yang terlalu redup sehingga tidak lolos uji kontras keterbacaan (WCAG AA).</li>
                  <li>Hindari kartu kosong raksasa tanpa informasi data fungsional.</li>
                  <li>Hindari tombol mati tanpa respons interaktif.</li>
                </ul>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Standarisasi Tema Desain Low-Lighting Gold Enterprise ERP</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
          >
            Tutup Spesifikasi
          </button>
        </div>

      </div>
    </div>
  );
};
