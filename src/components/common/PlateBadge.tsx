import React from 'react';
import { formatPlateDisplay } from '../../utils/plateParser';

interface PlateBadgeProps {
  plateNumber: string;
  category?: 'FOUR_WHEELER' | 'TWO_WHEELER' | 'COMMERCIAL' | 'ELECTRIC' | 'UNKNOWN';
  ownershipType?: 'EMPLOYEE' | 'VISITOR' | 'VIP' | 'BLACKLISTED' | 'COMMERCIAL';
  size?: 'sm' | 'md' | 'lg';
  showIndStrip?: boolean;
  className?: string;
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({
  plateNumber,
  ownershipType,
  size = 'md',
  showIndStrip = true,
  className = '',
}) => {
  const formatted = formatPlateDisplay(plateNumber);

  // Determine plate background color based on vehicle classification
  // In India:
  // Standard private: White plate, black text
  // Commercial: Yellow plate, black text
  // EV: Green plate, white text
  // Blacklisted: Red highlight border
  let bgClass = 'bg-white text-zinc-950 border-zinc-400';
  let indStripColor = 'bg-blue-700 text-white';

  if (ownershipType === 'COMMERCIAL') {
    bgClass = 'bg-amber-400 text-black border-amber-500 font-extrabold';
  } else if (plateNumber.includes('EV') || ownershipType === 'EMPLOYEE' && plateNumber.startsWith('GJ01')) {
    // EV styling if applicable
    bgClass = 'bg-emerald-700 text-white border-emerald-800';
  }

  if (ownershipType === 'BLACKLISTED') {
    bgClass += ' ring-2 ring-red-500 ring-offset-1';
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1 tracking-wider',
    md: 'text-sm px-2.5 py-1 gap-1.5 tracking-widest',
    lg: 'text-base px-3.5 py-1.5 gap-2 tracking-widest font-bold',
  };

  const indSizes = {
    sm: 'text-[8px] px-0.5',
    md: 'text-[9px] px-1',
    lg: 'text-[10px] px-1.5',
  };

  return (
    <div
      className={`inline-flex items-center font-mono font-bold rounded border shadow-sm select-none ${bgClass} ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: "'Roboto Mono', 'Courier New', monospace",
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), inset 0 0 1px rgba(0,0,0,0.2)',
      }}
      title={`Indian Vehicle Registration: ${plateNumber}`}
    >
      {showIndStrip && (
        <div
          className={`flex flex-col items-center justify-center font-sans font-black uppercase rounded-xs ${indStripColor} ${indSizes[size]} -ml-1 py-0.5`}
        >
          <span className="text-[7px] leading-none opacity-80">🇮🇳</span>
          <span className="leading-none text-[8px] tracking-tighter">IND</span>
        </div>
      )}
      <span className="drop-shadow-xs">{formatted || plateNumber || 'NO PLATE'}</span>
    </div>
  );
};
