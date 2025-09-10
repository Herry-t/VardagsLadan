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

export function generateWagePDF(input: WageInput, result: WageResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Title
  const employeeName = input.employee?.name || '—';
  const title = `Timlöneunderlag – ${employeeName} – ${formatDate(input.period.start)}–${formatDate(input.period.end)}`;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPos);
  yPos += 15;

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (input.employee?.id) {
    doc.text(`Anställnings-ID: ${input.employee.id}`, margin, yPos);
    yPos += 8;
  }
  
  const now = new Date();
  doc.text(`Skapad: ${now.toLocaleDateString('sv-SE')} ${now.toLocaleTimeString('sv-SE')}`, margin, yPos);
  yPos += 15;

  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const cols = [
    { title: 'Typ', width: 25 },
    { title: 'Timmar', width: 20 },
    { title: 'Sats/Faktor', width: 25 },
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

  // Table rows
  doc.setFont('helvetica', 'normal');
  
  result.lineItems.forEach(item => {
    if (yPos > 250) { // New page if needed
      doc.addPage();
      yPos = margin;
    }

    xPos = margin;
    
    // Type
    doc.text(item.type, xPos, yPos);
    xPos += cols[0].width;
    
    // Hours
    const hoursText = item.hours !== undefined ? item.hours.toFixed(2) : '—';
    doc.text(hoursText, xPos, yPos);
    xPos += cols[1].width;
    
    // Rate/Factor
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

  yPos += 10;

  // Summary section
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('Sammanfattning:', margin, yPos);
  yPos += 10;

  doc.setFont('helvetica', 'normal');
  
  const summaryItems = [
    { label: 'Ersättningar totalt:', amount: result.summary.regularAmount + result.summary.obAmount + result.summary.overtimeAmount + result.summary.meritAmount + result.summary.addonsAmount },
    { label: 'Frånvaro:', amount: result.summary.absenceAmount },
    { label: 'Semesterersättning:', amount: result.summary.vacationAmount },
    { label: 'Bruttolön:', amount: result.summary.grossPayAmount, bold: true }
  ];

  summaryItems.forEach(item => {
    if (item.bold) {
      doc.setFont('helvetica', 'bold');
    }
    doc.text(item.label, margin, yPos);
    doc.text(formatCurrency(item.amount), pageWidth - margin - 40, yPos);
    if (item.bold) {
      doc.setFont('helvetica', 'normal');
    }
    yPos += 8;
  });

  yPos += 10;

  // Cost per hour info
  doc.setFont('helvetica', 'italic');
  doc.text(`Kostnad per timme: ${formatCurrency(result.costPerHour)} (baserat på 165 timmar/månad)`, margin, yPos);

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Skapad av ${window.location.hostname}`, margin, yPos);

  // Generate filename
  const payMonth = input.period.start.substring(0, 7); // YYYY-MM
  const employeeId = input.employee?.id || 'Anonym';
  const filename = `Timloneunderlag_${employeeId}_${payMonth}.pdf`;

  // Download
  doc.save(filename);
}