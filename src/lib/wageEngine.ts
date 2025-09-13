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

export interface AdditionalRow {
  type: 'ob-percent' | 'ob-fixed' | 'overtime' | 'fixed-addition' | 'deduction';
  label: string;
  hours?: number;
  percent?: number;
  amountPerHour?: number;
  factor?: number;
  amount?: number;
  includeInVacationBase: boolean;
}

export interface WageInput {
  period: {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
  };
  employer?: {
    name: string;
  };
  employee?: {
    name: string;
    id: string;
  };
  hourlyRate: number;
  roundingStep: 'none' | '0.25' | '0.5';
  regularHours: number;
  additionalRows: AdditionalRow[];
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
  type: 'Ordinarie' | 'OB' | 'Övertid' | 'Tillägg' | 'Frånvaro' | 'Addon' | 'Semesterersättning';
  label: string;
  hours?: number;
  rate?: number;
  factorOrUplift?: number;
  includeInVacationBase: boolean;
  amount: number;
  formula: string;
}

// Default OB rates configuration
export const defaultOBRates = {
  percent: 20, // 20% OB-tillägg
  fixedRate: 50, // 50 kr/h OB-tillägg
  lastUpdated: "2024-12-15"
};

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
        type: 'Ordinarie',
        label: 'Ordinarie tid',
        hours,
        rate: input.hourlyRate,
        includeInVacationBase: input.vacationBase.regular,
        amount,
        formula: `${hours.toFixed(2)} h × ${input.hourlyRate} kr`
      });
    }

    // Process additional rows
    input.additionalRows.forEach((row, index) => {
      let amount = 0;
      let hours = 0;
      let rate = 0;
      let factorOrUplift: number | undefined;
      let formula = '';
      let type: WageLineItem['type'] = 'Addon';

      switch (row.type) {
        case 'ob-percent':
          if (row.hours && row.percent) {
            hours = roundHours(row.hours, input.roundingStep);
            rate = input.hourlyRate;
            factorOrUplift = row.percent / 100;
            amount = hours * input.hourlyRate * (row.percent / 100);
            formula = `${hours.toFixed(2)} h × ${input.hourlyRate} kr × ${row.percent}%`;
            type = 'OB';
            summary.obAmount += amount;
          }
          break;

        case 'ob-fixed':
          if (row.hours && row.amountPerHour) {
            hours = roundHours(row.hours, input.roundingStep);
            rate = row.amountPerHour;
            amount = hours * row.amountPerHour;
            formula = `${hours.toFixed(2)} h × ${row.amountPerHour} kr`;
            type = 'OB';
            summary.obAmount += amount;
          }
          break;

        case 'overtime':
          if (row.hours && row.factor) {
            hours = roundHours(row.hours, input.roundingStep);
            rate = input.hourlyRate;
            factorOrUplift = row.factor;
            amount = hours * input.hourlyRate * row.factor;
            formula = `${hours.toFixed(2)} h × ${input.hourlyRate} kr × ${row.factor}`;
            type = 'Övertid';
            summary.overtimeAmount += amount;
          }
          break;

        case 'fixed-addition':
          if (row.amount) {
            amount = row.amount;
            formula = `${row.amount} kr`;
            type = 'Tillägg';
            summary.addonsAmount += amount;
          }
          break;

        case 'deduction':
          if (row.amount) {
            amount = -Math.abs(row.amount);
            formula = `${Math.abs(row.amount)} kr (avdrag)`;
            type = 'Frånvaro';
            summary.absenceAmount += amount;
          }
          break;
      }

      if (amount !== 0 || hours !== 0) {
        lineItems.push({
          type,
          label: row.label || `${row.type}${index + 1}`,
          hours: hours > 0 ? hours : undefined,
          rate: rate > 0 ? rate : undefined,
          factorOrUplift,
          includeInVacationBase: row.includeInVacationBase,
          amount,
          formula
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
        type: 'Semesterersättning',
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