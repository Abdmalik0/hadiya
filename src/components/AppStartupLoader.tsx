import React, { useState, useEffect } from 'react';
import { HalabaCrest } from './HalabaCrest';
import { NetVibeLogo } from './NetVibeLogo';
import { Loader2 } from 'lucide-react';

interface AppStartupLoaderProps {
  onLoaded?: () => void;
  minDurationMs?: number;
}

export const AppStartupLoader: React.FC<AppStartupLoaderProps> = ({
  onLoaded,
  minDurationMs = 1200,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Graceful startup timer
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, minDurationMs);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      onLoaded?.();
    }, minDurationMs + 500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [minDurationMs, onLoaded]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        setTimeout(() => {
          setIsVisible(false);
          onLoaded?.();
        }, 300);
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 select-none cursor-pointer transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } bg-neutral-950/75 backdrop-blur-[3px]`}
      aria-label="Loading Halaba City FC Portal"
    >
      {/* Central Glassmorphism Card */}
      <div className="relative flex flex-col items-center text-center p-7 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800/90 shadow-2xl shadow-black/80 max-w-xs sm:max-w-sm w-full mx-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-red-600/20 via-amber-500/20 to-emerald-600/20 blur-xl opacity-75 -z-10" />

        {/* Animated Halaba Crest with Spinning Orbit Ring */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Spinning Ring */}
          <div className="absolute -inset-3.5 rounded-full border-2 border-dashed border-red-500/50 animate-[spin_6s_linear_infinite]" />
          <div className="absolute -inset-2 rounded-full border border-amber-400/30 animate-[spin_4s_linear_infinite_reverse]" />

          {/* Halaba Crest */}
          <div className="relative rounded-full p-2 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-700/80 shadow-lg drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <HalabaCrest size={68} />
          </div>

          {/* Secondary Spinning Spinner Icon */}
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1.5 shadow-md border border-red-400 animate-spin">
            <Loader2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Brand Headline */}
        <h2 className="font-sports font-black text-xl sm:text-2xl text-white tracking-wider uppercase mb-1 drop-shadow-sm">
          Hadiya Hossana FC
        </h2>
        <p className="text-xs font-semibold text-amber-400 tracking-wide font-sports uppercase mb-3">
          የኢትዮጵያ ፕሪሚየር ሊግ • 2026/27
        </p>

        {/* Animated Progress Bar */}
        <div className="w-40 sm:w-48 h-1.5 bg-neutral-800/90 rounded-full overflow-hidden p-0.5 border border-neutral-700/60 shadow-inner">
          <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite]" />
        </div>

        {/* Subtext */}
        <span className="text-xxs text-neutral-400 font-mono uppercase tracking-widest mt-3.5">
          Loading Official Club Portal...
        </span>

        {/* Developer Attribution by NetVibe */}
        <div className="mt-5 pt-3.5 border-t border-neutral-800/80 w-full flex items-center justify-center gap-2.5">
          <NetVibeLogo size="xs" />
          <div className="text-left">
            <span className="block text-[9px] text-neutral-400 font-semibold uppercase tracking-wider leading-none">
              Developed by
            </span>
            <span className="text-xs font-bold text-sky-400 tracking-wide leading-tight">
              NetVibe Digital Solutions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
