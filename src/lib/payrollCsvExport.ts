import { WageInput, WageResult } from './wageEngine';

export interface PayrollLineItemCSV {
  pay_month: string;
  employer_name: string;
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

export interface PayrollSummaryCSV {
  pay_month: string;
  employer_name: string;
  employee_id: string;
  employee_name: string;
  regular_hours: string;
  hourly_rate: string;
  regular_amount: string;
  ob_amount: string;
  overtime_amount: string;
  addons_amount: string;
  deductions_amount: string;
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

export function generatePayrollLineItemsCSV(input: WageInput, result: WageResult, showZeroRows: boolean): string {
  const payMonth = getPayMonth(input.period.start);
  const employerName = input.employer?.name || '';
  const employeeId = input.employee?.id || '';
  const employeeName = input.employee?.name || '';

  const headers: (keyof PayrollLineItemCSV)[] = [
    'pay_month',
    'employer_name',
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

  // Filter rows based on showZeroRows
  const filteredItems = result.lineItems.filter(item => 
    showZeroRows || (item.amount !== 0 && (item.hours === undefined || item.hours !== 0))
  );

  const rows: PayrollLineItemCSV[] = filteredItems.map(item => ({
    pay_month: payMonth,
    employer_name: employerName,
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

export function generatePayrollSummaryCSV(input: WageInput, result: WageResult): string {
  const payMonth = getPayMonth(input.period.start);
  const employerName = input.employer?.name || '';
  const employeeId = input.employee?.id || '';
  const employeeName = input.employee?.name || '';

  const headers: (keyof PayrollSummaryCSV)[] = [
    'pay_month',
    'employer_name',
    'employee_id',
    'employee_name',
    'regular_hours',
    'hourly_rate',
    'regular_amount',
    'ob_amount',
    'overtime_amount',
    'addons_amount',
    'deductions_amount',
    'vacation_base_amount',
    'vacation_percent',
    'vacation_amount',
    'gross_pay_amount'
  ];

  // Calculate deductions and addons amounts
  const deductionsAmount = result.lineItems
    .filter(item => item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  
  const addonsAmount = result.lineItems
    .filter(item => item.type === 'Addon' && item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0);

  const row: PayrollSummaryCSV = {
    pay_month: payMonth,
    employer_name: employerName,
    employee_id: employeeId,
    employee_name: employeeName,
    regular_hours: formatNumber(input.regularHours),
    hourly_rate: formatNumber(input.hourlyRate),
    regular_amount: formatNumber(result.summary.regularAmount),
    ob_amount: formatNumber(result.summary.obAmount),
    overtime_amount: formatNumber(result.summary.overtimeAmount),
    addons_amount: formatNumber(addonsAmount),
    deductions_amount: formatNumber(deductionsAmount),
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

export function exportPayrollLineItemsCSV(input: WageInput, result: WageResult, showZeroRows: boolean): void {
  const content = generatePayrollLineItemsCSV(input, result, showZeroRows);
  const payMonth = getPayMonth(input.period.start);
  const filename = `lonespec_line_items_${payMonth}.csv`;
  downloadCSV(content, filename);
}

export function exportPayrollSummaryCSV(input: WageInput, result: WageResult): void {
  const content = generatePayrollSummaryCSV(input, result);
  const payMonth = getPayMonth(input.period.start);
  const filename = `lonespec_summary_${payMonth}.csv`;
  downloadCSV(content, filename);
}