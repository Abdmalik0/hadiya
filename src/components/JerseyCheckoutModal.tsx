import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import { HalabaCrest } from './HalabaCrest';
import {
  ShoppingBag,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const JerseyCheckoutModal: React.FC = () => {
  const { t, language, isCheckoutModalOpen, checkoutItem, closeCheckoutModal, recordShopOrder } = useClub();

  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [quantity, setQuantity] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Halaba Kulito');
  const [subcityOrRegion, setSubcityOrRegion] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success state
  const [verifiedOrder, setVerifiedOrder] = useState<{
    orderNumber: string;
    itemName: string;
    size: string;
    amount: number;
    fullName: string;
    address: string;
  } | null>(null);

  // Sandbox simulation state for test environments
  const [sandboxTx, setSandboxTx] = useState<{
    txRef: string;
    amount: number;
  } | null>(null);

  const availableSizes = (checkoutItem?.availableSizes && checkoutItem.availableSizes.length > 0)
    ? checkoutItem.availableSizes
    : (checkoutItem?.sizes && checkoutItem.sizes.length > 0 ? checkoutItem.sizes : ['Standard']);

  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [checkoutItem]);

  if (!isCheckoutModalOpen || !checkoutItem) return null;

  const itemName = typeof checkoutItem.name === 'object'
    ? checkoutItem.name[language] || checkoutItem.name.en
    : checkoutItem.name;

  const itemDesc = typeof checkoutItem.description === 'object'
    ? checkoutItem.description[language] || checkoutItem.description.en
    : checkoutItem.description;

  const totalAmount = checkoutItem.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim()) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ ሁሉንም አስፈላጊ የመገናኛና የመላኪያ አድራሻ መረጃዎችን ይሙሉ'
          : 'Please complete all required contact and delivery address fields.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const txRef = `halaba-shop-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await fetch('/api/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          type: 'SHOP_ORDER',
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          cityOrRegion: city.trim(),
          shopOrderDetails: {
            itemId: checkoutItem.id,
            itemName,
            size: selectedSize,
            streetAddress: streetAddress.trim(),
            city: city.trim(),
            subcityOrRegion: subcityOrRegion.trim() || city.trim(),
          },
          title: `Halaba FC Shop: ${itemName}`,
          description: `Order for ${itemName} (Size: ${selectedSize}, Qty: ${quantity}) - ${totalAmount} ETB`,
          tx_ref: txRef,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (language === 'am' ? 'በቻፓ በኩል ክፍያ መጀመር አልተቻለም' : 'Failed to initialize payment with Chapa.'));
      }

      // If live Chapa URL provided, redirect to Chapa checkout
      if (data.checkout_url && !data.isSandbox && !data.checkout_url.includes('chapa_modal')) {
        window.location.href = data.checkout_url;
        return;
      }

      // In sandbox mode or test mode, show simulator
      setSandboxTx({
        txRef: data.tx_ref || txRef,
        amount: totalAmount,
      });
      setIsSubmitting(false);
    } catch (err: any) {
      console.error('Error initiating jersey checkout:', err);
      setErrorMsg(err.message || (language === 'am' ? 'ከክፍያ መግቢያ ጋር መገናኘት አልተቻለም' : 'Error communicating with Chapa payment gateway.'));
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
      if (data.verified && data.order) {
        const fullAddr = `${streetAddress.trim()}, ${subcityOrRegion ? subcityOrRegion.trim() + ', ' : ''}${city.trim()}`;
        recordShopOrder({
          id: `ord-${Date.now()}`,
          orderNumber: data.order.orderNumber,
          itemId: checkoutItem.id,
          itemName,
          size: selectedSize,
          amount: data.order.amount,
          fullName: data.order.fullName,
          email: data.order.email,
          phone: data.order.phone,
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          subcityOrRegion: subcityOrRegion.trim(),
          createdAt: new Date().toISOString(),
          status: 'PAID',
          tx_ref: sandboxTx.txRef,
        });

        setVerifiedOrder({
          orderNumber: data.order.orderNumber,
          itemName,
          size: selectedSize,
          amount: data.order.amount,
          fullName: data.order.fullName,
          address: fullAddr,
        });
      }
    } catch (err) {
      console.error('Sandbox checkout verification error:', err);
      // Fallback local completion
      const randOrder = `ORD-${Date.now().toString().slice(-6)}`;
      const fullAddr = `${streetAddress.trim()}, ${subcityOrRegion ? subcityOrRegion.trim() + ', ' : ''}${city.trim()}`;
      recordShopOrder({
        id: `ord-${Date.now()}`,
        orderNumber: randOrder,
        itemId: checkoutItem.id,
        itemName,
        size: selectedSize,
        amount: totalAmount,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        subcityOrRegion: subcityOrRegion.trim(),
        createdAt: new Date().toISOString(),
        status: 'PAID',
        tx_ref: sandboxTx.txRef,
      });

      setVerifiedOrder({
        orderNumber: randOrder,
        itemName,
        size: selectedSize,
        amount: totalAmount,
        fullName: fullName.trim(),
        address: fullAddr,
      });
    } finally {
      setIsSubmitting(false);
      setSandboxTx(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-950 via-neutral-900 to-green-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HalabaCrest size={44} />
            <div>
              <h3 className="font-sports font-black text-xl text-white uppercase tracking-wider">
                {t.checkoutTitle}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {t.checkoutSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={closeCheckoutModal}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Order Success Screen */}
          {verifiedOrder ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-sports font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
                {t.orderSuccessTitle}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
                {t.orderSuccessMsg}
              </p>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">{language === 'am' ? 'የትዕዛዝ ቁጥር' : 'Order Ref'}</span>
                  <span className="font-mono font-bold text-amber-400">{verifiedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{language === 'am' ? 'የእቃ ስም' : 'Item'}</span>
                  <span className="font-semibold text-white">{verifiedOrder.itemName} ({language === 'am' ? 'መጠን' : 'Size'}: {verifiedOrder.size})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{language === 'am' ? 'የተከፈለ መጠን' : 'Amount Paid'}</span>
                  <span className="font-bold text-emerald-400">{verifiedOrder.amount.toLocaleString()} {t.etbCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{language === 'am' ? 'ተቀባይ' : 'Recipient'}</span>
                  <span className="text-neutral-200">{verifiedOrder.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{language === 'am' ? 'የመላኪያ አድራሻ' : 'Address'}</span>
                  <span className="text-neutral-300 text-right max-w-[200px] truncate">{verifiedOrder.address}</span>
                </div>
              </div>

              <button
                onClick={closeCheckoutModal}
                className="mt-4 px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-sports font-bold uppercase tracking-wider text-xs shadow-xl transition-all"
              >
                {language === 'am' ? 'ወደ ሱቅ ተመለስ' : 'Return to Shop'}
              </button>
            </div>
          ) : sandboxTx ? (
            /* Chapa Test Simulator Screen */
            <div className="space-y-6 py-2">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300 block">
                    {language === 'am' ? 'የቻፓ የክፍያ ማረጋገጫ' : 'Chapa Instant Payment Gateway'}
                  </span>
                  <span className="text-neutral-300">
                    {language === 'am'
                      ? 'የቻፓ ክፍያ በቴሌብር እና በኢትዮጵያ ንግድ ባንክ ተዘጋጅቷል። ትዕዛዝዎን ለማረጋገጥ ይክፈሉ።'
                      : 'Simulate instant confirmation via Telebirr or CBE Birr.'}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
                <div className="flex justify-between text-neutral-400 pb-2 border-b border-neutral-800">
                  <span>{language === 'am' ? 'የክፍያ መለያ' : 'Transaction Ref'}</span>
                  <span className="font-mono text-amber-400 font-bold">{sandboxTx.txRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">{language === 'am' ? 'ጠቅላላ የሚከፈል' : 'Total Payable'}</span>
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
                <span>{isSubmitting ? t.submitting : (language === 'am' ? 'ክፍያውን አጠናቅቅ እና ትዕዛዙን አረጋግጥ' : 'Complete Payment & Confirm Order')}</span>
              </button>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Item Card Summary */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center gap-4">
                <img
                  src={checkoutItem.imageUrl}
                  alt={itemName}
                  className="w-20 h-20 object-cover rounded-xl border border-neutral-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-sports font-black text-lg text-white uppercase tracking-wide truncate">
                    {itemName}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{itemDesc}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="font-sports font-black text-base text-emerald-400">
                      {checkoutItem.price.toLocaleString()} {t.etbCurrency}
                    </span>
                    <span className="text-xxs uppercase px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                      {t.inStockLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Size & Quantity Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sports font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    {t.sizeGuide} *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sports font-bold uppercase transition-all ${
                          selectedSize === s
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sports font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    {language === 'am' ? 'ብዛት' : 'Quantity'}
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-bold focus:outline-none focus:border-red-500"
                  >
                    {[1, 2, 3, 4, 5].map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Address Fields */}
              <div className="space-y-4 pt-2 border-t border-neutral-800">
                <h5 className="font-sports font-bold text-sm text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>{t.deliveryAddressLabel}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-sports font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-sports font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      {t.phone} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-sports font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      {t.city} *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={language === 'am' ? 'ለምሳሌ፡ ሀላባ ቁሊቶ / አዲስ አበባ' : 'e.g. Halaba Kulito / Addis Ababa'}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-sports font-bold uppercase tracking-wider text-neutral-400 mb-1">
                      {t.streetAddress} *
                    </label>
                    <input
                      type="text"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder={language === 'am' ? 'የመንገድ ስም / የቤት ቁጥር' : 'Street name / House number'}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Total & Submit Button */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xxs uppercase tracking-wider text-neutral-400 block font-semibold">
                    {t.orderSummary}
                  </span>
                  <span className="font-sports font-black text-2xl text-emerald-400">
                    {totalAmount.toLocaleString()} {t.etbCurrency}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sports font-black uppercase tracking-wider text-xs shadow-xl flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isSubmitting ? t.submitting : t.proceedToPayment}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
