import { describe, it, expect } from 'vitest';
import { 
  computeCheckDigit, 
  validateFull, 
  parsePnr, 
  formatPnr,
  generateTestPnr,
  getCenturyMarker 
} from '../pnr';

describe('computeCheckDigit', () => {
  it('should calculate correct check digit for valid personal numbers', () => {
    // Test case 1: 850709-980 -> 5
    expect(computeCheckDigit(85, 7, 9, 980)).toBe(5);
    
    // Test case 2: 640823-323 -> 4  
    expect(computeCheckDigit(64, 8, 23, 323)).toBe(4);
    
    // Test case 3: Another known case
    expect(computeCheckDigit(94, 12, 31, 123)).toBe(8);
  });

  it('should handle coordination numbers correctly', () => {
    // Coordination number with day +60
    expect(computeCheckDigit(85, 7, 69, 980)).toBe(5); // Same as regular, but day is 69 (9+60)
  });

  it('should handle edge cases', () => {
    // New year's day
    expect(computeCheckDigit(0, 1, 1, 1)).toBe(8);
    
    // End of year
    expect(computeCheckDigit(99, 12, 31, 999)).toBe(0);
  });
});

describe('parsePnr', () => {
  it('should parse 9-digit format correctly', () => {
    const result = parsePnr('850709980');
    expect(result).toEqual({
      year: 85,
      month: 7,
      day: 9,
      serial: 980,
      checkDigit: null,
      isCoordinationNumber: false,
      isValid: true
    });
  });

  it('should parse 10-digit format correctly', () => {
    const result = parsePnr('8507099805');
    expect(result).toEqual({
      year: 85,
      month: 7,
      day: 9,
      serial: 980,
      checkDigit: 5,
      isCoordinationNumber: false,
      isValid: true
    });
  });

  it('should parse format with dash correctly', () => {
    const result = parsePnr('850709-9805');
    expect(result).toEqual({
      year: 85,
      month: 7,
      day: 9,
      serial: 980,
      checkDigit: 5,
      isCoordinationNumber: false,
      isValid: true
    });
  });

  it('should handle coordination numbers', () => {
    // Day 69 = 9 + 60 (coordination number)
    const result = parsePnr('850769-9805');
    expect(result.isCoordinationNumber).toBe(true);
    expect(result.day).toBe(69);
    expect(result.isValid).toBe(true);
  });

  it('should detect invalid months', () => {
    const result = parsePnr('851309980');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Ogiltig månad');
  });

  it('should detect invalid days', () => {
    const result = parsePnr('850732980');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Dag 32 finns inte i månad 7');
  });

  it('should handle February dates correctly', () => {
    // Valid February date
    const validFeb = parsePnr('850228980');
    expect(validFeb.isValid).toBe(true);
    
    // Invalid February date
    const invalidFeb = parsePnr('850230980');
    expect(invalidFeb.isValid).toBe(false);
  });

  it('should handle too short input', () => {
    const result = parsePnr('1234');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('För kort personnummer (minst 9 siffror krävs)');
  });

  it('should clean input properly', () => {
    const result = parsePnr('85 07 09-980 5');
    expect(result.year).toBe(85);
    expect(result.month).toBe(7);
    expect(result.day).toBe(9);
    expect(result.serial).toBe(980);
    expect(result.checkDigit).toBe(5);
  });
});

describe('validateFull', () => {
  it('should validate complete personal numbers correctly', () => {
    const result = validateFull('850709-9805');
    expect(result.isValid).toBe(true);
    expect(result.checkDigit).toBe(5);
    expect(result.formatted).toBe('850709-9805');
    expect(result.gender).toBe('female'); // Even serial number
  });

  it('should calculate check digit for incomplete numbers', () => {
    const result = validateFull('850709-980');
    expect(result.isValid).toBe(true);
    expect(result.checkDigit).toBe(5);
    expect(result.formatted).toBe('850709-9805');
    expect(result.gender).toBe('female');
  });

  it('should detect wrong check digits', () => {
    const result = validateFull('850709-9806'); // Wrong check digit
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Felaktig kontrollsiffra');
    expect(result.error).toContain('Förväntad: 5, fick: 6');
  });

  it('should determine gender correctly', () => {
    // Odd serial = male
    const male = validateFull('850709-981');
    expect(male.gender).toBe('male');
    
    // Even serial = female  
    const female = validateFull('850709-980');
    expect(female.gender).toBe('female');
  });

  it('should handle coordination numbers', () => {
    const result = validateFull('850769-980'); // Day 69 (9+60)
    expect(result.isCoordinationNumber).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it('should handle invalid input gracefully', () => {
    const result = validateFull('invalid');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('formatPnr', () => {
  it('should format personal numbers correctly', () => {
    expect(formatPnr(85, 7, 9, 980, 5)).toBe('850709-9805');
    expect(formatPnr(1, 1, 1, 1, 0)).toBe('010101-0010');
  });

  it('should pad numbers with zeros', () => {
    expect(formatPnr(5, 2, 3, 45, 6)).toBe('050203-0456');
  });
});

describe('getCenturyMarker', () => {
  it('should return - for people under 100', () => {
    expect(getCenturyMarker(50)).toBe('-'); // Born 1950
    expect(getCenturyMarker(0)).toBe('-');  // Born 2000
  });

  it('should return + for people over 100', () => {
    // This test might need adjustment based on current year
    const oldYear = new Date().getFullYear() - 150; // 150 years ago
    const shortYear = oldYear % 100;
    expect(getCenturyMarker(shortYear)).toBe('+');
  });
});

describe('generateTestPnr', () => {
  it('should generate valid test personal numbers', () => {
    const testPnr = generateTestPnr();
    expect(testPnr).toMatch(/^\d{6}-\d{4}$/); // Format check
    
    // Validate that the generated number is actually valid
    const validation = validateFull(testPnr);
    expect(validation.isValid).toBe(true);
  });

  it('should generate different numbers on multiple calls', () => {
    const pnr1 = generateTestPnr();
    const pnr2 = generateTestPnr();
    const pnr3 = generateTestPnr();
    
    // While theoretically possible to get duplicates, it's extremely unlikely
    expect(new Set([pnr1, pnr2, pnr3]).size).toBeGreaterThan(1);
  });
});