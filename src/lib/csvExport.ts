import { WageInput, WageResult } from './wageEngine';

export interface LineItemCSV {
  pay_month: string;
  period_start: string;
  period_end: string;
  employee_id: string;
  employee_name: string;
  row_type: string;
  row_label: string;
  hours: string;
  rate: string;
  factor_or_uplift: string;
  include_in_vacation_base: string;
  amount: string;
  formula_text: string;
}

export interface SummaryCSV {
  pay_month: string;
  employee_id: string;
  employee_name: string;
  regular_amount: string;
  ob_amount: string;
  overtime_amount: string;
  merit_amount: string;
  absence_amount: string;
  addons_amount: string;
  vacation_base_amount: string;
  vacation_percent: string;
  vacation_amount: string;
  gross_pay_amount: string;
}

function formatNumber(num: number): string {
  return num.toFixed(2);
}

function formatBoolean(bool: boolean): string {
  return bool ? 'TRUE' : 'FALSE';
}

function getPayMonth(periodStart: string): string {
  const date = new Date(periodStart);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function generateLineItemsCSV(input: WageInput, result: WageResult): string {
  const payMonth = getPayMonth(input.period.start);
  const employeeId = input.employee?.id || '';
  const employeeName = input.employee?.name || '';

  const headers: (keyof LineItemCSV)[] = [
    'pay_month',
    'period_start', 
    'period_end',
    'employee_id',
    'employee_name',
    'row_type',
    'row_label',
    'hours',
    'rate',
    'factor_or_uplift',
    'include_in_vacation_base',
    'amount',
    'formula_text'
  ];

  const rows: LineItemCSV[] = result.lineItems.map(item => ({
    pay_month: payMonth,
    period_start: input.period.start,
    period_end: input.period.end,
    employee_id: employeeId,
    employee_name: employeeName,
    row_type: item.type,
    row_label: item.label,
    hours: item.hours !== undefined ? formatNumber(item.hours) : '',
    rate: item.rate !== undefined ? formatNumber(item.rate) : '',
    factor_or_uplift: item.factorOrUplift !== undefined ? formatNumber(item.factorOrUplift) : '',
    include_in_vacation_base: formatBoolean(item.includeInVacationBase),
    amount: formatNumber(item.amount),
    formula_text: item.formula
  }));

  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  return csvContent;
}

export function generateSummaryCSV(input: WageInput, result: WageResult): string {
  const payMonth = getPayMonth(input.period.start);
  const employeeId = input.employee?.id || '';
  const employeeName = input.employee?.name || '';

  const headers: (keyof SummaryCSV)[] = [
    'pay_month',
    'employee_id',
    'employee_name',
    'regular_amount',
    'ob_amount',
    'overtime_amount',
    'merit_amount',
    'absence_amount',
    'addons_amount',
    'vacation_base_amount',
    'vacation_percent',
    'vacation_amount',
    'gross_pay_amount'
  ];

  const row: SummaryCSV = {
    pay_month: payMonth,
    employee_id: employeeId,
    employee_name: employeeName,
    regular_amount: formatNumber(result.summary.regularAmount),
    ob_amount: formatNumber(result.summary.obAmount),
    overtime_amount: formatNumber(result.summary.overtimeAmount),
    merit_amount: formatNumber(result.summary.meritAmount),
    absence_amount: formatNumber(result.summary.absenceAmount),
    addons_amount: formatNumber(result.summary.addonsAmount),
    vacation_base_amount: formatNumber(result.summary.vacationBaseAmount),
    vacation_percent: formatNumber(input.vacationPercent),
    vacation_amount: formatNumber(result.summary.vacationAmount),
    gross_pay_amount: formatNumber(result.summary.grossPayAmount)
  };

  const csvContent = [
    headers.join(','),
    headers.map(header => {
      const value = row[header];
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  ].join('\n');

  return csvContent;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function exportLineItemsCSV(input: WageInput, result: WageResult): void {
  const content = generateLineItemsCSV(input, result);
  const payMonth = getPayMonth(input.period.start);
  const filename = `timlon_line_items_${payMonth}.csv`;
  downloadCSV(content, filename);
}

export function exportSummaryCSV(input: WageInput, result: WageResult): void {
  const content = generateSummaryCSV(input, result);
  const payMonth = getPayMonth(input.period.start);
  const filename = `timlon_summary_${payMonth}.csv`;
  downloadCSV(content, filename);
}