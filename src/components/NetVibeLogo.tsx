import React, { useState } from 'react';
import netvibeLogoImg from '../assets/images/netvibe-logo.jpeg';
import { Language } from '../types';

interface NetVibeLogoProps {
  className?: string;
  imgClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  language?: Language | string;
}

/**
 * NetVibe SVG Emblem Fallback
 * Accurately replicates the NetVibe Digital Solutions cyan/blue 3D 'N' with orbital ring and tech pixels
 */
export const NetVibeSvgEmblem: React.FC<{ sizePx?: number; className?: string }> = ({
  sizePx = 48,
  className = '',
}) => {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="NetVibe Digital Solutions Logo"
    >
      <defs>
        <radialGradient id="nvBgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a2540" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#030712" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="nvCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#0091FF" />
          <stop offset="100%" stopColor="#0055FF" />
        </linearGradient>
        <linearGradient id="nvRingGlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="70%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <filter id="nvGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark background capsule */}
      <rect width="120" height="120" rx="24" fill="url(#nvBgGlow)" />

      {/* Subtle outer tech border */}
      <rect
        x="1.5"
        y="1.5"
        width="117"
        height="117"
        rx="22.5"
        stroke="#00E5FF"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      <g transform="translate(10, 10)">
        {/* Orbital Ring - Back Segment */}
        <ellipse
          cx="50"
          cy="48"
          rx="44"
          ry="20"
          transform="rotate(-28 50 48)"
          stroke="url(#nvRingGlow)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="180 80"
          strokeDashoffset="30"
          filter="url(#nvGlowFilter)"
        />

        {/* 3D Stylized 'N' */}
        {/* Left vertical pillar */}
        <path
          d="M32 30 C32 23 37 19 44 23 L44 76 C36 76 32 72 32 65 Z"
          fill="url(#nvCyanBlue)"
        />
        {/* Diagonal bridge */}
        <path
          d="M36 24 L68 70 C72 76 68 81 60 81 L46 81 L32 60 Z"
          fill="#0091FF"
        />
        {/* Right vertical pillar */}
        <path
          d="M58 35 L68 35 C74 35 77 39 77 46 L77 78 C70 81 64 77 64 70 Z"
          fill="url(#nvCyanBlue)"
        />

        {/* Orbital Ring - Front Segment */}
        <ellipse
          cx="50"
          cy="48"
          rx="44"
          ry="20"
          transform="rotate(-28 50 48)"
          stroke="url(#nvRingGlow)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray="90 170"
          strokeDashoffset="140"
        />

        {/* Digital Tech Pixel Cubes on Upper Right */}
        <rect x="74" y="16" width="6" height="6" rx="1.2" fill="#00E5FF" opacity="0.9" />
        <rect x="83" y="21" width="5" height="5" rx="1" fill="#38BDF8" opacity="0.8" />
        <rect x="73" y="25" width="5" height="5" rx="1" fill="#0284C7" opacity="0.85" />
      </g>
    </svg>
  );
};

export const NetVibeLogo: React.FC<NetVibeLogoProps> = ({
  className = '',
  imgClassName = '',
  size = 'md',
  showText = false,
  language = 'en',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeDimensions = {
    xs: { px: 28, box: 'w-7 h-7' },
    sm: { px: 36, box: 'w-9 h-9' },
    md: { px: 48, box: 'w-12 h-12' },
    lg: { px: 64, box: 'w-16 h-16' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Badge */}
      <div
        className={`${sizeDimensions.box} rounded-xl overflow-hidden bg-[#050b17] border border-cyan-500/40 p-0.5 shadow-md shadow-cyan-950/60 shrink-0 flex items-center justify-center`}
      >
        {!hasError ? (
          <img
            src={netvibeLogoImg}
            alt="NetVibe Digital Solutions"
            onError={() => setHasError(true)}
            className={`w-full h-full object-contain rounded-lg ${imgClassName}`}
            loading="eager"
            decoding="async"
          />
        ) : (
          <NetVibeSvgEmblem sizePx={sizeDimensions.px} className="w-full h-full" />
        )}
      </div>

      {/* Optional Side Text */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-wide">
              {language === 'am'
                ? 'የመተግበሪያ አዘጋጅ: NetVibe Digital Solutions'
                : language === 'om'
                ? 'Misoomsituu Appii: NetVibe Digital Solutions'
                : 'Developed by NetVibe Digital Solutions'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/90 text-cyan-300 border border-cyan-700/50">
              Tech Partner
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {language === 'am'
              ? 'IDEAS • CODE • IMPACT — ለሀላባ ከተማ እግርኳስ ክለብ በልዩ ጥራት የተዘጋጀ ይፋዊ መተግበሪያ'
              : language === 'om'
              ? 'IDEAS • CODE • IMPACT — Appilikeeshinii fi waltajjii dijitaalaa seera-qabeessa'
              : 'IDEAS • CODE • IMPACT — Official digital portal & mobile application partner'}
          </p>
        </div>
      )}
    </div>
  );
};
