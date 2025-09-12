import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, FileDown, Table, TrendingUp, Calculator, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { WageEngine, WageInput, WageResult, AdditionalRow, roundHours } from '@/lib/wageEngine';
import { generatePayrollPDF } from '@/lib/payrollExport';
import { exportPayrollLineItemsCSV, exportPayrollSummaryCSV } from '@/lib/payrollCsvExport';

const wageEngine = new WageEngine({ hoursPerMonth: 165, currency: 'SEK' });

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function PayrollSpecification() {
  // Required fields
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [regularHours, setRegularHours] = useState('');
  const [vacationPercent, setVacationPercent] = useState('12.0');

  // Optional fields
  const [employerName, setEmployerName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [roundingStep, setRoundingStep] = useState<'none' | '0.25' | '0.5'>('none');

  // Additional rows
  const [additionalRows, setAdditionalRows] = useState<AdditionalRow[]>([]);

  // UI state
  const [showZeroRows, setShowZeroRows] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [wageResult, setWageResult] = useState<WageResult | null>(null);

  // Calculate result when inputs change
  useEffect(() => {
    const rate = parseFloat(hourlyRate);
    const regHours = parseFloat(regularHours);
    const vacPercent = parseFloat(vacationPercent);

    if (rate > 0 && regHours > 0 && vacPercent >= 0) {
      const input: WageInput = {
        period: { start: periodStart, end: periodEnd },
        employer: employerName ? { name: employerName } : undefined,
        employee: employeeName || employeeId ? { name: employeeName, id: employeeId } : undefined,
        hourlyRate: rate,
        roundingStep: roundingStep,
        regularHours: regHours,
        additionalRows: additionalRows,
        vacationPercent: vacPercent,
        vacationBase: {
          regular: true,
          ob: true,
          overtime: false,
          merit: false,
          addons: false
        }
      };
      
      setWageResult(wageEngine.calculate(input));
    } else {
      setWageResult(null);
    }
  }, [periodStart, periodEnd, employerName, employeeName, employeeId, hourlyRate, roundingStep, regularHours, additionalRows, vacationPercent]);

  const addAdditionalRow = () => {
    setAdditionalRows([...additionalRows, {
      type: 'ob-percent',
      label: '',
      includeInVacationBase: true
    }]);
  };

  const updateAdditionalRow = (index: number, updates: Partial<AdditionalRow>) => {
    const updated = [...additionalRows];
    updated[index] = { ...updated[index], ...updates };
    setAdditionalRows(updated);
  };

  const removeAdditionalRow = (index: number) => {
    setAdditionalRows(additionalRows.filter((_, i) => i !== index));
  };

  const getRowTypeLabel = (type: string) => {
    switch (type) {
      case 'ob-percent': return 'OB - procent';
      case 'ob-fixed': return 'OB - kr/h';
      case 'overtime': return 'Övertid - faktor';
      case 'fixed-addition': return 'Fast tillägg - kr';
      case 'deduction': return 'Avdrag - kr';
      default: return type;
    }
  };

  const filteredLineItems = wageResult?.lineItems.filter(item => 
    showZeroRows || (item.amount !== 0 && (item.hours === undefined || item.hours !== 0))
  ) || [];

  const buildWageInput = (): WageInput => ({
    period: { start: periodStart, end: periodEnd },
    employer: employerName ? { name: employerName } : undefined,
    employee: employeeName || employeeId ? { name: employeeName, id: employeeId } : undefined,
    hourlyRate: parseFloat(hourlyRate) || 0,
    roundingStep: roundingStep,
    regularHours: parseFloat(regularHours) || 0,
    additionalRows: additionalRows,
    vacationPercent: parseFloat(vacationPercent) || 12.0,
    vacationBase: {
      regular: true,
      ob: true,
      overtime: false,
      merit: false,
      addons: false
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Column */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Inmatning
          </CardTitle>
          <CardDescription>Kompakt lönespecifikation för timanställda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period - Required */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Period (obligatoriskt)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  placeholder="Från"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  placeholder="Till"
                />
              </div>
            </div>
          </div>

          {/* Basic wage settings - Required */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourly-rate">Timlön (SEK) *</Label>
              <Input
                id="hourly-rate"
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="150"
              />
            </div>
            <div>
              <Label htmlFor="regular-hours">Ordinarie timmar *</Label>
              <Input
                id="regular-hours"
                type="number"
                step="0.01"
                value={regularHours}
                onChange={(e) => setRegularHours(e.target.value)}
                placeholder="165"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vacation-percent">Semesterersättning (%) *</Label>
            <Input
              id="vacation-percent"
              type="number"
              step="0.1"
              value={vacationPercent}
              onChange={(e) => setVacationPercent(e.target.value)}
              placeholder="12.0"
            />
          </div>

          {/* Optional fields */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Valfria fält</Label>
            <div>
              <Label htmlFor="employer-name">Företagsnamn</Label>
              <Input
                id="employer-name"
                type="text"
                maxLength={80}
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                placeholder="AB Exempel"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="employee-name">Anställds namn</Label>
                <Input
                  id="employee-name"
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Anna Andersson"
                />
              </div>
              <div>
                <Label htmlFor="employee-id">ID</Label>
                <Input
                  id="employee-id"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="rounding-step">Avrundning timmar</Label>
              <Select value={roundingStep} onValueChange={(value: 'none' | '0.25' | '0.5') => setRoundingStep(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen</SelectItem>
                  <SelectItem value="0.25">0,25h</SelectItem>
                  <SelectItem value="0.5">0,5h</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional rows */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Tilläggsrader</Label>
              <Button variant="outline" size="sm" onClick={addAdditionalRow}>
                <Plus className="h-4 w-4 mr-1" />
                Lägg till rad
              </Button>
            </div>
            
            {additionalRows.map((row, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <Select
                    value={row.type}
                    onValueChange={(value) => updateAdditionalRow(index, { type: value as AdditionalRow['type'] })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ob-percent">OB - procent</SelectItem>
                      <SelectItem value="ob-fixed">OB - kr/h</SelectItem>
                      <SelectItem value="overtime">Övertid - faktor</SelectItem>
                      <SelectItem value="fixed-addition">Fast tillägg - kr</SelectItem>
                      <SelectItem value="deduction">Avdrag - kr</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" onClick={() => removeAdditionalRow(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input
                  placeholder="Etikett"
                  value={row.label}
                  onChange={(e) => updateAdditionalRow(index, { label: e.target.value })}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  {row.type === 'ob-percent' && (
                    <>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Timmar"
                        value={row.hours || ''}
                        onChange={(e) => updateAdditionalRow(index, { hours: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Procent (%)"
                        value={row.percent || ''}
                        onChange={(e) => updateAdditionalRow(index, { percent: parseFloat(e.target.value) || 0 })}
                      />
                    </>
                  )}
                  {row.type === 'ob-fixed' && (
                    <>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Timmar"
                        value={row.hours || ''}
                        onChange={(e) => updateAdditionalRow(index, { hours: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="kr/h"
                        value={row.amountPerHour || ''}
                        onChange={(e) => updateAdditionalRow(index, { amountPerHour: parseFloat(e.target.value) || 0 })}
                      />
                    </>
                  )}
                  {row.type === 'overtime' && (
                    <>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Timmar"
                        value={row.hours || ''}
                        onChange={(e) => updateAdditionalRow(index, { hours: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Faktor"
                        value={row.factor || ''}
                        onChange={(e) => updateAdditionalRow(index, { factor: parseFloat(e.target.value) || 1.5 })}
                      />
                    </>
                  )}
                  {(row.type === 'fixed-addition' || row.type === 'deduction') && (
                    <div className="col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Belopp (kr)"
                        value={row.amount || ''}
                        onChange={(e) => updateAdditionalRow(index, { amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`vacation-${index}`}
                    checked={row.includeInVacationBase}
                    onCheckedChange={(checked) => updateAdditionalRow(index, { includeInVacationBase: checked === true })}
                  />
                  <Label htmlFor={`vacation-${index}`} className="text-sm">Ingår i semesterunderlaget</Label>
                </div>
              </div>
            ))}
          </div>

          {/* Zero rows toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-zero-rows"
              checked={showZeroRows}
              onCheckedChange={(checked) => setShowZeroRows(checked === true)}
            />
            <Label htmlFor="show-zero-rows" className="text-sm">Visa rader med 0</Label>
          </div>
        </CardContent>
      </Card>

      {/* Results Column */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Lönespecifikation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wageResult ? (
            <div className="space-y-6">
              {/* Main result */}
              <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-3xl font-bold text-emerald-900 mb-2">
                  {formatCurrency(wageResult.summary.grossPayAmount)}
                </div>
                <div className="text-sm text-emerald-700">bruttolön att utbetala</div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xl font-bold text-blue-900">
                    {formatCurrency(wageResult.summary.vacationAmount)}
                  </div>
                  <div className="text-xs text-blue-700">Semesterersättning</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xl font-bold text-purple-900">
                    {formatCurrency(wageResult.summary.vacationBaseAmount)}
                  </div>
                  <div className="text-xs text-purple-700">Underlag för semester</div>
                </div>
              </div>

              {/* Collapsible details */}
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    Visa detaljer
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Typ</th>
                          <th className="text-left py-2">Etikett</th>
                          <th className="text-right py-2">Timmar</th>
                          <th className="text-right py-2">Sats/Faktor</th>
                          <th className="text-right py-2">Belopp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLineItems.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-1">{item.type}</td>
                            <td className="py-1">{item.label}</td>
                            <td className="text-right py-1">
                              {item.hours !== undefined ? item.hours.toFixed(2) : '—'}
                            </td>
                            <td className="text-right py-1">
                              {item.rate !== undefined ? `${item.rate} kr` : '—'}
                              {item.factorOrUplift !== undefined && ` × ${item.factorOrUplift}`}
                            </td>
                            <td className="text-right py-1">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Export buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generatePayrollPDF(buildWageInput(), wageResult)}
                    className="w-full"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Exportera Lönespecifikation (PDF)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPayrollLineItemsCSV(buildWageInput(), wageResult, showZeroRows)}
                    className="w-full"
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Exportera detaljerad CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPayrollSummaryCSV(buildWageInput(), wageResult)}
                    className="w-full"
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Exportera sammanfattning CSV
                  </Button>
                </div>

                {/* Privacy notice */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-emerald-800 text-sm">
                    <Lock className="h-4 w-4" />
                    <span>Export sker lokalt i din webbläsare. Ingen information sparas eller skickas till vår server.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ange timlön och ordinarie timmar för att se beräkningen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}