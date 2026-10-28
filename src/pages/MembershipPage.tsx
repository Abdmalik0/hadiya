import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import { MembershipTier, Language } from '../types';
import { HalabaCrest, HadiyaCrest } from '../components/HalabaCrest';
import { ChapaPaymentModal } from '../components/ChapaPaymentModal';
import {
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Camera,
  CreditCard,
  Lock,
  ArrowRight,
  Receipt
} from 'lucide-react';

export const MembershipPage: React.FC = () => {
  const { t, language, recordVerifiedMembership } = useClub();

  // Tier selection & payment amount
  // Tier 1: 200 ETB, Tier 2: 500 ETB, Tier 3: 1000 ETB
  const [selectedTier, setSelectedTier] = useState<MembershipTier>('STANDARD');
  const [amount, setAmount] = useState<number>(500);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cityOrRegion, setCityOrRegion] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>(language);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  // Chapa payment modal & verification states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPaymentSession, setCurrentPaymentSession] = useState<{
    tx_ref: string;
    amount: number;
    tier: string;
  } | null>(null);

  // Photo upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(language === 'am' ? 'የፎቶው መጠን ከ5 ሜጋባይት በላይ ነው። እባክዎ አነስ ያለ ፎቶ ይምረጡ።' : 'File size exceeds 5MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setPhotoUrl(loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Status & Feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    referenceNumber: string;
    registeredAt: string;
    fullName: string;
    membershipType: MembershipTier;
    cityOrRegion: string;
    photoUrl?: string;
    amountPaid?: number | string;
    tx_ref?: string;
  } | null>(null);

  // Client-side auto-verify if returning from Chapa redirect URL with tx_ref on static hosting
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txRefParam = params.get('tx_ref');
    const paymentCompleted = params.get('payment_completed') || params.get('status') === 'success';

    if (txRefParam && paymentCompleted && !registrationResult) {
      const pendingDataStr = localStorage.getItem(`pending_tx_${txRefParam}`);
      if (pendingDataStr) {
        try {
          const pendingData = JSON.parse(pendingDataStr);
          const randNum = Math.floor(1000 + Math.random() * 9000);
          const referenceNumber = `HCFC-2026-M${randNum}`;
          recordVerifiedMembership({
            referenceNumber,
            fullName: pendingData.fullName,
            dateOfBirth: pendingData.dateOfBirth || '',
            gender: pendingData.gender,
            phone: pendingData.phone,
            email: pendingData.email,
            cityOrRegion: pendingData.cityOrRegion,
            membershipType: pendingData.membershipType as MembershipTier,
            preferredLanguage: pendingData.preferredLanguage as Language,
            amountPaid: pendingData.amount,
            tx_ref: txRefParam,
          });

          setRegistrationResult({
            referenceNumber,
            registeredAt: new Date().toLocaleDateString(),
            fullName: pendingData.fullName,
            membershipType: pendingData.membershipType as MembershipTier,
            cityOrRegion: pendingData.cityOrRegion,
            photoUrl: pendingData.photoUrl,
            amountPaid: pendingData.amount,
            tx_ref: txRefParam,
          });

          localStorage.removeItem(`pending_tx_${txRefParam}`);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.warn('Failed to parse pending transaction:', e);
        }
      }
    }
  }, [registrationResult, recordVerifiedMembership]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 3) {
      errs.fullName = t.errFullName;
    }
    if (!dateOfBirth) {
      errs.dateOfBirth = t.errDob;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      errs.phone = t.errPhone;
    }
    if (!cityOrRegion.trim()) {
      errs.cityOrRegion = t.errCity;
    }
    if (!agreeTerms) {
      errs.agree = t.errAgree;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /**
   * Handle form submission:
   * 1. Validates inputs
   * 2. Sets up Chapa Inline.js payment with dynamic amount (200, 500, or 1000 ETB) and user details
   * 3. Opens Chapa Inline payment modal
   * CRITICAL: Registration is NOT successful until payment is completed and verified!
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});
    const txRef = `halaba-fan-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save pending transaction to localStorage for static hosting callback resiliency
    localStorage.setItem(`pending_tx_${txRef}`, JSON.stringify({
      fullName: fullName.trim(),
      dateOfBirth,
      gender: gender || undefined,
      phone: phone.trim(),
      email: email?.trim() || undefined,
      cityOrRegion: cityOrRegion.trim(),
      membershipType: selectedTier,
      preferredLanguage: preferredLang,
      photoUrl: photoUrl || undefined,
      amount,
    }));

    // DO NOT set registrationResult yet!
    // Registration is ONLY granted after Chapa payment verification.
    setCurrentPaymentSession({
      tx_ref: txRef,
      amount,
      tier: selectedTier,
    });
    setIsPaymentModalOpen(true);
  };

  /**
   * Callback fired ONLY when payment verification succeeds on Chapa.
   * Now and only now do we grant membership and display the digital membership card.
   */
  const handlePaymentVerified = (verifiedData: {
    referenceNumber: string;
    amount: number | string;
    tier: string;
    tx_ref: string;
    verifiedAt?: string;
  }) => {
    // Officially register member into club state & local storage
    recordVerifiedMembership({
      referenceNumber: verifiedData.referenceNumber,
      fullName: fullName.trim(),
      dateOfBirth,
      gender: gender || undefined,
      phone: phone.trim(),
      email: email?.trim() || undefined,
      cityOrRegion: cityOrRegion.trim(),
      membershipType: selectedTier,
      preferredLanguage: preferredLang,
      amountPaid: verifiedData.amount,
      tx_ref: verifiedData.tx_ref,
    });

    setRegistrationResult({
      referenceNumber: verifiedData.referenceNumber,
      registeredAt: new Date().toLocaleDateString(),
      fullName: fullName.trim(),
      membershipType: selectedTier,
      cityOrRegion: cityOrRegion.trim(),
      photoUrl: photoUrl || undefined,
      amountPaid: verifiedData.amount,
      tx_ref: verifiedData.tx_ref,
    });

    setIsPaymentModalOpen(false);
    setCurrentPaymentSession(null);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setRegistrationResult(null);
    setFullName('');
    setDateOfBirth('');
    setPhone('');
    setEmail('');
    setCityOrRegion('');
    setPhotoUrl('');
    setAgreeTerms(false);
    setErrors({});
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-xl text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'ይፋዊ የደጋፊዎች የአባልነት ፕሮግራም' : 'Official Supporter Program'}</span>
            </div>
            <h1 className="font-sports font-black text-3xl sm:text-5xl text-white uppercase tracking-wider">
              {t.membershipTitle}
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl">{t.membershipSubtitle}</p>
          </div>

          <div className="hidden lg:block shrink-0">
            <HalabaCrest size={80} showGlow />
          </div>
        </div>
      </div>

      {/* SUCCESS SCREEN WITH DIGITAL MEMBERSHIP CARD (ONLY SHOWN AFTER PAYMENT IS VERIFIED) */}
      {registrationResult ? (
        <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 animate-in fade-in">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-sports font-black text-3xl sm:text-4xl text-white uppercase">
              {t.registrationSuccessTitle}
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base">{t.registrationSuccessDesc}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl">
                <span className="text-xxs text-neutral-400 block uppercase font-mono tracking-wider">
                  {t.yourRefNumber}
                </span>
                <span className="font-mono font-black text-xl text-amber-400">
                  {registrationResult.referenceNumber}
                </span>
              </div>

              <div className="px-4 py-2 bg-neutral-950 border border-emerald-800/80 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <span className="text-xxs text-neutral-400 block uppercase font-mono tracking-wider">
                    {language === 'am' ? 'በቻፓ የተረጋገጠ ክፍያ' : 'Chapa Verified Payment'}
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    {registrationResult.amountPaid} {t.etbCurrency} {language === 'am' ? 'ተከፍሏል' : 'PAID'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Digital Membership Card Graphic */}
          <div className="max-w-md mx-auto">
            <div className="p-1 rounded-3xl bg-gradient-to-tr from-red-600 via-amber-500 to-emerald-600 shadow-2xl">
              <div className="rounded-[22px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[250px] border border-neutral-800">
                {/* Background watermarked crest */}
                <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
                  <HalabaCrest size={220} />
                </div>

                {/* Card Top: Logo & Club Title */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                  <div className="flex items-center gap-2.5">
                    <HadiyaCrest size="sm" />
                    <div>
                      <span className="font-sports font-black text-lg tracking-wider text-white uppercase block leading-none">
                        {language === 'am' ? 'ሀዲያ ሆሳዕና እግር ኳስ ክለብ' : 'HADIYA HOSSANA FC'}
                      </span>
                      <span className="text-xxs text-amber-400 font-bold uppercase tracking-widest font-ethiopic">
                        {language === 'am' ? 'ነብሮቹ • ይፋዊ ደጋፊ' : 'THE TIGERS • OFFICIAL SUPPORTER'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-xxs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    {registrationResult.membershipType === 'PREMIUM'
                      ? (language === 'am' ? 'ፕሪሚየም' : 'PREMIUM')
                      : registrationResult.membershipType === 'STANDARD'
                      ? (language === 'am' ? 'መደበኛ' : 'STANDARD')
                      : (language === 'am' ? 'ደጋፊ' : 'SUPPORTER')}
                  </span>
                </div>

                {/* Card Center: Member Info & Photo */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="text-xxs uppercase tracking-wider text-neutral-400 block font-sports font-bold">
                      {language === 'am' ? 'የአባል ስም' : 'Member Name'}
                    </span>
                    <h3 className="font-sports font-black text-2xl text-white uppercase tracking-wide truncate">
                      {registrationResult.fullName}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-neutral-300 pt-1">
                      <span>
                        <strong className="text-neutral-500">{language === 'am' ? 'ክልል/ከተማ፡' : 'Region:'}</strong> {registrationResult.cityOrRegion}
                      </span>
                      <span>
                        <strong className="text-neutral-500">{language === 'am' ? 'ዘመን፡' : 'Season:'}</strong> 2026/2027
                      </span>
                    </div>
                  </div>

                  {registrationResult.photoUrl ? (
                    <img
                      src={registrationResult.photoUrl}
                      alt={registrationResult.fullName}
                      className="w-14 h-16 object-cover rounded-xl border-2 border-amber-400 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-16 rounded-xl bg-neutral-900 border border-neutral-700 flex flex-col items-center justify-center text-neutral-500 shrink-0">
                      <Camera className="w-6 h-6 text-neutral-600" />
                      <span className="text-xxs font-mono mt-0.5">{language === 'am' ? 'ፎቶ' : 'ID PHOTO'}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Reference & Verified Graphic */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-xxs text-neutral-400 block font-mono">{language === 'am' ? 'የመታወቂያ ቁጥር' : 'ID REFERENCE'}</span>
                    <span className="font-mono font-bold text-amber-400">
                      {registrationResult.referenceNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-black font-mono text-xxs font-bold">
                    <QrCode className="w-4 h-4 text-black" />
                    <span>{language === 'am' ? 'የተረጋገጠ ክፍያ' : 'VERIFIED PAID'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Summary Pill */}
            {registrationResult.tx_ref && (
              <div className="mt-4 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xxs font-mono text-neutral-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{language === 'am' ? 'የቻፓ መለያ፡' : 'Chapa TX Ref:'}</span>
                </span>
                <span className="text-neutral-300 font-bold">{registrationResult.tx_ref}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrintCard}
              className="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm uppercase tracking-wider font-sports flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.downloadCard}</span>
            </button>
            <button
              onClick={handleResetForm}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-wider font-sports flex items-center gap-2 transition-colors shadow-lg shadow-red-950 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.newRegistrationBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION APPLICATION FORM */
        <div className="space-y-10">
          {/* 1. Membership Tiers Selection */}
          <div>
            <div className="text-center md:text-left mb-6">
              <h2 className="font-sports font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                {t.membershipPlansTitle}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                {language === 'am'
                  ? 'የአባልነት ደረጃዎን ይምረጡ። ተዛማጁ የክፍያ መጠን (200፣ 500 ወይም 1000 ብር) በቻፓ በኩል ይከፈላል።'
                  : 'Choose your membership tier. The corresponding payment amount (200, 500, or 1000 ETB) is initialized via Chapa.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tier 1: Supporter Member (200 ETB) */}
              <div
                onClick={() => {
                  setSelectedTier('SUPPORTER');
                  setAmount(200);
                }}
                className={`cursor-pointer rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
                  selectedTier === 'SUPPORTER'
                    ? 'bg-neutral-900 border-red-500 shadow-xl shadow-red-950/40 ring-1 ring-red-500'
                    : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="font-sports font-black text-xl text-white uppercase">
                      {t.tierSupporter}
                    </span>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {language === 'am' ? 'ደረጃ 1' : 'Tier 1'}
                    </span>
                  </div>

                  {/* Price display */}
                  <div className="mt-4 mb-2 flex items-baseline gap-1.5">
                    <span className="font-sports font-black text-3xl text-white font-mono">200</span>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      {language === 'am' ? 'ብር / የውድድር ዘመን' : 'ETB / Season'}
                    </span>
                  </div>

                  <p className="text-neutral-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    {language === 'am'
                      ? 'በዓለም ዙሪያ ላሉ የክለባችን ታማኝ ደጋፊዎች ይፋዊ የዲጂታል ደጋፊ ካርድ እና የክለቡ ወቅታዊ ዜናዎች።'
                      : 'Official digital membership for passionate fans worldwide with digital card & club newsletter.'}
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'ይፋዊ የዲጂታል ደጋፊ ካርድ' : 'Official Digital Fan Card'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'የክለቡ የኢሜይል ዜናዎች እና ወቅታዊ ማሳወቂያዎች' : 'Club email newsletter & alerts'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'በዓለም አቀፍ የደጋፊዎች መዝገብ ላይ መካተት' : 'Global supporter registry listing'}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier('SUPPORTER');
                      setAmount(200);
                    }}
                    className={`block w-full py-2.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider font-sports transition-all cursor-pointer ${
                      selectedTier === 'SUPPORTER'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {selectedTier === 'SUPPORTER'
                      ? (language === 'am' ? 'የተመረጠ (200 ብር)' : 'Selected (200 ETB)')
                      : (language === 'am' ? 'ደረጃ 1 ይምረጡ (200 ብር)' : 'Select Tier 1 (200 ETB)')}
                  </button>
                </div>
              </div>

              {/* Tier 2: Standard Member (500 ETB) */}
              <div
                onClick={() => {
                  setSelectedTier('STANDARD');
                  setAmount(500);
                }}
                className={`cursor-pointer rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
                  selectedTier === 'STANDARD'
                    ? 'bg-neutral-900 border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                    : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="font-sports font-black text-xl text-white uppercase">
                      {t.tierStandard}
                    </span>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {language === 'am' ? 'ደረጃ 2 • ተወዳጅ ምርጫ' : 'Tier 2 • Most Popular'}
                    </span>
                  </div>

                  {/* Price display */}
                  <div className="mt-4 mb-2 flex items-baseline gap-1.5">
                    <span className="font-sports font-black text-3xl text-emerald-400 font-mono">500</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {language === 'am' ? 'ብር / የውድድር ዘመን' : 'ETB / Season'}
                    </span>
                  </div>

                  <p className="text-neutral-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    {language === 'am'
                      ? 'ይፋዊ ቋሚና ዲጂታል ካርድ፣ 10% የክለብ እቃዎች ቅናሽ እና በስታዲየም የቅድሚያ ትኬት የማግኘት መብት።'
                      : 'Official physical & digital member card, 10% merchandise discount, and priority ticket privileges.'}
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'ቋሚና ዲጂታል የአባልነት ካርድ' : 'Physical & Digital Member Card'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'በክለቡ ሻርፖችና ማሊያዎች ላይ 10% ቅናሽ' : '10% Discount on club scarves & jerseys'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'በአብዮ ኤርሚያስ ስታዲየም የቅድሚያ ትኬት ወረፋ መብት' : 'Priority ticket queue at Abiyo Ermias Stadium'}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier('STANDARD');
                      setAmount(500);
                    }}
                    className={`block w-full py-2.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider font-sports transition-all cursor-pointer ${
                      selectedTier === 'STANDARD'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {selectedTier === 'STANDARD'
                      ? (language === 'am' ? 'የተመረጠ (500 ብር)' : 'Selected (500 ETB)')
                      : (language === 'am' ? 'ደረጃ 2 ይምረጡ (500 ብር)' : 'Select Tier 2 (500 ETB)')}
                  </button>
                </div>
              </div>

              {/* Tier 3: Premium / Gold VIP (1000 ETB) */}
              <div
                onClick={() => {
                  setSelectedTier('PREMIUM');
                  setAmount(1000);
                }}
                className={`cursor-pointer rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
                  selectedTier === 'PREMIUM'
                    ? 'bg-neutral-900 border-amber-500 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500'
                    : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <span className="font-sports font-black text-xl text-white uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {t.tierPremium}
                    </span>
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      {language === 'am' ? 'ደረጃ 3 • ቪአይፒ' : 'Tier 3 • VIP'}
                    </span>
                  </div>

                  {/* Price display */}
                  <div className="mt-4 mb-2 flex items-baseline gap-1.5">
                    <span className="font-sports font-black text-3xl text-amber-400 font-mono">1,000</span>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {language === 'am' ? 'ብር / የውድድር ዘመን' : 'ETB / Season'}
                    </span>
                  </div>

                  <p className="text-neutral-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    {language === 'am'
                      ? 'የቪአይፒ ስታዲየም ትሪቡን መግቢያ፣ ነጻ የውድድር ዘመኑ ማሊያ ቫውቸር እና በጠቅላላ ጉባኤ የመሳተፍ ጥሪ።'
                      : 'VIP stadium tribune access, complimentary official season jersey voucher, and assembly invitation.'}
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-neutral-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'የቪአይፒ ስታዲየም ትሪቡን መግቢያና የመኪና ማቆሚያ' : 'VIP Stadium tribune access & parking'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'ነጻ የክለቡ ይፋዊ ማሊያ ቫውቸር' : 'Complimentary official season jersey voucher'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{language === 'am' ? 'በዓመታዊው የክለቡ ጠቅላላ ጉባኤ ላይ የመሳተፍ ጥሪ' : 'Invitation to Annual Club Assembly'}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTier('PREMIUM');
                      setAmount(1000);
                    }}
                    className={`block w-full py-2.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider font-sports transition-all cursor-pointer ${
                      selectedTier === 'PREMIUM'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {selectedTier === 'PREMIUM'
                      ? (language === 'am' ? 'የተመረጠ (1,000 ብር)' : 'Selected (1,000 ETB)')
                      : (language === 'am' ? 'ደረጃ 3 ይምረጡ (1,000 ብር)' : 'Select Tier 3 (1,000 ETB)')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {language === 'am'
                    ? <>ክፍያዎች በ<strong>ቻፓ (Chapa)</strong> በኩል ይከናወናሉ። ምዝገባው የሚጸድቀው ክፍያው ተረጋግጦ ሲጠናቀቅ ብቻ ነው።</>
                    : <>Payments are processed through <strong>Chapa</strong>. Registration is only activated once payment is completed and verified.</>}
                </span>
              </div>
              <span className="font-mono text-neutral-300 text-xs font-bold shrink-0">
                {language === 'am' ? 'የተመረጠው መጠን፡' : 'Current selection:'} <span className="text-amber-400">{amount} {t.etbCurrency}</span>
              </span>
            </div>
          </div>

          {/* 2. Application Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-xl">
            <div className="mb-6 pb-4 border-b border-neutral-800">
              <h2 className="font-sports font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                {t.formTitle}
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                {language === 'am'
                  ? `እባክዎ የግል መረጃዎን ይሙሉ። ሲልኩ የ ${amount} ብር ክፍያ በቻፓ በኩል ይጠየቃሉ።`
                  : `Please complete your personal details. On submit, you will be prompted to complete the ${amount} ETB payment via Chapa.`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {t.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className={`w-full px-4 py-3 bg-neutral-950 rounded-xl border text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                      errors.fullName ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                    }`}
                  />
                  {errors.fullName && (
                    <span className="text-xs text-red-400 mt-1 block">{errors.fullName}</span>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {t.dob} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={`w-full px-4 py-3 bg-neutral-950 rounded-xl border text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                      }`}
                    />
                    <Calendar className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {errors.dateOfBirth && (
                    <span className="text-xs text-red-400 mt-1 block">{errors.dateOfBirth}</span>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {t.gender}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">{language === 'am' ? 'ጾታ ይምረጡ' : 'Select Gender'}</option>
                    <option value="Male">{t.genderMale}</option>
                    <option value="Female">{t.genderFemale}</option>
                    <option value="Other">{t.genderOther}</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {t.phone} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className={`w-full pl-10 pr-4 py-3 bg-neutral-950 rounded-xl border text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                      }`}
                    />
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {errors.phone && (
                    <span className="text-xs text-red-400 mt-1 block">{errors.phone}</span>
                  )}
                </div>

                {/* Email (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {t.email}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                    />
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* City / Region */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {t.cityOrRegion} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cityOrRegion}
                      onChange={(e) => setCityOrRegion(e.target.value)}
                      placeholder={t.cityPlaceholder}
                      className={`w-full pl-10 pr-4 py-3 bg-neutral-950 rounded-xl border text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                        errors.cityOrRegion ? 'border-red-500' : 'border-neutral-800 focus:border-red-500'
                      }`}
                    />
                    <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {errors.cityOrRegion && (
                    <span className="text-xs text-red-400 mt-1 block">{errors.cityOrRegion}</span>
                  )}
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {t.prefLanguage}
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value as Language)}
                    className="w-full px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="en">English</option>
                    <option value="am">አማርኛ (Amharic)</option>
                    <option value="om">Afaan Oromo</option>
                  </select>
                </div>

                {/* Selected Plan & Fee Review */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                    {language === 'am' ? 'የተመረጠው ደረጃ እና የቻፓ ክፍያ' : 'Selected Tier & Chapa Fee'}
                  </label>
                  <div className="px-4 py-3 bg-neutral-950 rounded-xl border border-neutral-800 text-sm font-sports font-bold uppercase flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={selectedTier === 'PREMIUM' ? 'text-amber-400' : selectedTier === 'STANDARD' ? 'text-emerald-400' : 'text-red-400'}>
                        {selectedTier === 'PREMIUM'
                          ? (language === 'am' ? 'ፕሪሚየም' : 'PREMIUM')
                          : selectedTier === 'STANDARD'
                          ? (language === 'am' ? 'መደበኛ' : 'STANDARD')
                          : (language === 'am' ? 'ደጋፊ' : 'SUPPORTER')}
                      </span>
                      <span className="text-neutral-500 font-mono">•</span>
                      <span className="text-white font-mono text-base">{amount} {t.etbCurrency}</span>
                    </div>
                    <span className="text-xxs font-normal text-neutral-400 font-sans">
                      {language === 'am' ? '(ለመቀየር ከላይ ያለውን ካርድ ይምረጡ)' : '(Select tier card above to change)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo Upload (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  {language === 'am' ? 'የዲጂታል መታወቂያ ፎቶ (አስገዳጅ ያልሆነ)' : 'Member Photo for Digital ID (Optional)'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 flex items-center gap-2 transition-colors">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>{language === 'am' ? 'የመታወቂያ ፎቶ ይጫኑ' : 'Upload ID Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {photoUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'am' ? 'ፎቶ ተመርጧል' : 'Photo selected'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy agreement */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-neutral-700 text-red-600 focus:ring-red-500 bg-neutral-950"
                  />
                  <span className="text-xs sm:text-sm text-neutral-300 leading-normal">
                    {t.agreePrivacy}
                  </span>
                </label>
                {errors.agree && (
                  <span className="text-xs text-red-400 mt-1 block">{errors.agree}</span>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xxs text-neutral-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {language === 'am'
                      ? 'በቻፓ መግቢያ የተጠበቀና አስተማማኝ የክፍያ ሥርዓት'
                      : 'Secure 256-bit encrypted Ethiopian payment via Chapa gateway'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base uppercase tracking-wider font-sports shadow-xl shadow-red-950/60 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>
                        {language === 'am'
                          ? `ቻፓ በመዘጋጀት ላይ (${amount} ብር)...`
                          : `Initializing Chapa (${amount} ETB)...`}
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>
                        {language === 'am'
                          ? `${amount} ብር በቻፓ ይክፈሉና ምዝገባውን ያጠናቅቁ`
                          : `Pay ${amount} ETB & Complete Registration`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAPA PAYMENT MODAL (USING INLINE.JS & PUBLIC KEY) */}
      {currentPaymentSession && (
        <ChapaPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
          }}
          txRef={currentPaymentSession.tx_ref}
          amount={currentPaymentSession.amount}
          tier={currentPaymentSession.tier}
          fullName={fullName}
          phone={phone}
          email={email}
          onPaymentVerified={handlePaymentVerified}
        />
      )}
    </div>
  );
};
