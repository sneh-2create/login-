export const BADGE_VARIANTS = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-ui-status-paid-bg text-ui-green',
    warning: 'bg-ui-status-pending-bg text-ui-orange-light',
    error: 'bg-ui-status-failed-bg text-ui-red',
    outline: 'border border-gray-200 text-gray-600',
    custom: '',
    // Admission Stages
    lead: 'bg-blue-100 text-blue-800',
    registered: 'bg-blue-100 text-blue-800',
    'data requested': 'bg-ui-status-pending-bg text-ui-orange-light',
    approved: 'bg-ui-status-paid-bg text-ui-green',
    rejected: 'bg-ui-status-failed-bg text-ui-red',
    withdrawn: 'bg-ui-status-failed-bg text-ui-red',
} as const;
