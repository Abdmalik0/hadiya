import React, { useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useClub } from '../../context/ClubContext';
import { HalabaCrest } from '../HalabaCrest';
import { WifiOff, RefreshCw, X, ShieldCheck } from 'lucide-react';

export const OfflineInterruptedOverlay: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useClub();
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  // When back online, reset dismissal state
  if (isOnline) {
    return null;
  }

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <>
      {/* 1. Floating Non-Intrusive Offline Status Bar */}
      {!isBannerDismissed && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slide-up">
          <div className="p-3.5 rounded-2xl bg-neutral-900/95 border border-red-500/40 text-white shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 shrink-0">
                <WifiOff className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-sports font-bold text-xs uppercase tracking-wider text-red-400">
                    {language === 'am' ? 'የኢንተርኔት ግንኙነት ተቋርጧል' : 'Connection Interrupted'}
                  </span>
                </div>
                <p className="text-xxs text-neutral-300 truncate">
                  {language === 'am'
                    ? 'ከመስመር ውጭ ሁነታ • የተቀመጡ መረጃዎች ይገኛሉ'
                    : 'Operating in Offline Mode • Cached standings & roster active'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowFullModal(true)}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xxs font-bold uppercase transition-colors cursor-pointer"
              >
                {language === 'am' ? 'ዝርዝር' : 'Details'}
              </button>
              <button
                onClick={handleRetry}
                className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                title={language === 'am' ? 'እንደገና ሞክር' : 'Retry Connection'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsBannerDismissed(true)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Native "Connection Interrupted" Modal */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <HalabaCrest size={64} showGlow />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-600 border-2 border-neutral-950 flex items-center justify-center text-white">
                  <WifiOff className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xxs font-bold uppercase tracking-wider mb-1">
                <span>{language === 'am' ? 'ከመስመር ውጭ የማገልገል ሞተር ነቅቷል' : 'Native Offline Engine Active'}</span>
              </div>
              <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
                {language === 'am' ? 'የኢንተርኔት ግንኙነት ተቋርጧል' : 'Connection Interrupted'}
              </h3>
              <p className="text-emerald-400 font-ethiopic text-xs">
                {language === 'am' ? 'የተቀመጡ የክለቡ መረጃዎች ያለማቋረጥ ይሰራሉ' : 'የኢንተርኔት ግንኙነት ተቋርጧል • ከመስመር ውጭ'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-left space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2 text-white font-bold font-sports uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'am' ? 'ከመስመር ውጭ የሚያገኟቸው አገልግሎቶች፡' : 'What remains available offline:'}</span>
              </div>
              <ul className="space-y-1 text-xxs text-neutral-400 pl-6 list-disc">
                <li>{language === 'am' ? 'የተቀመጠው የኢትዮጵያ ፕሪሚየር ሊግ ሰንጠረዥና ውጤቶች' : 'Saved Premier League Table & Results'}</li>
                <li>{language === 'am' ? 'የተጫዋቾች ስብስብ መረጃ እና ስታቲስቲክስ' : 'Player Squad Profiles & Statistics'}</li>
                <li>{language === 'am' ? 'ቀደም ሲል የተጫኑ የክለቡ ዜናዎችና የጨዋታ ዘገባዎች' : 'Previously Loaded Club News & Match Previews'}</li>
                <li>{language === 'am' ? 'የዲጂታል ደጋፊ የአባልነት መታወቂያ ካርድ' : 'Digital Supporter Membership Card'}</li>
              </ul>
              <p className="text-xxs text-neutral-500 pt-1">
                {language === 'am'
                  ? 'የኦንላይን ክፍያዎች (በቻፓ) እና የቀጥታ ዳታ ማመሳሰል ኢንተርኔት እንደተመለሰ ወዲያውኑ ይቀጥላሉ።'
                  : 'Online payment submissions (Chapa) and live Firestore publishing will resume as soon as internet connectivity returns.'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleRetry}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-sports font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'am' ? 'ግንኙነትን በድጋሚ ሞክር' : 'Retry Connection'}</span>
              </button>

              <button
                onClick={() => setShowFullModal(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-sports font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {language === 'am' ? 'ከመስመር ውጭ ቀጥል' : 'Continue in Offline Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
