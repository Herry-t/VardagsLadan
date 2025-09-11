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

  const wageResult = useMemo(() => {
    const rate = parseFloat(hourlyRate) || 0;
    const regular = parseFloat(regularHours) || 0;
    
    if (rate <= 0) return null;

    const input: WageInput = {
      period: { start: '2025-09-01', end: '2025-09-30' },
      hourlyRate: rate,
      roundingStep: 'none',
      regularHours: regular,
      obEntries: [],
      overtime: { ot1: { hours: 0, factor: 1.5 }, ot2: { hours: 0, factor: 2.0 } },
      meritTime: { hours: 0, factor: 1.0 },
      absenceHours: 0,
      addons: [],
      vacationPercent: 12.0,
      vacationBase: { regular: true, ob: true, overtime: false, merit: false, addons: false }
    };

    return wageEngine.calculate(input);
  }, [hourlyRate, regularHours, wageEngine]);

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
          Beräkna din nettolön eller arbetsgivaravgifter enkelt och snabbt
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
            <TabsTrigger value="nettlon">Nettolön</TabsTrigger>
            <TabsTrigger value="arbetsgivare">Arbetsgivarkostnad</TabsTrigger>
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
        </Tabs>

          <TabsContent value="timlon" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    Inmatning
                  </CardTitle>
                  <CardDescription>Detaljerad beräkning för timanställda med export till PDF och CSV</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="regular-hours">Ordinarie timmar</Label>
                    <Input
                      id="regular-hours"
                      type="number"
                      step="0.01"
                      value={regularHours}
                      onChange={(e) => setRegularHours(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Resultat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wageResult ? (
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-900 mb-2">
                          {formatCurrency(wageResult.summary.grossPayAmount)}
                        </div>
                        <div className="text-sm text-emerald-700">bruttolön att utbetala</div>
                      </div>
                      
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-emerald-800 text-sm">
                          <Lock className="h-4 w-4" />
                          <span>Export sker lokalt i din webbläsare. Ingen information sparas eller skickas till vår server.</span>
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