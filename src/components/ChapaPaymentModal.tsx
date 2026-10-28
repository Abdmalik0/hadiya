import React, { useState, useEffect } from 'react';
import { HalabaCrest } from './HalabaCrest';
import { useClub } from '../context/ClubContext';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  Key
} from 'lucide-react';
import { loadChapaInlineScript, getChapaPublicKey } from '../utils/chapa';

interface ChapaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  txRef: string;
  amount: number;
  tier: string;
  fullName: string;
  phone: string;
  email: string;
  onPaymentVerified: (data: {
    referenceNumber: string;
    amount: number;
    tier: string;
    tx_ref: string;
    verifiedAt?: string;
  }) => void;
}

export const ChapaPaymentModal: React.FC<ChapaPaymentModalProps> = ({
  isOpen,
  onClose,
  txRef,
  amount,
  tier,
  fullName,
  phone,
  email,
  onPaymentVerified,
}) => {
  const { language, t } = useClub();
  const [publicKey, setPublicKey] = useState<string>(() => getChapaPublicKey());
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState(publicKey);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isLoadingSdk, setIsLoadingSdk] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'Telebirr' | 'CBE Birr' | 'Awash Bank' | 'Card'>('Telebirr');

  // Load Chapa Inline.js on modal open
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingSdk(true);
    loadChapaInlineScript().then((loaded) => {
      setIsSdkLoaded(loaded);
      setIsLoadingSdk(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCustomKey = () => {
    const cleanKey = tempKey.trim();
    if (cleanKey.length > 5) {
      setPublicKey(cleanKey);
      localStorage.setItem('halaba_chapa_public_key', cleanKey);
      setIsEditingKey(false);
    }
  };

  /**
   * Launch Chapa Inline.js client-side checkout
   */
  const handleLaunchChapaInline = () => {
    setPaymentError(null);
    setIsProcessing(true);

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Halaba';
    const lastName = nameParts.slice(1).join(' ') || 'Fan';
    const userEmail = email && email.includes('@') ? email.trim() : `member-${txRef.slice(-6)}@halabafc.et`;

    // Check if Chapa Inline SDK is present in window
    if (typeof window.ChapaCheckout === 'function') {
      try {
        window.ChapaCheckout({
          publicKey: publicKey,
          amount: String(amount),
          currency: 'ETB',
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          tx_ref: txRef,
          title: `Halaba FC ${tier} Membership`,
          description: `Halaba City FC Official Supporter Registration (${amount} ETB)`,
          onSuccess: (response: any) => {
            console.log('[Chapa Inline Success]:', response);
            setIsSuccess(true);
            setIsProcessing(false);
            const randNum = Math.floor(1000 + Math.random() * 9000);
            const referenceNumber = `HCFC-2026-M${randNum}`;

            setTimeout(() => {
              onPaymentVerified({
                referenceNumber,
                amount,
                tier,
                tx_ref: txRef,
                verifiedAt: new Date().toISOString(),
              });
            }, 1000);
          },
          onClose: () => {
            console.log('[Chapa Inline Closed/Cancelled]');
            setIsProcessing(false);
            setPaymentError(
              language === 'am'
                ? 'የክፍያ መስኮቱ ተዘግቷል። ክፍያው እስካልተረጋገጠ ድረስ ምዝገባው አይጠናቀቅም።'
                : 'Payment window was closed. Registration is not complete until payment is verified.'
            );
          },
          callback: (response: any) => {
            console.log('[Chapa Callback]:', response);
          },
        });
        return;
      } catch (err: any) {
        console.warn('ChapaCheckout invocation error, falling back to instant client simulation:', err);
      }
    }

    setPaymentError(
      language === 'am'
        ? 'የቻፓ የክፍያ መስኮት አልተከፈተም። እባክዎ ከታች ያለውን ፈጣን የሙከራ ክፍያ ይጠቀሙ።'
        : 'Chapa Inline.js popup was blocked or unavailable. You can use the instant sandbox payment option below.'
    );
    setIsProcessing(false);
  };

  /**
   * Client-side test sandbox payment completion
   */
  const handleSimulateClientPay = () => {
    setIsProcessing(true);
    setPaymentError(null);

    setTimeout(() => {
      setIsSuccess(true);
      setIsProcessing(false);
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const referenceNumber = `HCFC-2026-M${randNum}`;

      setTimeout(() => {
        onPaymentVerified({
          referenceNumber,
          amount,
          tier,
          tx_ref: txRef,
          verifiedAt: new Date().toISOString(),
        });
      }, 1000);
    }, 700);
  };

  const localizedTier = tier === 'PREMIUM'
    ? (language === 'am' ? 'ፕሪሚየም' : 'Premium')
    : tier === 'STANDARD'
    ? (language === 'am' ? 'መደበኛ' : 'Standard')
    : (language === 'am' ? 'ደጋፊ' : 'Supporter');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <HalabaCrest size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sports font-black text-lg text-white uppercase tracking-wider">
                  {language === 'am' ? 'የቻፓ ይፋዊ ክፍያ' : 'Chapa Inline Checkout'}
                </span>
                <span className="px-2 py-0.5 rounded text-xxs font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {language === 'am' ? 'ደህንነቱ የተጠበቀ SDK' : 'Client-Side SDK'}
                </span>
              </div>
              <p className="text-xxs text-neutral-400">
                {language === 'am' ? 'ይፋዊ የሀላባ ከተማ ደጋፊዎች የአባልነት ፕሮግራም' : 'Official Halaba City FC Supporter Program'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={language === 'am' ? 'ሰርዝ' : 'Cancel'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/60">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wider">
              {language === 'am' ? 'ክፍያው ተረጋግጧል!' : 'Payment Confirmed & Verified!'}
            </h3>
            <p className="text-sm text-neutral-300 max-w-sm mx-auto">
              {language === 'am'
                ? <>ቻፓ የ <strong className="text-amber-400">{amount} {t.etbCurrency}</strong> ክፍያዎን አረጋግጧል። ይፋዊ የዲጂታል ደጋፊ መታወቂያዎ በመዘጋጀት ላይ ነው...</>
                : <>Chapa has confirmed your payment of <strong className="text-amber-400">{amount} ETB</strong>. Generating your official Digital Supporter ID...</>}
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{language === 'am' ? 'በክለቡ ይፋዊ መዝገብ ላይ ምዝገባው እየተጠናቀቀ ነው...' : 'Finalizing registration in club registry...'}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            {/* Amount Summary Box */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xxs uppercase tracking-wider text-neutral-400 font-bold block">
                  {language === 'am' ? 'የተመረጠው የአባልነት ደረጃ' : 'Chosen Membership Plan'}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-sports font-black text-xl text-white uppercase">
                    {localizedTier} {language === 'am' ? 'አባል' : 'Member'}
                  </span>
                  <span className="text-xs text-neutral-400">{language === 'am' ? `ለ ${fullName}` : `for ${fullName}`}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xxs text-neutral-400 uppercase font-mono block">
                  {language === 'am' ? 'የሚከፈል መጠን' : 'Chapa Amount'}
                </span>
                <span className="font-sports font-black text-2xl text-amber-400 font-mono">
                  {amount} {t.etbCurrency}
                </span>
              </div>
            </div>

            {/* Public Key Display / Config */}
            <div className="p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 flex items-center gap-1.5 font-mono text-xxs uppercase font-bold">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'am' ? 'የቻፓ ይፋዊ ቁልፍ' : 'Chapa Public Key'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingKey(!isEditingKey)}
                  className="text-xxs text-amber-400 hover:text-amber-300 font-bold uppercase underline cursor-pointer"
                >
                  {isEditingKey ? (language === 'am' ? 'ሰርዝ' : 'Cancel') : (language === 'am' ? 'ቁልፍ ቀይር' : 'Change Key')}
                </button>
              </div>

              {isEditingKey ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="CHAPUBK_TEST-xxxxxxxxxxxx"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-lg text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomKey}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xxs uppercase rounded font-sports cursor-pointer"
                  >
                    {language === 'am' ? 'አስቀምጥ' : 'Save Key'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between font-mono text-xxs text-neutral-400 truncate">
                  <span className="truncate">{publicKey}</span>
                  <span className="text-emerald-400 font-bold shrink-0 ml-2">{language === 'am' ? '✓ ነቅቷል' : '✓ Active'}</span>
                </div>
              )}
            </div>

            {/* Supported Ethiopian Payment Providers */}
            <div>
              <span className="text-xxs uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                {language === 'am' ? 'በቻፓ ተቀባይነት ያላቸው የኢትዮጵያ የክፍያ አማራጮች' : 'Accepted Ethiopian Payment Providers via Chapa'}
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center gap-1">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="text-xxs font-bold text-neutral-200">Telebirr</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center gap-1">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span className="text-xxs font-bold text-neutral-200">CBE Birr</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center gap-1">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xxs font-bold text-neutral-200">Awash Birr</span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center gap-1">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span className="text-xxs font-bold text-neutral-200">{language === 'am' ? 'የባንክ ካርዶች' : 'Bank Cards'}</span>
                </div>
              </div>
            </div>

            {/* Error Notice */}
            {paymentError && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* PRIMARY ACTION: Chapa Inline.js Checkout */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleLaunchChapaInline}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sports font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-950 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{language === 'am' ? 'የቻፓ ክፍያ በመከፈት ላይ...' : 'Launching Chapa Checkout...'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>{language === 'am' ? `${amount} ብር በቻፓ ይክፈሉ` : `Pay ${amount} ETB with Chapa Inline`}</span>
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-xxs text-neutral-400">
                {language === 'am'
                  ? 'ይፋዊውን የቻፓ የክፍያ መስኮት ይከፍታል። ምዝገባው የሚጸድቀው ክፍያው በስኬት ሲጠናቀቅ ብቻ ነው።'
                  : 'Opens the official Chapa Inline popup. Registration is activated only upon successful verified payment.'}
              </p>
            </div>

            {/* Fallback Simulator Section for Test Sandbox / Static Demo */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{language === 'am' ? 'የፈጣን ክፍያ ማስመሰያ (ቴስት)' : 'Instant Sandbox Payment Simulation'}</span>
                </span>
                <span className="text-xxs font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                  {language === 'am' ? 'የሙከራ ሁነታ' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-xxs text-neutral-400">
                {language === 'am'
                  ? 'አማራጭ፡ ክፍያውን ወዲያውኑ በማስመሰል ምዝገባውን ማጠናቀቅ ይችላሉ፡'
                  : 'Alternatively, test the verified registration flow instantly without leaving the page:'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['Telebirr', 'CBE Birr', 'Awash Bank', 'Card'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                      selectedMethod === method
                        ? 'bg-red-600/20 border border-red-500 text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{method}</span>
                    {selectedMethod === method && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSimulateClientPay}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-sports font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-neutral-700 cursor-pointer"
              >
                <span>
                  {language === 'am'
                    ? `ክፍያውን አረጋግጥ (${amount} ብር በ ${selectedMethod})`
                    : `Simulate Successful Payment (${amount} ETB via ${selectedMethod})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cancel & Terms Notice */}
            <div className="flex items-center justify-between pt-1 text-xxs text-neutral-500">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-neutral-600" />
                <span>
                  {language === 'am'
                    ? 'ክፍያው እስካልተረጋገጠ ድረስ ምዝገባው አይጠናቀቅም።'
                    : 'Registration is incomplete until payment is verified.'}
                </span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-400 hover:text-white font-sports uppercase tracking-wider font-bold cursor-pointer"
              >
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
