/**
 * Suggested CTA (Call-to-Action) labels for Toast and Snackbar notifications.
 * Use these with action.label for consistent UX across the ERP.
 */
export const NOTIFICATION_CTA = {
    retry: ['Retry', 'Try Again', 'Reload', 'Reconnect'],
    undo: ['Undo', 'Restore', 'Revert', 'Rollback'],
    update: ['Update', 'Edit', 'Fix Now', 'Save Changes', 'Complete Now'],
    cancel: ['Cancel', 'Dismiss', 'Close', 'Ignore'],
    navigation: ['View', 'Open', 'View Details', 'Go to Dashboard', 'Track Status'],
    permission: ['Request Access', 'Contact Admin', 'Upgrade Plan'],
    destructive: ['Confirm', 'Delete Permanently', 'Remove', 'Proceed']
} as const;

export type NotificationCTACategory = keyof typeof NOTIFICATION_CTA;
