import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Module-level global prompt capture so we never miss early events before React hydration
let globalPromptEvent: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalPromptEvent = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    globalPromptEvent = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => globalPromptEvent);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    // Detect if running as standalone native app (installed on mobile)
    const checkStandalone = () => {
      if (typeof window === 'undefined') return false;
      const isMediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isCapacitorNative = Boolean(
        (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
      );
      const isQueryApp =
        window.location.search.includes('source=pwa') ||
        window.location.search.includes('source=apk') ||
        window.location.search.includes('mode=app') ||
        window.location.search.includes('installed=true');
      const isReferrerApp = typeof document !== 'undefined' && document.referrer?.includes('android-app://');

      return isMediaStandalone || isNavStandalone || isCapacitorNative || isQueryApp || isReferrerApp;
    };

    setIsInstalled(checkStandalone());

    // User-agent detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    if (globalPromptEvent && !deferredPrompt) {
      setDeferredPrompt(globalPromptEvent);
    }

    const handlePromptReady = () => {
      setDeferredPrompt(globalPromptEvent);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalPromptEvent = null;
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('pwa-installed', handleAppInstalled);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('pwa-installed', handleAppInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  /**
   * CRITICAL: Must be invoked synchronously inside the user's click event handler
   * to satisfy the browser's User Activation requirement.
   */
  const triggerNativeInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptToUse = deferredPrompt || globalPromptEvent;

    if (!promptToUse) {
      console.warn('PWA: beforeinstallprompt is not available on this browser/session.');
      return 'unavailable';
    }

    try {
      // Trigger prompt immediately within user gesture context
      await promptToUse.prompt();
      const choice = await promptToUse.userChoice;

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        globalPromptEvent = null;
        setDeferredPrompt(null);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('PWA prompt execution error:', err);
      return 'unavailable';
    }
  };

  const openInstallModal = () => setIsInstallModalOpen(true);
  const closeInstallModal = () => setIsInstallModalOpen(false);

  return {
    isInstallable: !!(deferredPrompt || globalPromptEvent) || isIOS,
    hasNativePrompt: !!(deferredPrompt || globalPromptEvent),
    isInstalled,
    isIOS,
    isAndroid,
    isInstallModalOpen,
    openInstallModal,
    closeInstallModal,
    triggerNativeInstall,
  };
}
