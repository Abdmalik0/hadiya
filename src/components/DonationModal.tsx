import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { HalabaCrest } from './HalabaCrest';
import {
  Heart,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const DonationModal: React.FC = () => {
  const { t, language, isDonationModalOpen, closeDonationModal, recordDonation } = useClub();

  const presetAmounts = [100, 500, 1000, 2500];
  const [selectedPreset, setSelectedPreset] = useState<number>(500);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState<string>(t.purposeGeneral);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success state
  const [verifiedDonation, setVerifiedDonation] = useState<{
    donationNumber: string;
    amount: number;
    fullName: string;
    purpose: string;
    date: string;
  } | null>(null);

  // Sandbox fallback modal state
  const [sandboxTx, setSandboxTx] = useState<{
    txRef: string;
    amount: number;
  } | null>(null);

  if (!isDonationModalOpen) return null;

  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedPreset;

  const handleSelectPreset = (amount: number) => {
    setSelectedPreset(amount);
    setIsCustom(false);
    setErrorMsg(null);
  };

  const handleCustomChange = (val: string) => {
    const clean = val.replace(/[^\d]/g, '');
    setCustomAmount(clean);
    setIsCustom(true);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentAmount <= 0) {
      setErrorMsg(language === 'am' ? 'እባክዎ ትክክለኛ የልገሳ መጠን ይምረጡ ወይም ያስገቡ' : 'Please select or enter a valid donation amount.');
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg(language === 'am' ? 'ሙሉ ስም እና ስልክ ቁጥር ማስገባት ግዴታ ነው' : 'Full Name and Phone Number are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const txRef = `halaba-donate-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await fetch('/api/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentAmount,
          type: 'DONATION',
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          cityOrRegion: 'Halaba',
          donationDetails: {
            purpose,
            supporterName: fullName.trim(),
          },
          title: `Halaba City FC Donation - ${purpose}`,
          description: `Supporter donation to Halaba City FC (${currentAmount} ETB)`,
          tx_ref: txRef,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (language === 'am' ? 'በቻፓ በኩል ልገሳ ማስጀመር አልተቻለም' : 'Failed to initialize donation with Chapa'));
      }

      // If live Chapa URL provided, redirect to Chapa checkout
      if (data.checkout_url && !data.isSandbox && !data.checkout_url.includes('chapa_modal')) {
        window.location.href = data.checkout_url;
        return;
      }

      // If in sandbox mode or test environment, show instant simulator
      setSandboxTx({
        txRef: data.tx_ref || txRef,
        amount: currentAmount,
      });
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Error initiating donation:', err);
      setErrorMsg(err.message || (language === 'am' ? 'ከክፍያ መግቢያ ጋር መገናኘት አልተቻለም' : 'Error communicating with payment gateway.'));
      setIsSubmitting(false);
    }
  };

  const handleCompleteSandboxPayment = async () => {
    if (!sandboxTx) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/complete-sandbox-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: sandboxTx.txRef,
          method: 'Telebirr',
        }),
      });

      const data = await res.json();
      if (data.verified && data.donation) {
        recordDonation({
          id: `don-${Date.now()}`,
          donationNumber: data.donation.donationNumber,
          fullName: data.donation.fullName,
          email: data.donation.email,
          phone: data.donation.phone,
          amount: data.donation.amount,
          purpose: data.donation.purpose,
          tx_ref: data.donation.tx_ref,
          createdAt: new Date().toISOString(),
          status: 'COMPLETED',
          verifiedAt: data.donation.verifiedAt,
        });

        setVerifiedDonation({
          donationNumber: data.donation.donationNumber,
          amount: data.donation.amount,
          fullName: data.donation.fullName,
          purpose: data.donation.purpose,
          date: new Date().toLocaleDateString(),
        });
      }
    } catch (err) {
      console.error('Sandbox donation verification note:', err);
      // Fallback
      const randDon = `DON-${Date.now().toString().slice(-6)}`;
      recordDonation({
        id: `don-${Date.now()}`,
        donationNumber: randDon,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        amount: currentAmount,
        purpose,
        tx_ref: sandboxTx.txRef,
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
      });

      setVerifiedDonation({
        donationNumber: randDon,
        amount: currentAmount,
        fullName: fullName.trim(),
        purpose,
        date: new Date().toLocaleDateString(),
      });
    } finally {
      setIsSubmitting(false);
      setSandboxTx(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-neutral-900 to-red-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-emerald-400" />
            </div>
            <div>
              <h3 className="font-sports font-black text-xl text-white uppercase tracking-wider">
                {t.donateTitle}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {t.donateSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={closeDonationModal}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Success Screen */}
          {verifiedDonation ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-sports font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                {t.donationSuccessTitle}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                {t.donationSuccessMsg}
              </p>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">{language === 'am' ? 'የልገሳ ቁጥር' : 'Receipt No.'}</span>
                  <span className="font-mono font-bold text-amber-400">{verifiedDonation.donationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{language === 'am' ? 'ለጋሽ' : 'Donor'}</span>
                  <span className="font-semibold text-white">{verifiedDonation.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{t.donationPurposeLabel}</span>
                  <span className="text-neutral-300">{verifiedDonation.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{language === 'am' ? 'የተለገሰ መጠን' : 'Amount Contributed'}</span>
                  <span className="font-bold text-emerald-400 text-sm">{verifiedDonation.amount.toLocaleString()} {t.etbCurrency}</span>
                </div>
              </div>

              <button
                onClick={closeDonationModal}
                className="mt-4 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sports font-bold uppercase tracking-wider text-xs shadow-xl transition-all"
              >
                {language === 'am' ? 'ጨርስ' : 'Done'}
              </button>
            </div>
          ) : sandboxTx ? (
            /* Simulator Screen */
            <div className="space-y-6 py-2">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300 block">
                    {language === 'am' ? 'የቻፓ ደህንነቱ የተጠበቀ ክፍያ' : 'Chapa Instant Payment Gateway'}
                  </span>
                  <span className="text-neutral-300">
                    {language === 'am' ? 'በቴሌብር ወይም በኢትዮጵያ ንግድ ባንክ ክፍያውን አጠናቅቀው ደረሰኝዎን ይቀበሉ።' : 'Complete payment via Telebirr or CBE Birr.'}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
                <div className="flex justify-between text-neutral-400 pb-2 border-b border-neutral-800">
                  <span>{language === 'am' ? 'የክፍያ መለያ' : 'Transaction Ref'}</span>
                  <span className="font-mono text-amber-400 font-bold">{sandboxTx.txRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">{language === 'am' ? 'የልገሳ መጠን' : 'Donation Total'}</span>
                  <span className="font-sports font-black text-xl text-emerald-400">
                    {sandboxTx.amount.toLocaleString()} {t.etbCurrency}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCompleteSandboxPayment}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-sports font-black uppercase tracking-wider text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? t.submitting : (language === 'am' ? 'ልገሳውን አረጋግጥ' : 'Confirm Donation Payment')}</span>
              </button>
            </div>
          ) : (
            /* Donation Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-sports font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  {t.selectDonationAmount} *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {presetAmounts.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => handleSelectPreset(amt)}
                      className={`py-2.5 rounded-xl font-sports font-black text-sm uppercase transition-all ${
                        !isCustom && selectedPreset === amt
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                          : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder={t.enterAmountPlaceholder}
                    className={`w-full px-4 py-2.5 rounded-xl bg-neutral-950 border text-white text-xs font-mono focus:outline-none focus:border-emerald-500 ${
                      isCustom ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-neutral-800'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-xxs">
                    {t.etbCurrency}
                  </span>
                </div>
              </div>

              {/* Purpose Selection */}
              <div>
                <label className="block text-xs font-sports font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  {t.donationPurposeLabel} *
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value={t.purposeGeneral}>{t.purposeGeneral}</option>
                  <option value={t.purposeAcademy}>{t.purposeAcademy}</option>
                  <option value={t.purposeStadium}>{t.purposeStadium}</option>
                </select>
              </div>

              {/* Donor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-800">
                <div>
                  <label className="block text-xxs font-sports font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    {t.donorNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-sports font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    {t.donorPhoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Total & Submit */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xxs uppercase tracking-wider text-neutral-400 block font-semibold">
                    {language === 'am' ? 'የልገሳ ጠቅላላ' : 'Total Donation'}
                  </span>
                  <span className="font-sports font-black text-2xl text-emerald-400">
                    {currentAmount.toLocaleString()} {t.etbCurrency}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || currentAmount <= 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-sports font-black uppercase tracking-wider text-xs shadow-xl flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{isSubmitting ? t.submitting : (language === 'am' ? 'በቻፓ ይለግሱ' : 'Donate with Chapa')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
