import React from 'react';
import { HadiyaCrest } from './HadiyaCrest';

interface HalabaCrestProps {
  className?: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showGlow?: boolean;
}

export const HalabaCrest: React.FC<HalabaCrestProps> = ({
  className = '',
  size = 'md',
  showGlow = false,
}) => {
  const mappedSize = typeof size === 'number'
    ? (size <= 28 ? 'xs' : size <= 36 ? 'sm' : size <= 52 ? 'md' : size <= 72 ? 'lg' : size <= 100 ? 'xl' : '2xl')
    : size;

  return <HadiyaCrest className={className} size={mappedSize} glow={showGlow} />;
};

export { HadiyaCrest };
