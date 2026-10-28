import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { HalabaCrest } from '../components/HalabaCrest';
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { getLocalizedShopCategory } from '../utils/localization';

export const ShopPage: React.FC = () => {
  const {
    t,
    language,
    shopItems,
    openCheckoutModal,
    openDonationModal,
    setCurrentPage,
    isAdminLoggedIn,
    isProductsLoading,
  } = useClub();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'JERSEY' | 'KIT' | 'ACCESSORY'>('ALL');

  const filteredItems = shopItems.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Shop Hero Section */}
      <section className="relative bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-b border-red-950/40 pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.shopBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-sports font-black text-white uppercase tracking-wider">
            {t.shopTitle}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            {t.shopSubtitle}
          </p>

          {/* Quick Perks Bar */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-neutral-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.perkAuthentic}</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-neutral-300 text-xs">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t.perkDelivery}</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-neutral-300 text-xs">
              <span className="font-sports font-black text-red-400">CHAPA</span>
              <span>{t.perkPayment}</span>
            </div>
          </div>

          {/* Supporter Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openDonationModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-emerald-600 hover:from-red-500 hover:to-emerald-500 text-white font-sports font-bold uppercase tracking-wider text-xs shadow-lg shadow-red-950/40 transition-all hover:scale-102"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{t.heroDonateBtn}</span>
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={() => setCurrentPage('admin')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 font-sports font-bold uppercase tracking-wider text-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.manageStoreAdmin}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Store Catalog & Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-sports font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {getLocalizedShopCategory('ALL', language)} ({shopItems.length})
            </button>
            <button
              onClick={() => setSelectedCategory('JERSEY')}
              className={`px-4 py-2 rounded-xl text-xs font-sports font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'JERSEY'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {getLocalizedShopCategory('JERSEY', language)}
            </button>
            <button
              onClick={() => setSelectedCategory('KIT')}
              className={`px-4 py-2 rounded-xl text-xs font-sports font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'KIT'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {getLocalizedShopCategory('KIT', language)}
            </button>
            <button
              onClick={() => setSelectedCategory('ACCESSORY')}
              className={`px-4 py-2 rounded-xl text-xs font-sports font-bold uppercase tracking-wider transition-all ${
                selectedCategory === 'ACCESSORY'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {getLocalizedShopCategory('ACCESSORY', language)}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xxs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.liveFirestoreSync}</span>
            </span>
            <span>
              {t.showing} <span className="font-bold text-white">{filteredItems.length}</span> {t.items}
            </span>
          </div>
        </div>

        {/* Empty or Loading State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-neutral-900/60 rounded-3xl border border-neutral-800 p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 mx-auto flex items-center justify-center text-red-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-sports font-black text-xl text-white uppercase">
                {isProductsLoading ? t.loadingInventory : t.noMerchFound}
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                {isProductsLoading
                  ? (language === 'am' ? 'ከቀጥታ የዳታቤዝ አገልጋይ ጋር በመገናኘት ላይ...' : 'Connecting to database...')
                  : t.noMerchFoundDesc}
              </p>
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const name = typeof item.name === 'object'
              ? item.name[language] || item.name.en
              : item.name;

            const desc = typeof item.description === 'object'
              ? item.description[language] || item.description.en
              : item.description;

            return (
              <div
                key={item.id}
                className="group rounded-3xl bg-neutral-900/90 border border-neutral-800 hover:border-red-900/50 flex flex-col overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Product Image Container */}
                <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={item.imageUrl}
                    alt={name}
                    className="w-full h-full object-cover object-center rounded-2xl group-hover:scale-105 transition-transform duration-500 filter brightness-95 contrast-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-7 left-7 flex flex-col gap-1.5">
                    {item.featured && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xxs font-sports font-black uppercase tracking-wider shadow-md">
                        {t.officialTag}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-emerald-400 text-xxs font-bold uppercase">
                      {item.inStock ? t.inStockLabel : t.outOfStockLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-6 right-6">
                    <div className="w-10 h-10 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-800 p-1 flex items-center justify-center shadow-lg">
                      <HalabaCrest size={28} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-sports font-black text-xl text-white uppercase tracking-wide group-hover:text-red-400 transition-colors">
                        {name}
                      </h3>
                    </div>

                    <p className="mt-2 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>

                    {/* Sizes Available */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xxs uppercase tracking-wider font-bold text-neutral-400">
                        {t.availableSizesLabel}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(item.availableSizes && item.availableSizes.length > 0
                          ? item.availableSizes
                          : (item.sizes && item.sizes.length > 0 ? item.sizes : ['Standard'])
                        ).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 text-xxs font-sports font-bold uppercase"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price and Buy Now Button */}
                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xxs text-neutral-400 uppercase font-semibold block">
                        {t.itemPrice}
                      </span>
                      <span className="font-sports font-black text-2xl text-emerald-400">
                        {item.price.toLocaleString()} <span className="text-xs text-neutral-400">{t.etbCurrency}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => openCheckoutModal(item)}
                      disabled={!item.inStock}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-sports font-black uppercase tracking-wider text-xs shadow-lg shadow-red-950/40 flex items-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t.buyNowBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Supporter CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="rounded-3xl bg-gradient-to-r from-red-950 via-neutral-900 to-green-950 border border-neutral-800 p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-sports font-bold tracking-widest text-emerald-400 uppercase">
              {t.membershipCtaTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-sports font-black text-white uppercase tracking-wide">
              {t.shopCtaTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              {t.shopCtaDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentPage('membership')}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-sports font-black uppercase tracking-wider text-sm shadow-xl transition-all"
            >
              {t.navJoinBtn}
            </button>
            <button
              onClick={openDonationModal}
              className="px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-emerald-400 font-sports font-bold uppercase tracking-wider text-sm shadow-lg transition-all flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-emerald-400" />
              <span>{t.donateNow}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
