/**
 * Mask phone number to show only last 4 digits
 * Format: XXX-XXX-1234
 */
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 10) return phone;
  const last4 = phone.slice(-4);
  return `XXX-XXX-${last4}`;
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone: string, shouldMask: boolean): string => {
  if (shouldMask) {
    return maskPhone(phone);
  }
  return phone;
};
