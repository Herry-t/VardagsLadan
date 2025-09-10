import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Lock } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';
import { TaxEngine, PrivatpersonInput, ArbetsgivareInput } from '@/lib/taxEngine';
import { config2025 } from '@/lib/config/2025';
import { TaxTooltip } from '@/components/TaxTooltip';
import { TaxBreakdownChart } from '@/components/TaxBreakdownChart';

export default function SalaryPage() {
  const [activeTab, setActiveTab] = useState('privatperson');
  const taxEngine = useMemo(() => new TaxEngine(config2025), []);

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
    const semesterPct = parseFloat(semesterProc) || 12;
    const pensionPct = parseFloat(pensionProc) || 4.5;

    if (salary <= 0) return null;

    const input: ArbetsgivareInput = {
      bruttolonManad: salary,
      age: ageNum,
      semesterProc: semesterPct,
      pensionProc: pensionPct
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

  const kommunOptions = Object.keys(config2025.kommunSkattMap).filter(k => k !== 'FALLBACK');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Arbetsgivarkostnad
          </h1>
        </div>
        <p className="text-muted-foreground">
          Beräkna den totala kostnaden för arbetsgivaren inklusive sociala avgifter
        </p>
        <Badge variant="secondary" className="text-xs">
          Förenklad modell • Kontrollera med myndigheter för exakt beräkning
        </Badge>
      </section>

      {/* Ad Slot - Top */}
      <section className="max-w-2xl mx-auto">
        <AdSlot 
          slotId="salary-top"
          sizeMapping={{
            mobile: [320, 100],
            tablet: [728, 90],
            desktop: [728, 90],
          }}
        />
      </section>

      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="privatperson">Privatperson</TabsTrigger>
            <TabsTrigger value="arbetsgivare">Arbetsgivare</TabsTrigger>
          </TabsList>

          {/* Privatperson Tab */}
          <TabsContent value="privatperson" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Privatperson</CardTitle>
                  <CardDescription>
                    Beräkna din nettolön efter skatt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="kommun">Kommun</Label>
                    <Select value={kommun} onValueChange={setKommun}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj kommun" />
                      </SelectTrigger>
                      <SelectContent>
                        {kommunOptions.map(k => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Ålder</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bruttolon">Bruttolön per månad (SEK)</Label>
                    <Input
                      id="bruttolon"
                      type="number"
                      value={bruttolonManad}
                      onChange={(e) => setBruttolonManad(e.target.value)}
                      placeholder="35000"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kyrkomedlem"
                      checked={kyrkomedlem}
                      onCheckedChange={(checked) => setKyrkomedlem(checked === true)}
                    />
                    <Label htmlFor="kyrkomedlem">Medlem i Svenska kyrkan</Label>
                    <TaxTooltip content="Kyrkoavgift tillkommer för medlemmar i Svenska kyrkan" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="extra-avdrag">Extra skatteavdrag per månad (SEK)</Label>
                    <Input
                      id="extra-avdrag"
                      type="number"
                      value={extraAvdrag}
                      onChange={(e) => setExtraAvdrag(e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      T.ex. preliminärskatteavdrag eller jämkning
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Nettolön
                  </CardTitle>
                  <CardDescription>
                    Din lön efter skatt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {privatpersonResult ? (
                    <div className="space-y-6">
                      {/* Net salary */}
                      <div className="text-center p-6 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-700 mb-1">
                          {formatCurrency(privatpersonResult.nettolonManad)}
                        </div>
                        <div className="text-sm text-muted-foreground">nettolön per månad</div>
                      </div>

                      {/* Tax breakdown chart */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                          Skattefördelning
                        </h4>
                        <TaxBreakdownChart
                          data={[
                            { label: 'Kommunalskatt', value: privatpersonResult.breakdown.kommunal, color: 'bg-emerald-500' },
                            { label: 'Regionalskatt', value: privatpersonResult.breakdown.regional, color: 'bg-emerald-400' },
                            { label: 'Statlig skatt', value: privatpersonResult.breakdown.statlig, color: 'bg-emerald-600' },
                            { label: 'Begravningsavgift', value: privatpersonResult.breakdown.begravning, color: 'bg-emerald-300' },
                            ...(kyrkomedlem ? [{ label: 'Kyrkoavgift', value: privatpersonResult.breakdown.kyrka, color: 'bg-emerald-200' }] : [])
                          ]}
                          total={privatpersonResult.totalSkatt}
                        />
                      </div>

                      {/* Detailed breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm flex items-center">
                            Kommunalskatt
                            <TaxTooltip content="Skatt som går till din kommun för lokala tjänster" />
                          </span>
                          <span className="font-mono">{formatCurrency(privatpersonResult.breakdown.kommunal)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm flex items-center">
                            Regionalskatt
                            <TaxTooltip content="Skatt som går till regionen, främst för sjukvård" />
                          </span>
                          <span className="font-mono">{formatCurrency(privatpersonResult.breakdown.regional)}</span>
                        </div>

                        {privatpersonResult.breakdown.statlig > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm flex items-center">
                              Statlig skatt
                              <TaxTooltip content="Statlig inkomstskatt på lön över 598 500 kr/år (2025)" />
                            </span>
                            <span className="font-mono">{formatCurrency(privatpersonResult.breakdown.statlig)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm flex items-center">
                            Begravningsavgift
                            <TaxTooltip content="Avgift som finansierar begravningsverksamhet" />
                          </span>
                          <span className="font-mono">{formatCurrency(privatpersonResult.breakdown.begravning)}</span>
                        </div>

                        {kyrkomedlem && privatpersonResult.breakdown.kyrka > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm flex items-center">
                              Kyrkoavgift
                              <TaxTooltip content="Avgift för medlemmar i Svenska kyrkan" />
                            </span>
                            <span className="font-mono">{formatCurrency(privatpersonResult.breakdown.kyrka)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center py-3 border-t-2 font-semibold">
                          <span>Total skatt/månad</span>
                          <span className="font-mono">{formatCurrency(privatpersonResult.totalSkatt / 12)}</span>
                        </div>
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

          {/* Arbetsgivare Tab */}
          <TabsContent value="arbetsgivare" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Arbetsgivare</CardTitle>
                  <CardDescription>
                    Beräkna totala anställningskostnader
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="arb-bruttolon">Bruttolön per månad (SEK)</Label>
                    <Input
                      id="arb-bruttolon"
                      type="number"
                      value={arbGrossLon}
                      onChange={(e) => setArbGrossLon(e.target.value)}
                      placeholder="35000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arb-age">Ålder på den anställde</Label>
                    <Input
                      id="arb-age"
                      type="number"
                      value={arbAge}
                      onChange={(e) => setArbAge(e.target.value)}
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Arbetsgivaravgiften varierar med ålder
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester-proc">Semesterersättning (%)</Label>
                    <Input
                      id="semester-proc"
                      type="number"
                      step="0.1"
                      value={semesterProc}
                      onChange={(e) => setSemesterProc(e.target.value)}
                      placeholder="12"
                    />
                    <p className="text-xs text-muted-foreground">
                      Standard procentregeln: 12%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pension-proc">Tjänstepension (%)</Label>
                    <Input
                      id="pension-proc"
                      type="number"
                      step="0.1"
                      value={pensionProc}
                      onChange={(e) => setPensionProc(e.target.value)}
                      placeholder="4.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Typiskt 4.5% enligt ITP-avtal
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Totalkostnad
                  </CardTitle>
                  <CardDescription>
                    Kostnad för arbetsgivaren
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {arbetsgivareResult ? (
                    <div className="space-y-6">
                      {/* Total cost */}
                      <div className="text-center p-6 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-700 mb-1">
                          {formatCurrency(arbetsgivareResult.totalkostnadManad)}
                        </div>
                        <div className="text-sm text-muted-foreground">totalkostnad per månad</div>
                      </div>

                      {/* Cost breakdown chart */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                          Kostnadsfördelning
                        </h4>
                        <TaxBreakdownChart
                          data={[
                            { label: 'Bruttolön', value: arbetsgivareResult.breakdown.bruttolon, color: 'bg-emerald-500' },
                            { label: 'Arbetsgivaravgifter', value: arbetsgivareResult.breakdown.avgifter, color: 'bg-emerald-400' },
                            { label: 'Semesterersättning', value: arbetsgivareResult.breakdown.semester, color: 'bg-emerald-300' },
                            { label: 'Tjänstepension', value: arbetsgivareResult.breakdown.pension, color: 'bg-emerald-200' }
                          ]}
                          total={arbetsgivareResult.totalkostnadManad}
                        />
                      </div>

                      {/* Detailed breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm flex items-center">
                            Bruttolön
                            <TaxTooltip content="Den anställdes lön före skatt" />
                          </span>
                          <span className="font-mono">{formatCurrency(arbetsgivareResult.breakdown.bruttolon)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm flex items-center">
                            Arbetsgivaravgifter
                            <TaxTooltip content="Sociala avgifter som arbetsgivaren betalar till staten" />
                          </span>
                          <span className="font-mono">{formatCurrency(arbetsgivareResult.breakdown.avgifter)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm flex items-center">
                            Semesterersättning
                            <TaxTooltip content="Ersättning för semester enligt procentregeln" />
                          </span>
                          <span className="font-mono">{formatCurrency(arbetsgivareResult.breakdown.semester)}</span>
                        </div>

                        {arbetsgivareResult.breakdown.pension > 0 && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm flex items-center">
                              Tjänstepension
                              <TaxTooltip content="Pensionsavsättning enligt avtal" />
                            </span>
                            <span className="font-mono">{formatCurrency(arbetsgivareResult.breakdown.pension)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center py-3 border-t-2 font-semibold">
                          <span>Totalkostnad/månad</span>
                          <span className="font-mono">{formatCurrency(arbetsgivareResult.totalkostnadManad)}</span>
                        </div>
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

        {/* Status and Data Sources */}
        <div className="text-center space-y-2 text-sm text-muted-foreground max-w-4xl mx-auto">
          <p>Gäller inkomstår {config2025.taxYear}</p>
          <p>Senast uppdaterad: {new Date(config2025.lastUpdatedISO).toLocaleDateString('sv-SE')}</p>
          <p className="text-xs">{taxEngine.getDataSources()}</p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-emerald-800">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Ingen data sparas – alla beräkningar sker i din webbläsare
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto">
        <Card className="border-dashed border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <p className="font-medium text-foreground">
                Viktiga förbehåll
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>
                  <strong>Förenklad beräkning:</strong> Vägledande resultat. Det faktiska utfallet kan variera beroende på 
                  individuella omständigheter, avtal, förmåner och lagändringar.
                </li>
                <li>
                  <strong>Kontrollera alltid:</strong> Använd Skatteverkets officiella verktyg eller konsultera skatte-/redovisningsexpert 
                  för exakta beräkningar för ditt specifika fall.
                </li>
                <li>
                  <strong>Uppdateringar:</strong> Skatteregler och avgifter kan ändras. Kontrollera aktuella regler på Skatteverket.se.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
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
