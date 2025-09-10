import { TaxConfig } from '../taxEngine';

export const config2025: TaxConfig = {
  taxYear: 2025,
  lastUpdatedISO: "2024-12-15T10:00:00Z",
  statligSkattProc: 20,
  brytpunktAr: 598500, // State tax threshold for 2025
  begravningProc: 0.253, // Burial fee
  kyrkoProc: 1.0, // Average church fee
  
  // Kommun + region tax rates (sample data - real implementation would have all Swedish municipalities)
  kommunSkattMap: {
    'FALLBACK': { kommun: 20.2, region: 11.5, kyrka: 1.0 }, // National average
    'Stockholm': { kommun: 17.98, region: 12.08, kyrka: 0.65 },
    'Göteborg': { kommun: 21.12, region: 11.48, kyrka: 0.70 },
    'Malmö': { kommun: 20.64, region: 11.48, kyrka: 0.60 },
    'Uppsala': { kommun: 21.14, region: 11.71, kyrka: 1.35 },
    'Linköping': { kommun: 20.20, region: 11.60, kyrka: 1.20 },
    'Örebro': { kommun: 21.35, region: 11.76, kyrka: 1.45 },
    'Västerås': { kommun: 20.19, region: 12.05, kyrka: 1.25 },
    'Helsingborg': { kommun: 19.90, region: 11.48, kyrka: 0.80 },
    'Jönköping': { kommun: 20.89, region: 11.07, kyrka: 1.15 },
    'Norrköping': { kommun: 21.75, region: 11.60, kyrka: 1.30 },
  },

  // Employer fee rates by age (simplified)
  AGProcByAge: [
    { minAge: 0, maxAge: 17, proc: 7.65 },    // Very young
    { minAge: 18, maxAge: 19, proc: 15.49 },  // Reduced rate for young
    { minAge: 20, maxAge: 64, proc: 31.42 },  // Standard rate
    { minAge: 65, maxAge: 150, proc: 10.21 }, // Reduced rate for seniors
  ],
};