import React, { useState, useEffect, useRef } from 'react';
import { useClub } from '../context/ClubContext';
import { Sponsor } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  Pause,
  Play,
  Layers,
} from 'lucide-react';
import { NetVibeSvgEmblem } from './NetVibeLogo';

interface SponsorAutoSliderProps {
  className?: string;
  autoPlayInterval?: number; // ms, default 4200
}

export const SponsorAutoSlider: React.FC<SponsorAutoSliderProps> = ({
  className = '',
  autoPlayInterval = 4500,
}) => {
  const { sponsors, language, setCurrentPage, isAdminLoggedIn } = useClub();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter only active sponsors, sorted by order
  const activeSponsors = sponsors
    .filter((s) => s.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const totalSponsors = activeSponsors.length;

  // Next / Prev slide handlers
  const handleNext = () => {
    if (totalSponsors <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSponsors);
  };

  const handlePrev = () => {
    if (totalSponsors <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSponsors) % totalSponsors);
  };

  // Autoplay effect
  useEffect(() => {
    if (isPaused || totalSponsors <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSponsors);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSponsors, autoPlayInterval, currentIndex]);

  // Keep index in range if sponsors list changes
  useEffect(() => {
    if (currentIndex >= totalSponsors && totalSponsors > 0) {
      setCurrentIndex(0);
    }
  }, [totalSponsors, currentIndex]);

  if (totalSponsors === 0) {
    return null;
  }

  const currentSponsor: Sponsor = activeSponsors[currentIndex] || activeSponsors[0];

  const isNetVibe =
    currentSponsor.id.includes('netvibe') ||
    currentSponsor.name.toLowerCase().includes('netvibe');

  const localizedName =
    language === 'am' && currentSponsor.nameAm
      ? currentSponsor.nameAm
      : language === 'om' && currentSponsor.nameOm
      ? currentSponsor.nameOm
      : currentSponsor.name;

  const localizedTier =
    language === 'am' && currentSponsor.tierAm
      ? currentSponsor.tierAm
      : currentSponsor.tier;

  const localizedDesc =
    language === 'am' && currentSponsor.descriptionAm
      ? currentSponsor.descriptionAm
      : currentSponsor.description;

  const hasImageError = Boolean(imageErrorMap[currentSponsor.id]);

  return (
    <div
      className={`w-full max-w-5xl mx-auto my-6 select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Official Club Sponsors & Partners Carousel"
    >
      {/* Header bar / Title with live controls */}
      <div className="flex items-center justify-between mb-2.5 px-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xxs font-sports font-bold uppercase tracking-wider">
            <Award className="w-3 h-3 text-amber-400" />
            <span>
              {language === 'am'
                ? 'ይፋዊ የክለቡ ስፖንሰሮችና አጋሮች'
                : language === 'om'
                ? 'Ispoonsaroota fi Hiriyoota Seera Qabeeyyii'
                : 'Official Club Sponsors & Partners'}
            </span>
          </div>
          <span className="text-xxs text-neutral-400 font-mono hidden sm:inline">
            ({currentIndex + 1} / {totalSponsors})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Pause / Play toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xxs transition-colors"
            aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          {/* Admin shortcut if logged in */}
          {isAdminLoggedIn && (
            <button
              onClick={() => setCurrentPage('admin')}
              className="text-xxs text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-neutral-900 border border-amber-500/30 font-sports font-bold tracking-wider uppercase transition-colors"
            >
              {language === 'am' ? 'ስፖንሰሮችን አርትዕ' : 'Edit Posters'}
            </button>
          )}

          {/* Prev / Next Arrows */}
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 transition-all hover:scale-105 active:scale-95"
            aria-label="Previous sponsor"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 transition-all hover:scale-105 active:scale-95"
            aria-label="Next sponsor"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Large Auto-Slide Billboard / Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950 border border-neutral-700/70 shadow-2xl transition-all duration-500 hover:border-red-500/40">
        {/* Ambient colored backdrop glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
          style={{
            background: isNetVibe
              ? 'radial-gradient(circle, #00d2ff, #0055ff)'
              : 'radial-gradient(circle, #dc2626, #f59e0b)',
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15 transition-all duration-700"
          style={{
            background: isNetVibe
              ? 'radial-gradient(circle, #3b82f6, #1e3a8a)'
              : 'radial-gradient(circle, #059669, #047857)',
          }}
        />

        {/* Poster Content Area (Responsive Grid Layout: Big Poster + Branded Info) */}
        <div className="relative z-10 flex flex-col md:flex-row items-stretch min-h-[200px] sm:min-h-[230px] md:min-h-[260px]">
          {/* Left / Top: High-prominence Poster Display */}
          <div className="relative md:w-5/12 lg:w-4/12 bg-neutral-950/90 p-4 sm:p-6 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-neutral-800/80 group">
            {/* Background texture watermark */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Poster / Logo Showcase */}
            <div className="relative z-10 w-full h-40 sm:h-48 md:h-52 flex items-center justify-center rounded-2xl bg-neutral-900/80 border border-neutral-800 p-3 shadow-inner overflow-hidden">
              {hasImageError ? (
                /* Fallback poster when image cannot be displayed */
                <div className="flex flex-col items-center justify-center text-center p-4">
                  {isNetVibe ? (
                    <NetVibeSvgEmblem sizePx={72} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-2">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  )}
                  <span className="font-sports font-bold text-sm text-white uppercase mt-2">
                    {localizedName}
                  </span>
                  <span className="text-xxs text-amber-400 font-semibold uppercase">
                    {localizedTier}
                  </span>
                </div>
              ) : (
                <img
                  key={currentSponsor.id}
                  src={currentSponsor.imageUrl}
                  alt={`${currentSponsor.name} official poster`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                  onError={() => {
                    setImageErrorMap((prev) => ({ ...prev, [currentSponsor.id]: true }));
                  }}
                  loading="eager"
                />
              )}

              {/* Verified Partner Stamp overlay */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-xxs text-neutral-300 font-semibold">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span className="uppercase tracking-wider text-[10px]">
                  {language === 'am' ? 'የተረጋገጠ አጋር' : 'Verified Partner'}
                </span>
              </div>
            </div>
          </div>

          {/* Right / Bottom: Sponsor Detail, Description & Actions */}
          <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between text-left">
            <div>
              {/* Category / Tier Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sports font-bold tracking-wider uppercase border ${
                    isNetVibe
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-950/50'
                      : 'bg-red-600/15 border-red-500/40 text-red-300 shadow-sm shadow-red-950/50'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{localizedTier}</span>
                </span>

                {isNetVibe && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/40 text-blue-300 text-xxs font-bold uppercase">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>
                      {language === 'am' ? 'መተግበሪያውን ያበለፀገ' : 'App Developer'}
                    </span>
                  </span>
                )}
              </div>

              {/* Sponsor Name */}
              <h3 className="text-2xl sm:text-3xl font-sports font-black text-white tracking-wide uppercase drop-shadow-sm">
                {localizedName}
              </h3>

              {/* Description / Mission statement */}
              {localizedDesc && (
                <p className="mt-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal max-w-2xl">
                  {localizedDesc}
                </p>
              )}
            </div>

            {/* Bottom Row: Link Button & Status Info */}
            <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xxs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {language === 'am'
                    ? 'ኦፊሴላዊ የሀላባ ከተማ እግር ኳስ ክለብ አጋር'
                    : 'Official Halaba City FC Sponsor & Technology Partner'}
                </span>
              </div>

              {currentSponsor.websiteUrl && (
                <a
                  href={currentSponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-sports font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/50 transition-all hover:scale-102 active:scale-95 group"
                >
                  <span>
                    {language === 'am'
                      ? 'አጋሩን ይጎብኙ'
                      : language === 'om'
                      ? 'Dhaabbata Daawwadhaa'
                      : 'Visit Partner'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators & Auto-Play Progress Bar */}
        <div className="bg-neutral-950/70 border-t border-neutral-800/60 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {activeSponsors.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-gradient-to-r from-red-500 to-amber-400'
                    : 'w-2 h-2 bg-neutral-700 hover:bg-neutral-500'
                }`}
                aria-label={`Go to slide ${idx + 1}: ${s.name}`}
              />
            ))}
          </div>

          <div className="text-xxs text-neutral-400 font-mono flex items-center gap-1">
            <Layers className="w-3 h-3 text-neutral-500" />
            <span>
              {language === 'am' ? 'ስፖንሰር' : 'Sponsor'} {currentIndex + 1} / {totalSponsors}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
