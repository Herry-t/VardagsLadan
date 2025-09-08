/**
 * Swedish Personal Number (Personnummer) utilities
 * Using Luhn/Mod10 algorithm for check digit calculation and validation
 */

export interface ParsedPnr {
  year: number;
  month: number;
  day: number;
  serial: number;
  checkDigit: number | null;
  century?: number;
  isCoordinationNumber: boolean;
  isValid: boolean;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  checkDigit?: number;
  formatted?: string;
  gender?: 'male' | 'female';
  isCoordinationNumber?: boolean;
}

/**
 * Clean input by removing non-digits except for separators
 */
export function cleanInput(input: string): string {
  return input.replace(/[^\d\-+]/g, '');
}

/**
 * Parse a personal number from various formats
 * Supports: ÅÅMMDD-NNN, ÅÅMMDDNNN, ÅÅÅÅMMDD-NNNC, ÅÅÅÅMMDDNNNC
 */
export function parsePnr(input: string): ParsedPnr {
  const cleaned = cleanInput(input);
  
  // Remove separators for parsing
  const digits = cleaned.replace(/[\-+]/g, '');
  
  if (digits.length < 9) {
    return {
      year: 0,
      month: 0,
      day: 0,
      serial: 0,
      checkDigit: null,
      isCoordinationNumber: false,
      isValid: false,
      error: 'För kort personnummer (minst 9 siffror krävs)'
    };
  }

  let year: number, month: number, day: number, serial: number, checkDigit: number | null = null;
  let century: number | undefined;

  if (digits.length === 9) {
    // ÅÅMMDDNNN format
    year = parseInt(digits.substring(0, 2));
    month = parseInt(digits.substring(2, 4));
    day = parseInt(digits.substring(4, 6));
    serial = parseInt(digits.substring(6, 9));
  } else if (digits.length === 10) {
    // ÅÅMMDDNNNC format
    year = parseInt(digits.substring(0, 2));
    month = parseInt(digits.substring(2, 4));
    day = parseInt(digits.substring(4, 6));
    serial = parseInt(digits.substring(6, 9));
    checkDigit = parseInt(digits.substring(9, 10));
  } else if (digits.length === 11) {
    // ÅÅÅÅMMDDNNC format (with century)
    const fullYear = parseInt(digits.substring(0, 4));
    century = Math.floor(fullYear / 100) * 100;
    year = fullYear % 100;
    month = parseInt(digits.substring(4, 6));
    day = parseInt(digits.substring(6, 8));
    serial = parseInt(digits.substring(8, 10));
    checkDigit = parseInt(digits.substring(10, 11));
  } else if (digits.length === 12) {
    // ÅÅÅÅMMDDNNNC format (full format)
    const fullYear = parseInt(digits.substring(0, 4));
    century = Math.floor(fullYear / 100) * 100;
    year = fullYear % 100;
    month = parseInt(digits.substring(4, 6));
    day = parseInt(digits.substring(6, 8));
    serial = parseInt(digits.substring(8, 11));
    checkDigit = parseInt(digits.substring(11, 12));
  } else {
    return {
      year: 0,
      month: 0,
      day: 0,
      serial: 0,
      checkDigit: null,
      isCoordinationNumber: false,
      isValid: false,
      error: 'Ogiltigt format för personnummer'
    };
  }

  // Check for coordination number (day + 60)
  const isCoordinationNumber = day > 60;
  const actualDay = isCoordinationNumber ? day - 60 : day;

  // Validate date
  if (month < 1 || month > 12) {
    return {
      year,
      month,
      day,
      serial,
      checkDigit,
      century,
      isCoordinationNumber,
      isValid: false,
      error: 'Ogiltig månad'
    };
  }

  if (actualDay < 1 || actualDay > 31) {
    return {
      year,
      month,
      day,
      serial,
      checkDigit,
      century,
      isCoordinationNumber,
      isValid: false,
      error: 'Ogiltig dag'
    };
  }

  // More precise date validation
  const daysInMonth = new Date(2000, month, 0).getDate(); // Using year 2000 as reference
  if (actualDay > daysInMonth) {
    return {
      year,
      month,
      day,
      serial,
      checkDigit,
      century,
      isCoordinationNumber,
      isValid: false,
      error: `Dag ${actualDay} finns inte i månad ${month}`
    };
  }

  return {
    year,
    month,
    day,
    serial,
    checkDigit,
    century,
    isCoordinationNumber,
    isValid: true
  };
}

/**
 * Calculate check digit using Luhn algorithm
 */
export function computeCheckDigit(year: number, month: number, day: number, serial: number): number {
  // Create the 9-digit string: YYMMDDNNN
  const digits = [
    Math.floor(year / 10) % 10,
    year % 10,
    Math.floor(month / 10) % 10,
    month % 10,
    Math.floor(day / 10) % 10,
    day % 10,
    Math.floor(serial / 100) % 10,
    Math.floor(serial / 10) % 10,
    serial % 10
  ];

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = digits[i];
    
    // Multiply every second digit by 2 (starting from the first)
    if (i % 2 === 0) {
      digit *= 2;
      
      // If result is > 9, sum the digits
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
  }

  // Check digit is what's needed to make the sum divisible by 10
  return (10 - (sum % 10)) % 10;
}

/**
 * Validate a complete personal number
 */
export function validateFull(input: string): ValidationResult {
  const parsed = parsePnr(input);
  
  if (!parsed.isValid || parsed.error) {
    return {
      isValid: false,
      error: parsed.error || 'Ogiltigt personnummer'
    };
  }

  if (parsed.checkDigit === null) {
    // Calculate check digit for incomplete number
    const checkDigit = computeCheckDigit(parsed.year, parsed.month, parsed.day, parsed.serial);
    return {
      isValid: true,
      checkDigit,
      formatted: formatPnr(parsed.year, parsed.month, parsed.day, parsed.serial, checkDigit),
      gender: parsed.serial % 2 === 0 ? 'female' : 'male',
      isCoordinationNumber: parsed.isCoordinationNumber
    };
  }

  // Validate existing check digit
  const expectedCheckDigit = computeCheckDigit(parsed.year, parsed.month, parsed.day, parsed.serial);
  const isValid = parsed.checkDigit === expectedCheckDigit;

  return {
    isValid,
    error: isValid ? undefined : `Felaktig kontrollsiffra. Förväntad: ${expectedCheckDigit}, fick: ${parsed.checkDigit}`,
    checkDigit: expectedCheckDigit,
    formatted: formatPnr(parsed.year, parsed.month, parsed.day, parsed.serial, expectedCheckDigit),
    gender: parsed.serial % 2 === 0 ? 'female' : 'male',
    isCoordinationNumber: parsed.isCoordinationNumber
  };
}

/**
 * Format a personal number in standard format
 */
export function formatPnr(year: number, month: number, day: number, serial: number, checkDigit: number): string {
  const yy = year.toString().padStart(2, '0');
  const mm = month.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  const nnn = serial.toString().padStart(3, '0');
  
  return `${yy}${mm}${dd}-${nnn}${checkDigit}`;
}

/**
 * Determine century marker based on age
 */
export function getCenturyMarker(year: number): string {
  const currentYear = new Date().getFullYear();
  const fullYear = year + (year < 50 ? 2000 : 1900);
  const age = currentYear - fullYear;
  
  return age >= 100 ? '+' : '-';
}

/**
 * Generate a test personal number (for testing purposes only)
 */
export function generateTestPnr(): string {
  const year = Math.floor(Math.random() * 100);
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Safe day range
  const serial = Math.floor(Math.random() * 999) + 1; // Avoid 000
  
  const checkDigit = computeCheckDigit(year, month, day, serial);
  return formatPnr(year, month, day, serial, checkDigit);
}