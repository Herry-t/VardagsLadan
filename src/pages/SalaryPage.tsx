import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Lock, FileDown, Table, Info, Plus, Trash2 } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { TaxEngine, PrivatpersonInput, ArbetsgivareInput } from '@/lib/taxEngine';
import { config2025 } from '@/lib/config/2025';
import { TaxTooltip } from '@/components/TaxTooltip';
import { TaxBreakdownChart } from '@/components/TaxBreakdownChart';
import { WageEngine, WageInput, wageConfig, OBEntry, AddonEntry } from '@/lib/wageEngine';
import { exportLineItemsCSV, exportSummaryCSV } from '@/lib/csvExport';
import { generateWagePDF } from '@/lib/pdfExport';

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState('nettlon');
  const taxEngine = useMemo(() => new TaxEngine(config2025), []);
  const wageEngine = useMemo(() => new WageEngine(wageConfig), []);

  // Privatperson states
  const [kommun, setKommun] = useState('Stockholm');
  const [age, setAge] = useState('30');
  const [bruttolonManad, setBruttolonManad] = useState('35000');
  const [kyrkomedlem, setKyrkomedlem] = useState(false);
  const [extraAvdrag, setExtraAvdrag] = useState('0');

  // Arbetsgivare states
  const [arbGrossLon, setArbGrossLon] = useState('35000');
  const [arbAge, setArbAge] = useState('30');
  const [semesterProc, setSemesterProc] = useState('12');
  const [pensionProc, setPensionProc] = useState('4.5');

  // Wage calculator states
  const [hourlyRate, setHourlyRate] = useState('150');
  const [regularHours, setRegularHours] = useState('160');
  const [roundingStep, setRoundingStep] = useState<'none' | '0.25' | '0.5'>('none');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [periodStart, setPeriodStart] = useState('2025-09-01');
  const [periodEnd, setPeriodEnd] = useState('2025-09-30');
  const [obEntries, setObEntries] = useState<Array<{ label: string; hours: string; upliftType: 'percent' | 'fixed'; value: string }>>([
    { label: 'OB Kväll', hours: '0', upliftType: 'percent', value: '20' },
    { label: 'OB Helg', hours: '0', upliftType: 'percent', value: '50' },
    { label: 'OB Natt', hours: '0', upliftType: 'fixed', value: '25' }
  ]);
  const [ot1Hours, setOt1Hours] = useState('0');
  const [ot2Hours, setOt2Hours] = useState('0');
  const [meritHours, setMeritHours] = useState('0');
  const [meritFactor, setMeritFactor] = useState('1.0');
  const [absenceHours, setAbsenceHours] = useState('0');
  const [addons, setAddons] = useState<Array<{ label: string; amount: string; count: string }>>([]);
  const [vacationPercent, setVacationPercent] = useState('12.0');
  const [vacationBase, setVacationBase] = useState({
    regular: true,
    ob: true,
    overtime: false,
    merit: false,
    addons: false
  });

  const wageResult = useMemo(() => {
    const rate = parseFloat(hourlyRate) || 0;
    const regular = parseFloat(regularHours) || 0;
    
    if (rate <= 0) return null;

    const input: WageInput = {
      period: { start: periodStart, end: periodEnd },
      employee: { name: employeeName, id: employeeId },
      hourlyRate: rate,
      roundingStep: roundingStep,
      regularHours: regular,
      obEntries: obEntries.map(ob => ({
        label: ob.label,
        hours: parseFloat(ob.hours) || 0,
        upliftType: ob.upliftType,
        value: parseFloat(ob.value) || 0
      })),
      overtime: { 
        ot1: { hours: parseFloat(ot1Hours) || 0, factor: 1.5 }, 
        ot2: { hours: parseFloat(ot2Hours) || 0, factor: 2.0 } 
      },
      meritTime: { hours: parseFloat(meritHours) || 0, factor: parseFloat(meritFactor) || 1.0 },
      absenceHours: parseFloat(absenceHours) || 0,
      addons: addons.map(addon => ({
        label: addon.label,
        amount: parseFloat(addon.amount) || 0,
        count: parseFloat(addon.count) || 1
      })),
      vacationPercent: parseFloat(vacationPercent) || 12.0,
      vacationBase: vacationBase
    };

    return wageEngine.calculate(input);
  }, [hourlyRate, regularHours, roundingStep, employeeName, employeeId, periodStart, periodEnd, 
      obEntries, ot1Hours, ot2Hours, meritHours, meritFactor, absenceHours, addons, 
      vacationPercent, vacationBase, wageEngine]);

  const privatpersonResult = useMemo(() => {
    const salary = parseFloat(bruttolonManad) || 0;
    const ageNum = parseInt(age) || 25;
    const avdrag = parseFloat(extraAvdrag) || 0;

    if (salary <= 0) return null;

    const input: PrivatpersonInput = {
      kommun,
      age: ageNum,
      bruttolonManad: salary,
      kyrkomedlem,
      extraAvdragManad: avdrag
    };

    return taxEngine.calculatePrivatperson(input);
  }, [kommun, age, bruttolonManad, kyrkomedlem, extraAvdrag, taxEngine]);

  const arbetsgivareResult = useMemo(() => {
    const salary = parseFloat(arbGrossLon) || 0;
    const ageNum = parseInt(arbAge) || 25;
    const semester = parseFloat(semesterProc) || 12;
    const pension = parseFloat(pensionProc) || 0;

    if (salary <= 0) return null;

    const input: ArbetsgivareInput = {
      bruttolonManad: salary,
      age: ageNum,
      semesterProc: semester,
      pensionProc: pension
    };

    return taxEngine.calculateArbetsgivare(input);
  }, [arbGrossLon, arbAge, semesterProc, pensionProc, taxEngine]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const kommunList = Object.keys(config2025.kommunSkattMap).filter(k => k !== 'FALLBACK');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="max-w-2xl mx-auto text-center py-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Lönekalkyl 2025
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Lönekalkylen hjälper både privatpersoner och arbetsgivare att snabbt räkna ut lön, skatt och kostnader. Här kan du se vad du själv får ut efter skatt, vad en anställd kostar i totalkostnad för arbetsgivaren och räkna fram månadslön för timanställda. Fler praktiska verktyg läggs till löpande för att underlätta planering och jämförelser.
        </p>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
          Gäller inkomstår {config2025.taxYear} • Beräkningen sker lokalt i din webbläsare
        </Badge>
      </section>

      {/* Ad Slot - Top */}
      <section className="max-w-2xl mx-auto mb-8">
        <AdSlot 
          slotId="salary-top"
          sizeMapping={{
            mobile: [320, 250],
            tablet: [728, 90],
            desktop: [728, 90],
          }}
          refreshIntervalSec={90}
        />
      </section>

      {/* Main Calculator */}
      <section className="max-w-4xl mx-auto mb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nettlon">Räkna ut nettolön</TabsTrigger>
            <TabsTrigger value="arbetsgivare">Räkna ut arbetsgivarens totalkostnad</TabsTrigger>
            <TabsTrigger value="timlon">Timlöneunderlag</TabsTrigger>
          </TabsList>

          <TabsContent value="nettlon" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    Inmatning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="kommun">Kommun</Label>
                    <Select value={kommun} onValueChange={setKommun}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kommunList.map(k => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="age">Ålder</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bruttolonManad">Bruttolön per månad (SEK)</Label>
                    <Input
                      id="bruttolonManad"
                      type="number"
                      value={bruttolonManad}
                      onChange={(e) => setBruttolonManad(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kyrkomedlem"
                      checked={kyrkomedlem}
                      onCheckedChange={(checked) => setKyrkomedlem(checked === true)}
                    />
                    <Label htmlFor="kyrkomedlem">Medlem i Svenska kyrkan</Label>
                  </div>

                  <div>
                    <Label htmlFor="extraAvdrag">Extra skatteavdrag per månad (SEK)</Label>
                    <Input
                      id="extraAvdrag"
                      type="number"
                      value={extraAvdrag}
                      onChange={(e) => setExtraAvdrag(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Resultat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {privatpersonResult ? (
                    <div className="space-y-6">
                      {/* Main result */}
                      <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-900 mb-2">
                          {formatCurrency(privatpersonResult.nettolonManad)}
                        </div>
                        <div className="text-sm text-emerald-700">nettolön per månad</div>
                      </div>

                      {/* Yearly summary */}
                      <div className="text-center p-4 bg-muted/30 rounded-lg space-y-2">
                        <div>
                          <div className="text-xl font-bold text-foreground">
                            {formatCurrency(privatpersonResult.nettolonManad * 12)}
                          </div>
                          <div className="text-sm text-muted-foreground">nettolön per år</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-muted-foreground">
                            {formatCurrency(privatpersonResult.arslon)}
                          </div>
                          <div className="text-xs text-muted-foreground">bruttolön per år</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ange en bruttolön för att se beräkningen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="arbetsgivare" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    Inmatning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="arbGrossLon">Bruttolön per månad (SEK)</Label>
                    <Input
                      id="arbGrossLon"
                      type="number"
                      value={arbGrossLon}
                      onChange={(e) => setArbGrossLon(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="arbAge">Ålder på den anställde</Label>
                    <Input
                      id="arbAge"
                      type="number"
                      value={arbAge}
                      onChange={(e) => setArbAge(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="semesterProc">Semesterpåslag (%)</Label>
                    <Input
                      id="semesterProc"
                      type="number"
                      step="0.01"
                      value={semesterProc}
                      onChange={(e) => setSemesterProc(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pensionProc">Tjänstepension (%)</Label>
                    <Input
                      id="pensionProc"
                      type="number"
                      step="0.01"
                      value={pensionProc}
                      onChange={(e) => setPensionProc(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Resultat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {arbetsgivareResult ? (
                    <div className="space-y-6">
                      {/* Main result */}
                      <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-900 mb-2">
                          {formatCurrency(arbetsgivareResult.totalkostnadManad)}
                        </div>
                        <div className="text-sm text-emerald-700">totalkostnad per månad</div>
                      </div>

                      {/* Per hour cost */}
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-xl font-bold text-foreground mb-1">
                          {formatCurrency(arbetsgivareResult.kostnadPerTimme)}
                        </div>
                        <div className="text-sm text-muted-foreground">kostnad per timme (165h/mån)</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ange en bruttolön för att se beräkningen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timlon" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Inputs Column 1 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    Inmatning
                  </CardTitle>
                  <CardDescription>Detaljerad beräkning för timanställda med export till PDF och CSV</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Period and Employee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="period-start">Periodstart</Label>
                      <Input
                        id="period-start"
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="period-end">Periodslut</Label>
                      <Input
                        id="period-end"
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee-name">Anställds namn (valfritt)</Label>
                      <Input
                        id="employee-name"
                        type="text"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        placeholder="Anna Andersson"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employee-id">Anställnings-ID (valfritt)</Label>
                      <Input
                        id="employee-id"
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  {/* Basic wage settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="hourly-rate">Timlön (SEK)</Label>
                      <Input
                        id="hourly-rate"
                        type="number"
                        step="0.01"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rounding-step">Avrundning timmar</Label>
                      <Select value={roundingStep} onValueChange={(value: 'none' | '0.25' | '0.5') => setRoundingStep(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ingen avrundning</SelectItem>
                          <SelectItem value="0.25">0,25 h</SelectItem>
                          <SelectItem value="0.5">0,5 h</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="regular-hours">Ordinarie timmar</Label>
                      <Input
                        id="regular-hours"
                        type="number"
                        step="0.01"
                        value={regularHours}
                        onChange={(e) => setRegularHours(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* OB Entries */}
                  <div className="space-y-2">
                    <Label>OB (Obekväm arbetstid)</Label>
                    {obEntries.map((ob, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-end">
                        <div>
                          <Input
                            placeholder="OB Kväll"
                            value={ob.label}
                            onChange={(e) => {
                              const updated = [...obEntries];
                              updated[index].label = e.target.value;
                              setObEntries(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Timmar"
                            value={ob.hours}
                            onChange={(e) => {
                              const updated = [...obEntries];
                              updated[index].hours = e.target.value;
                              setObEntries(updated);
                            }}
                          />
                        </div>
                        <div>
                          <Select 
                            value={ob.upliftType} 
                            onValueChange={(value: 'percent' | 'fixed') => {
                              const updated = [...obEntries];
                              updated[index].upliftType = value;
                              setObEntries(updated);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percent">Procent (%)</SelectItem>
                              <SelectItem value="fixed">Fast (kr/h)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder={ob.upliftType === 'percent' ? '%' : 'kr/h'}
                            value={ob.value}
                            onChange={(e) => {
                              const updated = [...obEntries];
                              updated[index].value = e.target.value;
                              setObEntries(updated);
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = obEntries.filter((_, i) => i !== index);
                            setObEntries(updated);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Overtime, Merit time, Absence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ot1-hours">Övertid 1 (1,5×) timmar</Label>
                      <Input
                        id="ot1-hours"
                        type="number"
                        step="0.01"
                        value={ot1Hours}
                        onChange={(e) => setOt1Hours(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ot2-hours">Övertid 2 (2,0×) timmar</Label>
                      <Input
                        id="ot2-hours"
                        type="number"
                        step="0.01"
                        value={ot2Hours}
                        onChange={(e) => setOt2Hours(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="merit-hours">Mertid timmar</Label>
                      <Input
                        id="merit-hours"
                        type="number"
                        step="0.01"
                        value={meritHours}
                        onChange={(e) => setMeritHours(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="merit-factor">Mertid faktor</Label>
                      <Input
                        id="merit-factor"
                        type="number"
                        step="0.1"
                        value={meritFactor}
                        onChange={(e) => setMeritFactor(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="absence-hours">Frånvaro utan lön (timmar)</Label>
                      <Input
                        id="absence-hours"
                        type="number"
                        step="0.01"
                        value={absenceHours}
                        onChange={(e) => setAbsenceHours(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Vacation settings */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="vacation-percent">Semesterersättning (%)</Label>
                      <Input
                        id="vacation-percent"
                        type="number"
                        step="0.1"
                        value={vacationPercent}
                        onChange={(e) => setVacationPercent(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Ingår i semesterunderlag</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vacation-regular"
                            checked={vacationBase.regular}
                            onCheckedChange={(checked) => 
                              setVacationBase(prev => ({ ...prev, regular: checked === true }))
                            }
                          />
                          <Label htmlFor="vacation-regular">Ordinarie</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vacation-ob"
                            checked={vacationBase.ob}
                            onCheckedChange={(checked) => 
                              setVacationBase(prev => ({ ...prev, ob: checked === true }))
                            }
                          />
                          <Label htmlFor="vacation-ob">OB</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vacation-overtime"
                            checked={vacationBase.overtime}
                            onCheckedChange={(checked) => 
                              setVacationBase(prev => ({ ...prev, overtime: checked === true }))
                            }
                          />
                          <Label htmlFor="vacation-overtime">Övertid</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vacation-merit"
                            checked={vacationBase.merit}
                            onCheckedChange={(checked) => 
                              setVacationBase(prev => ({ ...prev, merit: checked === true }))
                            }
                          />
                          <Label htmlFor="vacation-merit">Mertid</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Column */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Resultat
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

                      {/* Summary amounts */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Ordinarie lön:</span>
                          <span className="font-medium">{formatCurrency(wageResult.summary.regularAmount)}</span>
                        </div>
                        {wageResult.summary.obAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>OB-ersättning:</span>
                            <span className="font-medium">{formatCurrency(wageResult.summary.obAmount)}</span>
                          </div>
                        )}
                        {wageResult.summary.overtimeAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Övertidsersättning:</span>
                            <span className="font-medium">{formatCurrency(wageResult.summary.overtimeAmount)}</span>
                          </div>
                        )}
                        {wageResult.summary.meritAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Mertidsersättning:</span>
                            <span className="font-medium">{formatCurrency(wageResult.summary.meritAmount)}</span>
                          </div>
                        )}
                        {wageResult.summary.absenceAmount < 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Frånvaro:</span>
                            <span className="font-medium text-red-600">{formatCurrency(wageResult.summary.absenceAmount)}</span>
                          </div>
                        )}
                        <hr className="border-muted" />
                        <div className="flex justify-between text-sm">
                          <span>Semesterunderlag:</span>
                          <span className="font-medium">{formatCurrency(wageResult.summary.vacationBaseAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Semesterersättning:</span>
                          <span className="font-medium">{formatCurrency(wageResult.summary.vacationAmount)}</span>
                        </div>
                        <hr className="border-muted" />
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Kostnad per timme:</span>
                          <span>{formatCurrency(wageResult.costPerHour)}</span>
                        </div>
                      </div>

                      {/* Export buttons */}
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const rate = parseFloat(hourlyRate) || 0;
                              const input: WageInput = {
                                period: { start: periodStart, end: periodEnd },
                                employee: { name: employeeName, id: employeeId },
                                hourlyRate: rate,
                                roundingStep: roundingStep,
                                regularHours: parseFloat(regularHours) || 0,
                                obEntries: obEntries.map(ob => ({
                                  label: ob.label,
                                  hours: parseFloat(ob.hours) || 0,
                                  upliftType: ob.upliftType,
                                  value: parseFloat(ob.value) || 0
                                })),
                                overtime: { 
                                  ot1: { hours: parseFloat(ot1Hours) || 0, factor: 1.5 }, 
                                  ot2: { hours: parseFloat(ot2Hours) || 0, factor: 2.0 } 
                                },
                                meritTime: { hours: parseFloat(meritHours) || 0, factor: parseFloat(meritFactor) || 1.0 },
                                absenceHours: parseFloat(absenceHours) || 0,
                                addons: addons.map(addon => ({
                                  label: addon.label,
                                  amount: parseFloat(addon.amount) || 0,
                                  count: parseFloat(addon.count) || 1
                                })),
                                vacationPercent: parseFloat(vacationPercent) || 12.0,
                                vacationBase: vacationBase
                              };
                              generateWagePDF(input, wageResult);
                            }}
                            className="w-full"
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Exportera PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const rate = parseFloat(hourlyRate) || 0;
                              const input: WageInput = {
                                period: { start: periodStart, end: periodEnd },
                                employee: { name: employeeName, id: employeeId },
                                hourlyRate: rate,
                                roundingStep: roundingStep,
                                regularHours: parseFloat(regularHours) || 0,
                                obEntries: obEntries.map(ob => ({
                                  label: ob.label,
                                  hours: parseFloat(ob.hours) || 0,
                                  upliftType: ob.upliftType,
                                  value: parseFloat(ob.value) || 0
                                })),
                                overtime: { 
                                  ot1: { hours: parseFloat(ot1Hours) || 0, factor: 1.5 }, 
                                  ot2: { hours: parseFloat(ot2Hours) || 0, factor: 2.0 } 
                                },
                                meritTime: { hours: parseFloat(meritHours) || 0, factor: parseFloat(meritFactor) || 1.0 },
                                absenceHours: parseFloat(absenceHours) || 0,
                                addons: addons.map(addon => ({
                                  label: addon.label,
                                  amount: parseFloat(addon.amount) || 0,
                                  count: parseFloat(addon.count) || 1
                                })),
                                vacationPercent: parseFloat(vacationPercent) || 12.0,
                                vacationBase: vacationBase
                              };
                              exportLineItemsCSV(input, wageResult);
                            }}
                            className="w-full"
                          >
                            <Table className="h-4 w-4 mr-2" />
                            Exportera detaljerad CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const rate = parseFloat(hourlyRate) || 0;
                              const input: WageInput = {
                                period: { start: periodStart, end: periodEnd },
                                employee: { name: employeeName, id: employeeId },
                                hourlyRate: rate,
                                roundingStep: roundingStep,
                                regularHours: parseFloat(regularHours) || 0,
                                obEntries: obEntries.map(ob => ({
                                  label: ob.label,
                                  hours: parseFloat(ob.hours) || 0,
                                  upliftType: ob.upliftType,
                                  value: parseFloat(ob.value) || 0
                                })),
                                overtime: { 
                                  ot1: { hours: parseFloat(ot1Hours) || 0, factor: 1.5 }, 
                                  ot2: { hours: parseFloat(ot2Hours) || 0, factor: 2.0 } 
                                },
                                meritTime: { hours: parseFloat(meritHours) || 0, factor: parseFloat(meritFactor) || 1.0 },
                                absenceHours: parseFloat(absenceHours) || 0,
                                addons: addons.map(addon => ({
                                  label: addon.label,
                                  amount: parseFloat(addon.amount) || 0,
                                  count: parseFloat(addon.count) || 1
                                })),
                                vacationPercent: parseFloat(vacationPercent) || 12.0,
                                vacationBase: vacationBase
                              };
                              exportSummaryCSV(input, wageResult);
                            }}
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
                      <p>Ange en timlön för att se beräkningen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Status and Data Sources */}
        <div className="text-center space-y-2 text-sm text-muted-foreground max-w-4xl mx-auto mt-12">
          <p>Gäller inkomstår {config2025.taxYear}</p>
          <p>Senast uppdaterad: {new Date(config2025.lastUpdatedISO).toLocaleDateString('sv-SE')}</p>
          <p className="text-xs">{taxEngine.getDataSources()}</p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 max-w-4xl mx-auto mt-6">
          <div className="flex items-center justify-center gap-2 text-emerald-800">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Ingen data sparas – alla beräkningar sker i din webbläsare
            </span>
          </div>
        </div>
      </section>

      {/* Ad Slot - Bottom */}
      <section className="max-w-2xl mx-auto">
        <AdSlot 
          slotId="salary-bottom"
          sizeMapping={{
            mobile: [320, 250],
            tablet: [728, 90],
            desktop: [728, 90],
          }}
          refreshIntervalSec={120}
        />
      </section>
    </div>
  );
}