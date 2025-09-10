import { describe, it, expect } from 'vitest';
import { TaxEngine } from '../taxEngine';
import { config2025 } from '../config/2025';

describe('TaxEngine', () => {
  const engine = new TaxEngine(config2025);

  describe('calculatePrivatperson', () => {
    it('should calculate correct tax for salary under state tax threshold', () => {
      const result = engine.calculatePrivatperson({
        kommun: 'Stockholm',
        age: 30,
        bruttolonManad: 35000,
        kyrkomedlem: false,
        extraAvdragManad: 0
      });

      expect(result.arslon).toBe(420000);
      expect(result.statligSkatt).toBe(0); // Under threshold
      expect(result.kommunalSkatt).toBeCloseTo(75516, 0); // 420000 * 0.1798
      expect(result.regionalSkatt).toBeCloseTo(50736, 0); // 420000 * 0.1208
      expect(result.kyrkoavgift).toBe(0); // Not a church member
      expect(result.nettolonManad).toBeGreaterThan(20000);
    });

    it('should calculate state tax for high earners', () => {
      const result = engine.calculatePrivatperson({
        kommun: 'Stockholm',
        age: 30,
        bruttolonManad: 60000, // 720000/year - above threshold
        kyrkomedlem: false,
        extraAvdragManad: 0
      });

      expect(result.arslon).toBe(720000);
      expect(result.statligSkatt).toBeGreaterThan(0); // Above threshold
      expect(result.statligSkatt).toBeCloseTo(24300, 0); // (720000-598500)*0.2
    });

    it('should include church tax for members', () => {
      const result = engine.calculatePrivatperson({
        kommun: 'Stockholm',
        age: 30,
        bruttolonManad: 35000,
        kyrkomedlem: true,
        extraAvdragManad: 0
      });

      expect(result.kyrkoavgift).toBeGreaterThan(0);
      expect(result.kyrkoavgift).toBeCloseTo(2730, 0); // 420000 * 0.0065
    });

    it('should handle extra tax deductions', () => {
      const result = engine.calculatePrivatperson({
        kommun: 'Stockholm',
        age: 30,
        bruttolonManad: 35000,
        kyrkomedlem: false,
        extraAvdragManad: 1000
      });

      const resultWithoutDeduction = engine.calculatePrivatperson({
        kommun: 'Stockholm',
        age: 30,
        bruttolonManad: 35000,
        kyrkomedlem: false,
        extraAvdragManad: 0
      });

      expect(result.nettolonManad).toBeGreaterThan(resultWithoutDeduction.nettolonManad);
      expect(result.totalSkatt).toBeLessThan(resultWithoutDeduction.totalSkatt);
    });
  });

  describe('calculateArbetsgivare', () => {
    it('should calculate standard employer costs for adult employee', () => {
      const result = engine.calculateArbetsgivare({
        bruttolonManad: 35000,
        age: 30,
        semesterProc: 12,
        pensionProc: 4.5
      });

      expect(result.bruttolonManad).toBe(35000);
      expect(result.arbetsgivaravgift).toBeCloseTo(10997, 0); // 35000 * 0.3142
      expect(result.semesterpaslag).toBe(4200); // 35000 * 0.12
      expect(result.pension).toBe(1575); // 35000 * 0.045
      expect(result.totalkostnadManad).toBeCloseTo(51772, 0);
      expect(result.kostnadPerTimme).toBeCloseTo(313.77, 2);
    });

    it('should use reduced employer fee for young employees', () => {
      const result = engine.calculateArbetsgivare({
        bruttolonManad: 25000,
        age: 19, // Reduced rate age
        semesterProc: 12,
        pensionProc: 0
      });

      expect(result.arbetsgivaravgift).toBeCloseTo(3872.5, 0); // 25000 * 0.1549
      expect(result.totalkostnadManad).toBe(28872.5); // 25000 + 3872.5 + 3000 + 0
    });

    it('should use reduced employer fee for senior employees', () => {
      const result = engine.calculateArbetsgivare({
        bruttolonManad: 30000,
        age: 66, // Senior rate
        semesterProc: 12,
        pensionProc: 0
      });

      expect(result.arbetsgivaravgift).toBeCloseTo(3063, 0); // 30000 * 0.1021
      expect(result.totalkostnadManad).toBe(36663); // 30000 + 3063 + 3600 + 0
    });

    it('should handle zero pension contribution', () => {
      const result = engine.calculateArbetsgivare({
        bruttolonManad: 30000,
        age: 25,
        semesterProc: 12,
        pensionProc: 0
      });

      expect(result.pension).toBe(0);
      expect(result.totalkostnadManad).toBe(43026); // Without pension
    });
  });
});