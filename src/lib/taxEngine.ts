export interface TaxConfig {
  taxYear: number;
  lastUpdatedISO: string;
  statligSkattProc: number;
  brytpunktAr: number;
  begravningProc: number;
  kyrkoProc: number;
  kommunSkattMap: Record<string, { kommun: number; region: number; kyrka: number }>;
  AGProcByAge: { minAge: number; maxAge: number; proc: number }[];
}

export interface PrivatpersonInput {
  kommun: string;
  age: number;
  bruttolonManad: number;
  kyrkomedlem: boolean;
  extraAvdragManad: number;
}

export interface ArbetsgivareInput {
  bruttolonManad: number;
  age: number;
  semesterProc: number;
  pensionProc: number;
}

export interface PrivatpersonResult {
  arslon: number;
  kommunalSkatt: number;
  regionalSkatt: number;
  statligSkatt: number;
  begravningsavgift: number;
  kyrkoavgift: number;
  totalSkatt: number;
  nettolonManad: number;
  breakdown: {
    kommunal: number;
    regional: number;
    statlig: number;
    begravning: number;
    kyrka: number;
  };
}

export interface ArbetsgivareResult {
  bruttolonManad: number;
  arbetsgivaravgift: number;
  semesterpaslag: number;
  pension: number;
  totalkostnadManad: number;
  kostnadPerTimme: number;
  breakdown: {
    bruttolon: number;
    avgifter: number;
    semester: number;
    pension: number;
  };
}

export class TaxEngine {
  constructor(private config: TaxConfig) {}

  calculatePrivatperson(input: PrivatpersonInput): PrivatpersonResult {
    const arslon = input.bruttolonManad * 12;
    
    // Get kommun tax rates or use fallback
    const kommunData = this.config.kommunSkattMap[input.kommun] || 
      this.config.kommunSkattMap['FALLBACK'];
    
    const kommunalSkatt = arslon * (kommunData.kommun / 100);
    const regionalSkatt = arslon * (kommunData.region / 100);
    
    // State tax (only above threshold)
    const statligSkatt = arslon > this.config.brytpunktAr 
      ? (arslon - this.config.brytpunktAr) * (this.config.statligSkattProc / 100)
      : 0;
    
    const begravningsavgift = arslon * (this.config.begravningProc / 100);
    const kyrkoavgift = input.kyrkomedlem 
      ? arslon * (kommunData.kyrka / 100)
      : 0;
    
    const totalSkatt = kommunalSkatt + regionalSkatt + statligSkatt + 
      begravningsavgift + kyrkoavgift - (input.extraAvdragManad * 12);
    
    const nettolonManad = (arslon - totalSkatt) / 12;

    return {
      arslon,
      kommunalSkatt,
      regionalSkatt,
      statligSkatt,
      begravningsavgift,
      kyrkoavgift,
      totalSkatt,
      nettolonManad,
      breakdown: {
        kommunal: kommunalSkatt,
        regional: regionalSkatt,
        statlig: statligSkatt,
        begravning: begravningsavgift,
        kyrka: kyrkoavgift,
      }
    };
  }

  calculateArbetsgivare(input: ArbetsgivareInput): ArbetsgivareResult {
    // Find AG rate based on age
    const agRate = this.config.AGProcByAge.find(
      range => input.age >= range.minAge && input.age <= range.maxAge
    )?.proc || 31.42; // fallback to standard rate
    
    const arbetsgivaravgift = input.bruttolonManad * (agRate / 100);
    const semesterpaslag = input.bruttolonManad * (input.semesterProc / 100);
    const pension = input.bruttolonManad * (input.pensionProc / 100);
    
    const totalkostnadManad = input.bruttolonManad + arbetsgivaravgift + 
      semesterpaslag + pension;
    
    const kostnadPerTimme = totalkostnadManad / 165; // 165 hours/month average

    return {
      bruttolonManad: input.bruttolonManad,
      arbetsgivaravgift,
      semesterpaslag,
      pension,
      totalkostnadManad,
      kostnadPerTimme,
      breakdown: {
        bruttolon: input.bruttolonManad,
        avgifter: arbetsgivaravgift,
        semester: semesterpaslag,
        pension
      }
    };
  }

  getDataSources(): string {
    return "Datakällor: SCB (kommun/region), Skatteverket (statlig skatt), Kammarkollegiet (begravningsavgift), Svenska kyrkan (kyrkoavgift)";
  }
}