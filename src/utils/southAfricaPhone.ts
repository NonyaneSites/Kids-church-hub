/**
 * South African Phone & WhatsApp Validation and Formatting Utilities
 * Country Code: +27 (ZA)
 * Standard formats: 082 123 4567 / +27 82 123 4567 / 27821234567
 */

export interface SAPhoneValidationResult {
  isValid: boolean;
  errorMessage?: string;
  normalized?: string;
}

/**
 * Normalizes any South African phone representation into standard international E.164 (+27XXXXXXXXX)
 */
export function normalizeToE164ZA(rawPhone: string): string {
  if (!rawPhone) return '';
  // Remove all non-digits except leading plus
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+27')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('27')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Remove any remaining non-digits
  cleaned = cleaned.replace(/\D/g, '');

  return `+27${cleaned}`;
}

/**
 * Validates whether a phone number is a valid South African number
 * Mobile prefixes typically start with 06, 07, or 08 (9 digits following 0 or +27)
 */
export function validateSouthAfricanPhone(rawPhone: string): SAPhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      errorMessage: 'South African phone / WhatsApp number is required.',
    };
  }

  // Remove spaces, hyphens, parentheses
  const cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, '');

  // Check valid patterns:
  // 1. Starts with +27 followed by 9 digits
  // 2. Starts with 27 followed by 9 digits
  // 3. Starts with 0 followed by 9 digits
  const zaMobilePattern = /^(?:\+27|27|0)([1-9]\d{8})$/;

  const match = cleaned.match(zaMobilePattern);
  if (!match) {
    return {
      isValid: false,
      errorMessage: 'Invalid South African number. Expected 10 digits (e.g. 082 123 4567) or +27 format (+27 82 123 4567).',
    };
  }

  const nationalNumber = match[1];
  // Mobile numbers in SA start with 6, 7, 8; landlines start with 1, 2, 3, 4, 5
  // Both are accepted, but mobile is preferred
  const normalized = `+27${nationalNumber}`;

  return {
    isValid: true,
    normalized,
  };
}

/**
 * Formats a South African number for readable display: +27 82 123 4567
 */
export function formatSouthAfricanDisplay(rawPhone: string): string {
  if (!rawPhone) return '';
  const validation = validateSouthAfricanPhone(rawPhone);
  if (!validation.isValid || !validation.normalized) {
    return rawPhone;
  }

  // validation.normalized is +27XXXXXXXXX (length 12)
  const digits = validation.normalized.replace('+27', '');
  if (digits.length === 9) {
    const part1 = digits.substring(0, 2); // e.g. 82
    const part2 = digits.substring(2, 5); // e.g. 123
    const part3 = digits.substring(5, 9); // e.g. 4567
    return `+27 ${part1} ${part2} ${part3}`;
  }

  return validation.normalized;
}

/**
 * Generates a direct WhatsApp link (https://wa.me/27821234567)
 */
export function getSouthAfricaWhatsAppLink(rawPhone: string, message?: string): string {
  if (!rawPhone) return '';
  const e164 = normalizeToE164ZA(rawPhone);
  // WhatsApp wa.me requires digits only without leading +
  const waNumber = e164.replace(/\D/g, '');
  if (!waNumber || waNumber.length < 10) return '';

  const baseUrl = `https://wa.me/${waNumber}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}
