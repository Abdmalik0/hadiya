import React, { useState } from 'react';
import { useClub, PageRoute } from '../context/ClubContext';
import { HadiyaCrest } from './HadiyaCrest';
import { Language } from '../types';
import {
  Menu,
  X,
  Globe,
  Calendar,
  Trophy,
  Newspaper,
  UserPlus,
  ShoppingBag,
  Info,
  Phone,
  Lock,
  ChevronDown,
  Smartphone,
  Flame,
} from 'lucide-react';

interface NavbarProps {
  onOpenInstallModal?: () => void;
  isInstalled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenInstallModal, isInstalled = false }) => {
  const { language, setLanguage, t, currentPage, setCurrentPage, isAdminLoggedIn, openDossier, openDonationModal } = useClub();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems: Array<{ id: PageRoute; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.navHome, icon: null },
    { id: 'fixtures', label: t.navFixtures, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'standings', label: t.navStandings, icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'news', label: t.navNews, icon: <Newspaper className="w-3.5 h-3.5" /> },
    { id: 'shop', label: t.navShop, icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'membership', label: t.navMembership, icon: <UserPlus className="w-3.5 h-3.5" /> },
    { id: 'about', label: t.navAbout, icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'contact', label: t.navContact, icon: <Phone className="w-3.5 h-3.5" /> },
  ];

  const handleNavClick = (page: PageRoute) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  const languageLabels: Record<Language, { label: string; sub: string }> = {
    en: { label: 'English', sub: 'EN' },
    am: { label: 'አማርኛ', sub: 'አማ' },
    om: { label: 'Afaan Oromoo', sub: 'OM' },
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f18]/95 backdrop-blur-md border-b border-[#25101a] text-slate-100 shadow-2xl transition-all">
      {/* Top Matchday & Heritage Strip */}
      <div className="bg-gradient-to-r from-[#470914] via-[#20070e] to-[#0a0f18] text-xs px-4 sm:px-8 py-1.5 border-b border-[#5e1220]/40 flex justify-between items-center text-slate-300">
        <div className="flex items-center gap-2 sm:gap-3 text-xxs sm:text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold tracking-wide text-amber-400 font-sports">
            <Flame className="w-3 h-3 text-amber-400" />
            HADIYA HOSSANA FC
          </span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
          <span className="hidden sm:inline font-ethiopic text-slate-300">ነብሮቹ (ርግቦቹ)</span>
          <span className="text-slate-600 hidden md:inline" aria-hidden="true">·</span>
          <span className="hidden md:inline text-slate-400">Abiyo Ermias Stadium</span>
          <span className="text-slate-600 hidden lg:inline" aria-hidden="true">·</span>
          <span className="hidden lg:inline text-amber-300/90 font-medium">Ethiopian Premier League 2026/27</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Dossier Button */}
          <button
            onClick={openDossier}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#661120]/40 hover:bg-[#661120]/70 border border-amber-500/30 text-amber-200 text-xxs sm:text-xs font-semibold transition-colors active:scale-95"
            title="Hadiya Hossana Club Dossier & Honors"
          >
            <Trophy className="w-3 h-3 text-amber-400" />
            <span className="hidden xs:inline">Club Dossier</span>
          </button>

          {/* Mobile App Install */}
          {!isInstalled && onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xxs sm:text-xs font-semibold transition-colors active:scale-95"
            >
              <Smartphone className="w-3 h-3" />
              <span>Get App</span>
            </button>
          )}

          {/* Admin link */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xxs transition-colors ${
              currentPage === 'admin'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>

      {/* Main One-Row Three-Zone Header Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Single Brand Zone */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 transition-transform active:scale-98 shrink-0"
        >
          <HadiyaCrest size="md" glow withRing />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sports uppercase leading-tight group-hover:text-amber-300 transition-colors">
                HADIYA HOSSANA
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider bg-[#7c1426] text-amber-200 font-mono">
                FC
              </span>
            </div>
            <span className="text-[11px] text-amber-400/90 font-medium font-ethiopic tracking-wide">
              ሀዲያ ሆሳዕና እግር ኳስ ክለብ
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors whitespace-nowrap rounded-md relative ${
                  isActive
                    ? 'text-amber-300 bg-[#3d0913]/60 shadow-sm border border-amber-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-[#d97706] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action + Language Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141b29] hover:bg-[#1b2436] border border-slate-700/60 text-xs text-slate-200 transition-colors"
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">{languageLabels[language]?.sub || 'EN'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#0d131f] border border-[#2d1b28] rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                {(['en', 'am', 'om'] as Language[]).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => handleLangChange(lng)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      language === lng
                        ? 'bg-[#661120] text-amber-200 font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{languageLabels[lng]?.label || lng}</span>
                    <span className="text-[10px] opacity-75 font-mono">{languageLabels[lng]?.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Action Button: Join Tigers Membership */}
          <button
            onClick={() => handleNavClick('membership')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7e1426] via-[#94192e] to-[#b31e38] hover:from-[#94192e] hover:to-[#c42542] text-white text-xs font-bold tracking-wide uppercase transition-all shadow-lg shadow-[#7e1426]/30 border border-amber-500/30 active:scale-95 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Join Fan Club</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#141b29] text-slate-300 hover:text-white border border-slate-700/60"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c121e] border-b border-[#2d121c] px-4 py-4 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                    isActive
                      ? 'bg-[#7e1426] text-amber-200 border border-amber-500/30'
                      : 'bg-[#141b29]/70 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {item.icon && <span className="text-amber-400">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => handleNavClick('membership')}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#7e1426] to-[#a31a31] text-white text-xs font-bold uppercase text-center border border-amber-500/30"
            >
              {t.navJoinBtn}
            </button>
            <button
              onClick={() => {
                openDonationModal();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold"
            >
              Support Club
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
