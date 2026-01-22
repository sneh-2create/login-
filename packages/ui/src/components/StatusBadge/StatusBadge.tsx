import { StatusBadgeProps } from '@od-erp/types';
import {
    STATUS_BADGE_STYLES,
    STATUS_BADGE_WIDTH_MAP,
    DEFAULT_STATUS_BADGE_STYLES,
    DEFAULT_BADGE_WIDTH,
} from '@od-erp/constants';

export function StatusBadge({
  label,
  variant,
  customBgColor,
  customTextColor,
  className = '',
}: StatusBadgeProps) {
  const getStatusBadgeStyles = () => {
    if (variant === 'custom') {
      return `${customBgColor || 'bg-ui-gray-100'} ${customTextColor || 'text-ui-gray-800'}`;
    }
    return STATUS_BADGE_STYLES[variant] || DEFAULT_STATUS_BADGE_STYLES;
  };

  const getWidth = () => {
    if (variant === 'custom') {
      return DEFAULT_BADGE_WIDTH;
    }
    return STATUS_BADGE_WIDTH_MAP[variant] || DEFAULT_BADGE_WIDTH;
  };

  const badgeStyles = getStatusBadgeStyles();
  const width = variant !== 'custom' ? getWidth() : 'w-auto';

  return (
    <span
      className={`inline-flex items-center justify-center ${width} h-[25px] px-3 py-1.5 rounded-full ${badgeStyles} text-[11px] font-bold leading-[13.3125px] tracking-ui-tighter text-center ${className}`}
    >
      {label}
    </span>
  );
}
