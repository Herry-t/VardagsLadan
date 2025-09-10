export interface WageConfig {
  hoursPerMonth: number;
  currency: string;
}

export interface OBEntry {
  label: string;
  hours: number;
  upliftType: 'percent' | 'fixed';
  value: number;
}

export interface AddonEntry {
  label: string;
  amount: number;
  count: number;
}

export interface WageInput {
  period: {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
  };
  employee?: {
    name: string;
    id: string;
  };
  hourlyRate: number;
  roundingStep: 'none' | '0.25' | '0.5';
  regularHours: number;
  obEntries: OBEntry[];
  overtime: {
    ot1: { hours: number; factor: number };
    ot2: { hours: number; factor: number };
  };
  meritTime: {
    hours: number;
    factor: number;
  };
  absenceHours: number;
  addons: AddonEntry[];
  vacationPercent: number;
  vacationBase: {
    regular: boolean;
    ob: boolean;
    overtime: boolean;
    merit: boolean;
    addons: boolean;
  };
}

export interface WageLineItem {
  type: 'Regular' | 'OB' | 'Overtime' | 'Merit' | 'Absence' | 'Addon' | 'VacationPay';
  label: string;
  hours?: number;
  rate?: number;
  factorOrUplift?: number;
  includeInVacationBase: boolean;
  amount: number;
  formula: string;
}

export interface WageResult {
  lineItems: WageLineItem[];
  summary: {
    regularAmount: number;
    obAmount: number;
    overtimeAmount: number;
    meritAmount: number;
    absenceAmount: number;
    addonsAmount: number;
    vacationBaseAmount: number;
    vacationAmount: number;
    grossPayAmount: number;
  };
  costPerHour: number;
}

export const wageConfig: WageConfig = {
  hoursPerMonth: 165,
  currency: 'SEK'
};

export function roundHours(value: number, step: 'none' | '0.25' | '0.5'): number {
  if (step === 'none') return value;
  const stepValue = parseFloat(step);
  return Math.round(value / stepValue) * stepValue;
}

export class WageEngine {
  constructor(private config: WageConfig) {}

  calculate(input: WageInput): WageResult {
    const lineItems: WageLineItem[] = [];
    let summary = {
      regularAmount: 0,
      obAmount: 0,
      overtimeAmount: 0,
      meritAmount: 0,
      absenceAmount: 0,
      addonsAmount: 0,
      vacationBaseAmount: 0,
      vacationAmount: 0,
      grossPayAmount: 0
    };

    // Regular hours
    if (input.regularHours > 0) {
      const hours = roundHours(input.regularHours, input.roundingStep);
      const amount = hours * input.hourlyRate;
      summary.regularAmount = amount;
      
      lineItems.push({
        type: 'Regular',
        label: 'Ordinarie tid',
        hours,
        rate: input.hourlyRate,
        includeInVacationBase: input.vacationBase.regular,
        amount,
        formula: `${hours.toFixed(2)} h × ${input.hourlyRate} kr`
      });
    }

    // OB entries
    input.obEntries.forEach((ob, index) => {
      if (ob.hours > 0) {
        const hours = roundHours(ob.hours, input.roundingStep);
        let amount: number;
        let formula: string;
        
        if (ob.upliftType === 'percent') {
          amount = hours * input.hourlyRate * (ob.value / 100);
          formula = `${hours.toFixed(2)} h × ${input.hourlyRate} kr × ${ob.value}%`;
        } else {
          amount = hours * ob.value;
          formula = `${hours.toFixed(2)} h × ${ob.value} kr`;
        }
        
        summary.obAmount += amount;
        
        lineItems.push({
          type: 'OB',
          label: ob.label || `OB${index + 1}`,
          hours,
          rate: ob.upliftType === 'percent' ? input.hourlyRate : ob.value,
          factorOrUplift: ob.upliftType === 'percent' ? ob.value / 100 : undefined,
          includeInVacationBase: input.vacationBase.ob,
          amount,
          formula
        });
      }
    });

    // Overtime
    if (input.overtime.ot1.hours > 0) {
      const hours = roundHours(input.overtime.ot1.hours, input.roundingStep);
      const amount = hours * input.hourlyRate * input.overtime.ot1.factor;
      summary.overtimeAmount += amount;
      
      lineItems.push({
        type: 'Overtime',
        label: `ÖT1 ${input.overtime.ot1.factor}x`,
        hours,
        rate: input.hourlyRate,
        factorOrUplift: input.overtime.ot1.factor,
        includeInVacationBase: input.vacationBase.overtime,
        amount,
        formula: `${hours.toFixed(2)} h × ${input.hourlyRate} kr × ${input.overtime.ot1.factor}`
      });
    }

    if (input.overtime.ot2.hours > 0) {
      const hours = roundHours(input.overtime.ot2.hours, input.roundingStep);
      const amount = hours * input.hourlyRate * input.overtime.ot2.factor;
      summary.overtimeAmount += amount;
      
      lineItems.push({
        type: 'Overtime',
        label: `ÖT2 ${input.overtime.ot2.factor}x`,
        hours,
        rate: input.hourlyRate,
        factorOrUplift: input.overtime.ot2.factor,
        includeInVacationBase: input.vacationBase.overtime,
        amount,
        formula: `${hours.toFixed(2)} h × ${input.hourlyRate} kr × ${input.overtime.ot2.factor}`
      });
    }

    // Merit time
    if (input.meritTime.hours > 0) {
      const hours = roundHours(input.meritTime.hours, input.roundingStep);
      const amount = hours * input.hourlyRate * input.meritTime.factor;
      summary.meritAmount = amount;
      
      lineItems.push({
        type: 'Merit',
        label: `Mertid ${input.meritTime.factor}x`,
        hours,
        rate: input.hourlyRate,
        factorOrUplift: input.meritTime.factor,
        includeInVacationBase: input.vacationBase.merit,
        amount,
        formula: `${hours.toFixed(2)} h × ${input.hourlyRate} kr × ${input.meritTime.factor}`
      });
    }

    // Absence (negative amount)
    if (input.absenceHours > 0) {
      const hours = roundHours(input.absenceHours, input.roundingStep);
      const amount = -(hours * input.hourlyRate);
      summary.absenceAmount = amount;
      
      lineItems.push({
        type: 'Absence',
        label: 'Frånvaro utan lön',
        hours,
        rate: input.hourlyRate,
        includeInVacationBase: false,
        amount,
        formula: `${hours.toFixed(2)} h × ${input.hourlyRate} kr (avdrag)`
      });
    }

    // Addons
    input.addons.forEach(addon => {
      if (addon.amount > 0 && addon.count > 0) {
        const amount = addon.amount * addon.count;
        summary.addonsAmount += amount;
        
        lineItems.push({
          type: 'Addon',
          label: addon.label,
          includeInVacationBase: input.vacationBase.addons,
          amount,
          formula: addon.count > 1 ? `${addon.amount} kr × ${addon.count}` : `${addon.amount} kr`
        });
      }
    });

    // Calculate vacation base
    summary.vacationBaseAmount = lineItems
      .filter(item => item.includeInVacationBase)
      .reduce((sum, item) => sum + item.amount, 0);

    // Vacation pay
    summary.vacationAmount = summary.vacationBaseAmount * (input.vacationPercent / 100);
    
    if (summary.vacationAmount > 0) {
      lineItems.push({
        type: 'VacationPay',
        label: `Semesterersättning ${input.vacationPercent}%`,
        includeInVacationBase: false,
        amount: summary.vacationAmount,
        formula: `${summary.vacationBaseAmount.toFixed(2)} kr × ${input.vacationPercent}%`
      });
    }

    // Calculate gross pay
    summary.grossPayAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    const costPerHour = summary.grossPayAmount / this.config.hoursPerMonth;

    return {
      lineItems,
      summary,
      costPerHour
    };
  }
}