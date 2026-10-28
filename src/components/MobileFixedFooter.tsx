import React from 'react';
import { useClub, PageRoute } from '../context/ClubContext';
import { Home, Calendar, Trophy, UserPlus, ShoppingBag } from 'lucide-react';

export const MobileFixedFooter: React.FC = () => {
  const { t, currentPage, setCurrentPage } = useClub();

  const navButtons = [
    {
      id: 'home' as PageRoute,
      label: t.navHome || 'Home',
      icon: <Home className="w-5 h-5" />,
      onClick: () => setCurrentPage('home'),
      isActive: currentPage === 'home',
    },
    {
      id: 'fixtures' as PageRoute,
      label: t.navFixtures || 'Matches',
      icon: <Calendar className="w-5 h-5" />,
      onClick: () => setCurrentPage('fixtures'),
      isActive: currentPage === 'fixtures',
    },
    {
      id: 'standings' as PageRoute,
      label: t.navStandings || 'Table',
      icon: <Trophy className="w-5 h-5" />,
      onClick: () => setCurrentPage('standings'),
      isActive: currentPage === 'standings',
    },
    {
      id: 'membership' as PageRoute,
      label: 'Fan Pass',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: () => setCurrentPage('membership'),
      isActive: currentPage === 'membership',
    },
    {
      id: 'shop' as PageRoute,
      label: t.navShop || 'Store',
      icon: <ShoppingBag className="w-5 h-5" />,
      onClick: () => setCurrentPage('shop'),
      isActive: currentPage === 'shop',
    },
  ];

  if (currentPage === 'admin') return null;

  return (
    <nav 
      aria-label="Mobile Navigation Bar" 
      className="fixed bottom-0 left-0 right-0 z-50 h-16 px-2 flex items-center justify-around sm:hidden shadow-2xl border-t border-[#31111c] bg-[#090e17]/95 backdrop-blur-md"
    >
      {navButtons.map((btn) => (
        <button
          key={btn.id}
          onClick={btn.onClick}
          className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-transform active:scale-95 ${
            btn.isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className={`transition-colors ${btn.isActive ? 'text-amber-400 scale-110' : 'text-slate-400'}`}>
            {btn.icon}
          </span>
          <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px] font-medium">
            {btn.label}
          </span>
          {btn.isActive && (
            <span className="w-1.5 h-1 bg-amber-400 rounded-full mt-0.5" />
          )}
        </button>
      ))}
    </nav>
  );
};
