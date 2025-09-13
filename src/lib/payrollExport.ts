import jsPDF from 'jspdf';
import { WageInput, WageResult } from './wageEngine';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 2
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE');
}

export function generatePayrollPDF(input: WageInput, result: WageResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Title
  const employeeName = input.employee?.name || '—';
  const title = `Lönespecifikation – ${employeeName}`;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPos);
  yPos += 15;

  // Main block (left-aligned)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Employer
  const employerName = input.employer?.name || '—';
  doc.text(`Företag: ${employerName}`, margin, yPos);
  yPos += 8;
  
  // Employee
  const employeeText = input.employee?.name || '—';
  const employeeId = input.employee?.id ? ` (ID: ${input.employee.id})` : '';
  doc.text(`Anställd: ${employeeText}${employeeId}`, margin, yPos);
  yPos += 8;
  
  // Period and payment date
  const periodText = `Period: ${formatDate(input.period.start)}–${formatDate(input.period.end)}`;
  const paymentDate = ` · Utbetalningsdatum: ${new Date().toISOString().split('T')[0]}`;
  doc.text(periodText + paymentDate, margin, yPos);
  yPos += 15;

  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const cols = [
    { title: 'Typ', width: 30 },
    { title: 'Timmar', width: 20 },
    { title: 'Timpeng', width: 25 },
    { title: 'Formel', width: 50 },
    { title: 'Belopp', width: 25 }
  ];

  let xPos = margin;
  cols.forEach(col => {
    doc.text(col.title, xPos, yPos);
    xPos += col.width;
  });
  yPos += 8;

  // Table separator line
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Table rows - Regular first, then additional rows, then vacation
  doc.setFont('helvetica', 'normal');
  
  const filteredItems = result.lineItems.filter(item => 
    item.amount !== 0 && (item.hours === undefined || item.hours !== 0)
  );

  // Regular row first
  const regularRow = filteredItems.find(item => item.type === 'Ordinarie');
  if (regularRow) {
    xPos = margin;
    
    doc.text('Ordinarie', xPos, yPos);
    xPos += cols[0].width;
    
    doc.text(regularRow.hours?.toFixed(2) || '—', xPos, yPos);
    xPos += cols[1].width;
    
    doc.text(`${regularRow.rate} kr`, xPos, yPos);
    xPos += cols[2].width;
    
    const formulaText = `${regularRow.hours?.toFixed(2)} × ${regularRow.rate}`;
    doc.text(formulaText, xPos, yPos);
    xPos += cols[3].width;
    
    doc.text(formatCurrency(regularRow.amount), xPos, yPos);
    yPos += 7;
  }

  // Additional rows (OB/OT/additions/deductions)
  const additionalRows = filteredItems.filter(item => 
    item.type !== 'Ordinarie' && item.type !== 'Semesterersättning'
  );
  
  additionalRows.forEach(item => {
    if (yPos > 250) { // New page if needed
      doc.addPage();
      yPos = margin;
    }

    xPos = margin;
    
    // Type
    doc.text(item.label, xPos, yPos);
    xPos += cols[0].width;
    
    // Hours
    const hoursText = item.hours !== undefined ? item.hours.toFixed(2) : '—';
    doc.text(hoursText, xPos, yPos);
    xPos += cols[1].width;
    
    // Rate
    let rateText = '—';
    if (item.rate !== undefined) {
      rateText = `${item.rate} kr`;
      if (item.factorOrUplift !== undefined) {
        rateText += ` × ${item.factorOrUplift}`;
      }
    }
    doc.text(rateText, xPos, yPos);
    xPos += cols[2].width;
    
    // Formula
    const formulaText = item.formula.length > 30 ? item.formula.substring(0, 27) + '...' : item.formula;
    doc.text(formulaText, xPos, yPos);
    xPos += cols[3].width;
    
    // Amount
    doc.text(formatCurrency(item.amount), xPos, yPos);
    
    yPos += 7;
  });

  // Vacation pay row
  const vacationRow = filteredItems.find(item => item.type === 'Semesterersättning');
  if (vacationRow) {
    xPos = margin;
    
    doc.text('Semesterersättning', xPos, yPos);
    xPos += cols[0].width;
    
    doc.text('—', xPos, yPos);
    xPos += cols[1].width;
    
    doc.text(`${input.vacationPercent}%`, xPos, yPos);
    xPos += cols[2].width;
    
    const formulaText = `${result.summary.vacationBaseAmount.toFixed(2)} × ${input.vacationPercent}%`;
    doc.text(formulaText, xPos, yPos);
    xPos += cols[3].width;
    
    doc.text(formatCurrency(vacationRow.amount), xPos, yPos);
    yPos += 10;
  }

  // Final sum (Bruttolön)
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  xPos = margin;
  doc.text('Summa:', xPos, yPos);
  doc.text(formatCurrency(result.summary.grossPayAmount), pageWidth - margin - 40, yPos);

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Skapad av ${window.location.hostname}. Export sker lokalt i din webbläsare.`, margin, yPos);

  // Generate filename
  const payMonth = input.period.start.substring(0, 7); // YYYY-MM
  const employer = input.employer?.name || 'Foretag';
  const employeeIdForFile = input.employee?.id || 'Anonym';
  const filename = `Lonespec_${employer.replace(/[^a-zA-Z0-9]/g, '_')}_${employeeIdForFile}_${payMonth}.pdf`;

  // Download
  doc.save(filename);
}