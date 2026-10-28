/**
 * Chapa Client-Side Inline.js Payment Integration
 * Works seamlessly on static hosting (GitHub Pages) with no backend API needed.
 */

declare global {
  interface Window {
    ChapaCheckout?: (options: ChapaInlineOptions) => void;
  }
}

export interface ChapaInlineOptions {
  publicKey: string;
  amount: string | number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  title?: string;
  description?: string;
  callback_url?: string;
  return_url?: string;
  onSuccess?: (response?: any) => void;
  onClose?: () => void;
  callback?: (response?: any) => void;
}

export interface PaymentInitializationParams {
  amount: number;
  tier: string;
  fullName: string;
  phone: string;
  email?: string;
  cityOrRegion: string;
  dateOfBirth?: string;
  gender?: string;
  preferredLanguage?: string;
  photoUrl?: string;
  customPublicKey?: string;
}

// Get the configured Chapa Public Key (from env or localStorage or test fallback)
export const getChapaPublicKey = (): string => {
  const customKey = localStorage.getItem('halaba_chapa_public_key');
  if (customKey && customKey.trim().startsWith('CHAPUBK')) {
    return customKey.trim();
  }

  const envKey = import.meta.env.VITE_CHAPA_PUBLIC_KEY;
  if (envKey && envKey.trim().startsWith('CHAPUBK')) {
    return envKey.trim();
  }

  // Fallback public test key for Chapa sandbox
  return 'CHAPUBK_TEST-ocwF4q8h66W4Jksg3x86Rk5FqTq8gA0o';
};

// Ensure Chapa inline.js script is loaded in DOM
export const loadChapaInlineScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window.ChapaCheckout === 'function') {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="chapa.co"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      // In case it already loaded
      setTimeout(() => {
        resolve(typeof window.ChapaCheckout === 'function');
      }, 800);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.chapa.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};
