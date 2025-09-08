import { describe, it, expect } from 'vitest';

// Simple salary calculation function for testing
export function calculateEmployerCost(grossSalary: number, employerFeeRate: number, extraCosts: number = 0) {
  const socialFees = (grossSalary * employerFeeRate) / 100;
  const totalMonthly = grossSalary + socialFees + extraCosts;
  
  return {
    grossSalary,
    socialFees,
    extraCosts,
    totalMonthly,
    totalYearly: totalMonthly * 12
  };
}

describe('salary calculations', () => {
  it('should calculate correct employer cost with standard rate', () => {
    const result = calculateEmployerCost(35000, 31.42, 300);
    
    expect(result.grossSalary).toBe(35000);
    expect(result.socialFees).toBeCloseTo(10997, 0); // 35000 * 0.3142
    expect(result.extraCosts).toBe(300);
    expect(result.totalMonthly).toBeCloseTo(46297, 0);
    expect(result.totalYearly).toBeCloseTo(555564, 0);
  });

  it('should handle zero extra costs', () => {
    const result = calculateEmployerCost(30000, 31.42);
    
    expect(result.extraCosts).toBe(0);
    expect(result.totalMonthly).toBeCloseTo(39426, 0);
  });

  it('should calculate reduced rate for young employees', () => {
    const result = calculateEmployerCost(25000, 15.49); // Reduced rate for 18-19 year olds
    
    expect(result.socialFees).toBeCloseTo(3872.5, 0);
    expect(result.totalMonthly).toBeCloseTo(28872.5, 0);
  });
});