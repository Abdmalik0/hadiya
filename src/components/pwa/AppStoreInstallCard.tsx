import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useClub } from '../../context/ClubContext';
import { HalabaCrest } from '../HalabaCrest';
import {
  Download,
  Share2,
  PlusSquare,
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface AppStoreInstallCardProps {
  mode?: 'modal' | 'embedded';
  onClose?: () => void;
}

export const AppStoreInstallCard: React.FC<AppStoreInstallCardProps> = ({
  mode = 'embedded',
  onClose,
}) => {
  const { language } = useClub();
  const { isInstalled, isIOS } = usePWAInstall();

  // If the app is already installed on mobile, remove it from the screen completely
  if (isInstalled) {
    return null;
  }

  // Active OS choice: 'android' or 'ios'
  const [selectedOS, setSelectedOS] = useState<'android' | 'ios'>(() => {
    return isIOS ? 'ios' : 'android';
  });

  const [downloadStarted, setDownloadStarted] = useState(false);

  // One-click direct APK download handler
  const handleDownloadAPK = () => {
    setDownloadStarted(true);
    const link = document.createElement('a');
    link.href = '/HalabaCityFC-v1.0-debug.apk';
    link.download = 'HalabaCityFC-v1.0-debug.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const content = (
    <div className="w-full bg-neutral-950 text-white rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden font-sans">
      {/* Header bar */}
      <div className="bg-neutral-900/90 backdrop-blur-md px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HalabaCrest size={36} />
          <div>
            <h3 className="font-sports font-black text-sm text-white uppercase tracking-wider">
              {language === 'am' ? 'የሀላባ ከተማ ሞባይል መተግበሪያ' : 'HALABA City FC App'}
            </h3>
            <p className="text-xxs text-emerald-400 font-medium">
              {language === 'am' ? 'ይፋዊ የስልክ መተግበሪያ' : 'Official Club Mobile App'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {/* Simple & Clear Choice: Android or iOS */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-neutral-900 rounded-2xl border border-neutral-800">
          <button
            onClick={() => {
              setSelectedOS('android');
              setDownloadStarted(false);
            }}
            className={`py-3 px-4 rounded-xl font-sports font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedOS === 'android'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-950/60 scale-[1.01]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4567c.1082-.1875.0441-.4282-.1434-.5364-.1878-.1082-.4283-.0441-.5365.1434l-2.0227 3.503c-1.5583-.7104-3.3242-1.1217-5.1749-1.1217-1.8507 0-3.6166.4113-5.1749 1.1217L4.8007 5.4717c-.1082-.1875-.3487-.2516-.5365-.1434-.1875.1082-.2516.3489-.1434.5364l1.996 3.4567C2.6885 11.1611.3438 14.9392.0001 19.3496h23.9998c-.3437-4.4104-2.6884-8.1885-6.1199-10.0282" />
            </svg>
            <span>Android (APK)</span>
          </button>

          <button
            onClick={() => {
              setSelectedOS('ios');
            }}
            className={`py-3 px-4 rounded-xl font-sports font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedOS === 'ios'
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-950/60 scale-[1.01]'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.9c.62-.75 1.04-1.8 0.92-2.9-.9.04-2 .6-2.65 1.35-.58.65-1.09 1.73-.95 2.8 1.01.08 2.06-.5 2.68-1.25z" />
            </svg>
            <span>iOS (iPhone)</span>
          </button>
        </div>

        {/* ANDROID OPTION */}
        {selectedOS === 'android' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-emerald-500/30 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Download className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-sports font-black text-lg text-white uppercase tracking-wide">
                  {language === 'am' ? 'የአንድሮይድ መተግበሪያ (APK) አውርድ' : 'Halaba City FC Android APK'}
                </h4>
                <p className="text-xs text-neutral-300 mt-1">
                  {language === 'am'
                    ? 'አንድሮይድ ስቱዲዮ ሳያስፈልግ በGitHub የተሰራ ይፋዊ የክለቡ መተግበሪያ ፋይል'
                    : 'Official Android APK package built automatically via GitHub Actions.'}
                </p>
              </div>

              {/* 1-Click Direct Download Button */}
              <button
                onClick={handleDownloadAPK}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-sports font-black text-base uppercase tracking-wider shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 hover:scale-[1.01] cursor-pointer"
              >
                <Download className="w-5 h-5 animate-bounce" />
                <span>{language === 'am' ? 'አሁን አውርድ (Direct APK Download)' : 'Download Android APK'}</span>
              </button>

              {downloadStarted && (
                <div className="p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-left flex items-start gap-3 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200">
                    <strong className="block text-white font-bold">
                      {language === 'am' ? 'ማውረድ ተጀምሯል!' : 'Download Started!'}
                    </strong>
                    <span>
                      {language === 'am'
                        ? 'ፋይሉ ወርዶ ሲጠናቀቅ ማሳወቂያውን (Notification) ወይም የስልክዎን Downloads ፎልደር ከፍተው Install ያድርጉት።'
                        : 'Once downloaded, open the HalabaCityFC-v1.0-debug.apk from your notifications or Downloads folder to install.'}
                    </span>
                  </div>
                </div>
              )}

              {/* 2 Simple Steps */}
              <div className="pt-2 text-left space-y-2 border-t border-neutral-800">
                <p className="text-xxs font-bold text-neutral-400 uppercase tracking-wider">
                  {language === 'am' ? 'የአጫጫን ቅደም ተከተል፡' : 'Quick Install Steps:'}
                </p>
                <div className="space-y-1.5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center font-bold text-xxs shrink-0">
                      1
                    </span>
                    <span>{language === 'am' ? 'የወረደውን APK ፋይል ይጫኑ' : 'Tap the downloaded APK file'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center font-bold text-xxs shrink-0">
                      2
                    </span>
                    <span>{language === 'am' ? '“Install” የሚለውን ይጫኑ (ፍቃድ ከጠየቀ “Allow from this source” ይምረጡ)' : 'Tap "Install" (Allow unknown apps if prompted)'}</span>
                  </div>
                </div>
              </div>

              {/* Secondary link to GitHub Releases */}
              <div className="pt-2 text-center">
                <a
                  href="https://github.com/abdpriin/halaba-fc/releases"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xxs text-neutral-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                  <span>{language === 'am' ? 'በGitHub Releases ለማየት' : 'View GitHub Releases & Workflow'}</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* IOS OPTION (Keep PWA) */}
        {selectedOS === 'ios' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-blue-900/40 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-sports font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>{language === 'am' ? 'የአይፎን ሳፋሪ አጫጫን መመሪያ' : 'Apple iOS Safari Installation (PWA)'}</span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-300">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white">
                      {language === 'am' ? 'በሳፋሪ ታችኛው ክፍል የShare ምልክትን ይጫኑ' : 'Tap the Safari Share button'}
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-blue-400 font-semibold text-xxs mt-1.5">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{language === 'am' ? 'Share (አጋራ)' : 'Share'}</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white">
                      {language === 'am' ? 'ወደ ታች ዝቅ ብለው “Add to Home Screen” ይጫኑ' : 'Select "Add to Home Screen"'}
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-white font-semibold text-xxs mt-1.5">
                      <PlusSquare className="w-3.5 h-3.5 text-neutral-300" />
                      <span>Add to Home Screen</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-white">
                      {language === 'am' ? 'በቀኝ በኩል “Add” የሚለውን ይጫኑ' : 'Tap "Add" in top-right'}
                    </span>
                    <p className="text-xxs text-neutral-400 mt-0.5">
                      {language === 'am'
                        ? 'ይፋዊው የሀላባ ከተማ ክለብ መተግበሪያ አርማ በስልክዎ ዋና ገጽ ላይ ይቀመጣል!'
                        : 'The Halaba City FC app icon will appear on your home screen and open in standalone mode!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xxs text-neutral-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'am' ? 'የተረጋገጠ ይፋዊ የሀላባ ከተማ እግርኳስ ክለብ ሶፍትዌር' : 'Verified Official Halaba City FC Software'}</span>
        </div>
      </div>
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="max-w-md w-full max-h-[92vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
