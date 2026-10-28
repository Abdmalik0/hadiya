import React, { useState } from 'react';
import { HossanaCrestUrl } from '../assets/images';

interface HadiyaCrestProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  glow?: boolean;
  withRing?: boolean;
}

export const HadiyaCrest: React.FC<HadiyaCrestProps> = ({
  className = '',
  size = 'md',
  glow = false,
  withRing = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  }[size];

  if (imageFailed) {
    return (
      <div
        className={`${sizeClasses} ${className} flex items-center justify-center rounded-xl bg-gradient-to-br from-red-950 via-[#660f1e] to-neutral-900 border border-amber-500/40 shadow-inner text-amber-300 font-bold font-sports select-none`}
        title="Hadiya Hossana FC"
      >
        <span className="text-[0.65em] tracking-tight">HHFC</span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 ${sizeClasses} ${
        withRing ? 'p-1 rounded-2xl bg-gradient-to-b from-amber-500/30 to-red-950/40 border border-amber-500/30' : ''
      } ${glow ? 'drop-shadow-[0_0_18px_rgba(217,119,6,0.35)]' : 'drop-shadow-md'} ${className}`}
    >
      <img
        src={HossanaCrestUrl}
        alt="Hadiya Hossana Football Club Official Crest"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className="w-full h-full object-contain filter drop-shadow select-none"
        loading="eager"
      />
    </div>
  );
};
