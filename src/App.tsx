import React, { useState, useEffect } from 'react';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { ClubProvider, useClub } from './context/ClubContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileFixedFooter } from './components/MobileFixedFooter';
import { HomePage } from './pages/HomePage';
import { FixturesPage } from './pages/FixturesPage';
import { StandingsPage } from './pages/StandingsPage';
import { NewsPage } from './pages/NewsPage';
import { MembershipPage } from './pages/MembershipPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { ShopPage } from './pages/ShopPage';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { ArticleModal } from './components/ArticleModal';
import { ClubDossierModal } from './components/ClubDossierModal';
import { LiveNotificationToast } from './components/LiveNotificationToast';
import { DonationModal } from './components/DonationModal';
import { JerseyCheckoutModal } from './components/JerseyCheckoutModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { AppStoreInstallCard } from './components/pwa/AppStoreInstallCard';
import { OfflineInterruptedOverlay } from './components/pwa/OfflineInterruptedOverlay';
import { AppStartupLoader } from './components/AppStartupLoader';

const MainApp: React.FC = () => {
  const { currentPage, matches, news, isDossierOpen, closeDossier } = useClub();
  const { isInstalled, isInstallModalOpen, openInstallModal, closeInstallModal } = usePWAInstall();

  // Modals state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Free Over-The-Air Update: Confirm update stability upon successful mount to prevent rollbacks
  useEffect(() => {
    const confirmAppReady = async () => {
      try {
        await CapacitorUpdater.notifyAppReady();
        console.log('[CapacitorUpdater] notifyAppReady() confirmed update stability');
      } catch (err) {
        // Gracefully ignored in standard web/dev environments where native plugin is not active
        console.debug('[CapacitorUpdater] notifyAppReady note:', err);
      }
    };
    confirmAppReady();
  }, []);

  const activeMatch = selectedMatchId ? matches.find((m) => m.id === selectedMatchId) || null : null;
  const activeArticle = selectedArticleId ? news.find((n) => n.id === selectedArticleId) || null : null;

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col bg-[#070b13] text-slate-100 selection:bg-[#831627] selection:text-amber-200 font-sans overscroll-y-none">
      {/* App Opening Splash Screen with loading icon and translucent backdrop */}
      <AppStartupLoader minDurationMs={1200} />

      {/* Top Navigation */}
      <Navbar onOpenInstallModal={openInstallModal} isInstalled={isInstalled} />

      {/* Floating Live Goal & Standings Notifications */}
      <LiveNotificationToast />

      {/* Graceful Offline Interruption Layer */}
      <OfflineInterruptedOverlay />

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden pb-28 sm:pb-0">
        {currentPage === 'home' && (
          <HomePage
            onOpenMatchModal={(id) => setSelectedMatchId(id)}
            onOpenArticleModal={(id) => setSelectedArticleId(id)}
          />
        )}
        {currentPage === 'fixtures' && (
          <FixturesPage onOpenMatchModal={(id) => setSelectedMatchId(id)} />
        )}
        {currentPage === 'standings' && <StandingsPage />}
        {currentPage === 'news' && (
          <NewsPage onOpenArticleModal={(id) => setSelectedArticleId(id)} />
        )}
        {currentPage === 'membership' && <MembershipPage />}
        {currentPage === 'shop' && <ShopPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'admin' && <AdminPage />}
      </main>

      {/* Mobile Fixed Footer */}
      <MobileFixedFooter />

      {/* Footer */}
      <Footer />

      {/* App Store Style Download Modal */}
      {isInstallModalOpen && !isInstalled && (
        <AppStoreInstallCard mode="modal" onClose={closeInstallModal} />
      )}

      {/* Modals */}
      <MatchDetailsModal
        match={activeMatch}
        onClose={() => setSelectedMatchId(null)}
      />
      <ArticleModal
        article={activeArticle}
        onClose={() => setSelectedArticleId(null)}
      />
      <ClubDossierModal
        isOpen={isDossierOpen}
        onClose={closeDossier}
      />
      <DonationModal />
      <JerseyCheckoutModal />
    </div>
  );
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#7e1426] flex items-center justify-center mb-4 text-amber-300 font-bold text-2xl border border-amber-500/30">
            !
          </div>
          <h2 className="text-xl font-bold font-sports mb-2">Hadiya Hossana FC</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md">
            The app encountered an unexpected issue while loading data. Please reload to resume.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-[#7e1426] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#99192e] transition-colors border border-amber-500/30"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ClubProvider>
        <MainApp />
      </ClubProvider>
    </ErrorBoundary>
  );
}
