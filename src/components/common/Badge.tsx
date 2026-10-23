import React from 'react';
import { MembershipTier, AccountStatus } from '../../types/frequentFlyer';

interface BadgeProps {
  type?: 'tier' | 'status';
  value: MembershipTier | AccountStatus | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ type = 'tier', value, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  let styleClass = 'bg-mono-100 text-mono-800 border border-mono-300';

  if (type === 'tier') {
    switch (value) {
      case 'Diamond':
        styleClass = 'bg-mono-950 text-mono-50 border border-mono-950 font-bold';
        break;
      case 'Platinum':
        styleClass = 'bg-mono-800 text-mono-100 border border-mono-700 font-semibold';
        break;
      case 'Gold':
        styleClass = 'bg-mono-200 text-mono-900 border border-mono-400 font-semibold';
        break;
      case 'Silver':
        styleClass = 'bg-mono-100 text-mono-800 border border-mono-300';
        break;
    }
  } else if (type === 'status') {
    switch (value) {
      case 'Active':
        styleClass = 'bg-mono-100 text-mono-900 border border-mono-400 font-medium';
        break;
      case 'Suspended':
        styleClass = 'bg-mono-200 text-mono-800 border border-mono-500 line-through';
        break;
      case 'Pending':
        styleClass = 'bg-mono-50 text-mono-600 border border-dashed border-mono-400';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded tracking-wide uppercase ${sizeClass} ${styleClass}`}
      role="status"
      aria-label={`${type}: ${value}`}
    >
      {value}
    </span>
  );
};
