import { describe, it, expect } from 'vitest';

// Simple OCR validation using Luhn algorithm
export function validateOcr(ocrNumber: string) {
  const cleaned = ocrNumber.replace(/\D/g, '');
  
  if (cleaned.length < 2) {
    return { isValid: false, error: 'Too short' };
  }

  const mainNumber = cleaned.slice(0, -1);
  const providedCheckDigit = parseInt(cleaned.slice(-1));
  
  let sum = 0;
  let alternate = false;
  
  for (let i = mainNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(mainNumber[i]);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit = digit - 9;
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  const isValid = calculatedCheckDigit === providedCheckDigit;
  
  return { isValid, checkDigit: calculatedCheckDigit };
}

describe('OCR validation', () => {
  it('should validate correct OCR numbers', () => {
    const result = validateOcr('123456789');
    expect(result.isValid).toBe(true);
  });

  it('should detect invalid OCR numbers', () => {
    const result = validateOcr('123456788'); // Wrong check digit
    expect(result.isValid).toBe(false);
  });

  it('should handle numbers with spaces', () => {
    const result = validateOcr('1234 5678 9');
    expect(result.isValid).toBe(true);
  });
});