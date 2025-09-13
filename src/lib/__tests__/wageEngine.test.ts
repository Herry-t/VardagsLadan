import { describe, it, expect } from 'vitest';
import { WageEngine, wageConfig, roundHours, WageInput } from '../wageEngine';

describe('WageEngine', () => {
  const engine = new WageEngine(wageConfig);

  const baseInput: WageInput = {
    period: { start: '2025-09-01', end: '2025-09-30' },
    employee: { name: 'Test Person', id: '12345' },
    hourlyRate: 150,
    roundingStep: 'none',
    regularHours: 160,
    additionalRows: [],
    vacationPercent: 12.0,
    vacationBase: { regular: true, ob: true, overtime: false, merit: false, addons: false }
  };

  it('should calculate basic regular hours correctly', () => {
    const result = engine.calculate(baseInput);
    
    expect(result.summary.regularAmount).toBe(160 * 150); // 24000
    expect(result.summary.vacationBaseAmount).toBe(24000);
    expect(result.summary.vacationAmount).toBe(24000 * 0.12); // 2880
    expect(result.summary.grossPayAmount).toBe(24000 + 2880); // 26880
  });

  it('should apply overtime factor correctly', () => {
    const input = {
      ...baseInput,
      additionalRows: [
        { type: 'overtime' as const, label: 'ÖT1', hours: 20, factor: 1.5, includeInVacationBase: false }
      ]
    };
    
    const result = engine.calculate(input);
    
    expect(result.summary.overtimeAmount).toBe(20 * 150 * 1.5); // 4500
    // Overtime not included in vacation base by default
    expect(result.summary.vacationBaseAmount).toBe(160 * 150); // 24000
    expect(result.summary.grossPayAmount).toBe(24000 + 4500 + (24000 * 0.12));
  });

  it('should handle OB percent vs fixed rate correctly', () => {
    const input = {
      ...baseInput,
      additionalRows: [
        { type: 'ob-percent' as const, label: 'OB Kväll', hours: 30, percent: 20, includeInVacationBase: true },
        { type: 'ob-fixed' as const, label: 'OB Helg', hours: 10, amountPerHour: 50, includeInVacationBase: true }
      ]
    };
    
    const result = engine.calculate(input);
    
    const obPercentAmount = 30 * 150 * 0.20; // 900
    const obFixedAmount = 10 * 50; // 500
    expect(result.summary.obAmount).toBe(obPercentAmount + obFixedAmount); // 1400
  });

  it('should respect vacation base checkboxes', () => {
    const input = {
      ...baseInput,
      regularHours: 100,
      additionalRows: [
        { type: 'overtime' as const, label: 'ÖT1', hours: 20, factor: 1.5, includeInVacationBase: true }
      ],
      vacationBase: { regular: true, ob: true, overtime: true, merit: false, addons: false }
    };
    
    const result = engine.calculate(input);
    
    const regularAmount = 100 * 150; // 15000
    const overtimeAmount = 20 * 150 * 1.5; // 4500
    expect(result.summary.vacationBaseAmount).toBe(regularAmount + overtimeAmount); // 19500
    expect(result.summary.vacationAmount).toBe(19500 * 0.12); // 2340
    expect(result.summary.grossPayAmount).toBe(15000 + 4500 + 2340); // 21840
  });

  it('should calculate deduction as negative amount', () => {
    const input = {
      ...baseInput,
      additionalRows: [
        { type: 'deduction' as const, label: 'Avdrag', amount: 1200, includeInVacationBase: false }
      ]
    };
    
    const result = engine.calculate(input);
    
    expect(result.summary.absenceAmount).toBe(-1200); // -1200
    expect(result.summary.grossPayAmount).toBe((160 * 150) + (160 * 150 * 0.12) - 1200);
  });
});

describe('roundHours', () => {
  it('should round to nearest 0.25', () => {
    expect(roundHours(8.1, '0.25')).toBe(8);
    expect(roundHours(8.13, '0.25')).toBe(8.25);
    expect(roundHours(8.37, '0.25')).toBe(8.5);
    expect(roundHours(8.63, '0.25')).toBe(8.5);
    expect(roundHours(8.88, '0.25')).toBe(9);
  });

  it('should round to nearest 0.5', () => {
    expect(roundHours(8.1, '0.5')).toBe(8);
    expect(roundHours(8.3, '0.5')).toBe(8.5);
    expect(roundHours(8.7, '0.5')).toBe(9);
  });

  it('should not round when step is none', () => {
    expect(roundHours(8.123456, 'none')).toBe(8.123456);
  });
});