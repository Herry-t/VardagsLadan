import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Target, Building2, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TaxEngine, PrivatpersonInput, ArbetsgivareInput } from '@/lib/taxEngine';
import { config2025 } from '@/lib/config/2025';
import PayrollSpecification from '@/components/PayrollSpecification';
import { AdSlot } from '@/components/AdSlot';

export default function SalaryPage() {
  const taxEngine = new TaxEngine(config2025);
  const [activeTab, setActiveTab] = useState("nettolön");

  // Nettolön states
  const [salary, setSalary] = useState('');
  const [municipality, setMunicipality] = useState('Stockholm');
  const [age, setAge] = useState('30');
  const [taxResult, setTaxResult] = useState<any>(null);
  const [showTaxDetails, setShowTaxDetails] = useState(false);

  // Arbetsgivarkostnad states
  const [employerSalary, setEmployerSalary] = useState('');
  const [employerAge, setEmployerAge] = useState('30');
  const [vacationPercent, setVacationPercent] = useState('12.0');
  const [pensionPercent, setPensionPercent] = useState('4.5');
  const [employerResult, setEmployerResult] = useState<any>(null);

  // Calculate nettolön
  useEffect(() => {
    const grossSalary = parseFloat(salary);
    if (grossSalary > 0) {
      const input: PrivatpersonInput = {
        bruttolonManad: grossSalary,
        kommun: municipality,
        age: parseInt(age),
        kyrkomedlem: false,
        extraAvdragManad: 0
      };
      
      setTaxResult(taxEngine.calculatePrivatperson(input));
    } else {
      setTaxResult(null);
    }
  }, [salary, municipality, age]);

  // Calculate employer cost
  useEffect(() => {
    const grossSalary = parseFloat(employerSalary);
    const vacation = parseFloat(vacationPercent);
    const pension = parseFloat(pensionPercent);
    
    if (grossSalary > 0 && vacation >= 0 && pension >= 0) {
      const input: ArbetsgivareInput = {
        bruttolonManad: grossSalary,
        age: parseInt(employerAge),
        semesterProc: vacation,
        pensionProc: pension
      };
      
      setEmployerResult(taxEngine.calculateArbetsgivare(input));
    } else {
      setEmployerResult(null);
    }
  }, [employerSalary, employerAge, vacationPercent, pensionPercent]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Lönekalkyl</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Lönekalkylen hjälper både privatpersoner och arbetsgivare att snabbt räkna ut lön, skatt och kostnader. Här kan du se vad du själv får ut efter skatt, vad en anställd kostar i totalkostnad för arbetsgivaren och räkna fram månadslön för timanställda. Fler praktiska verktyg läggs till löpande för att underlätta planering och jämförelser.
        </p>
      </section>

      {/* Ad Slot - Top */}
      <section className="max-w-2xl mx-auto">
        <AdSlot 
          slotId="salary-top"
          sizeMapping={{
            mobile: [320, 250],
            tablet: [728, 90],
            desktop: [728, 90],
          }}
          refreshIntervalSec={120}
        />
      </section>

      <section>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nettolön">Räkna ut nettolön</TabsTrigger>
            <TabsTrigger value="arbetsgivarkostnad">Räkna ut arbetsgivarens totalkostnad</TabsTrigger>
            <TabsTrigger value="timloneunderlag">Timlöneunderlag</TabsTrigger>
          </TabsList>

          <TabsContent value="nettolön" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Beräkna nettolön
                  </CardTitle>
                  <CardDescription>Ange din bruttolön för att se vad du får ut efter skatt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="salary">Månadslön (brutto, SEK)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="35000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="municipality">Kommun</Label>
                    <Select value={municipality} onValueChange={setMunicipality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Stockholm">Stockholm</SelectItem>
                        <SelectItem value="Göteborg">Göteborg</SelectItem>
                        <SelectItem value="Malmö">Malmö</SelectItem>
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
                      placeholder="30"
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
                  {taxResult ? (
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-3xl font-bold text-emerald-900 mb-2">
                          {formatCurrency(taxResult.nettolonManad)}
                        </div>
                        <div className="text-sm text-emerald-700">nettolön per månad</div>
                      </div>

                      {/* Tax breakdown summary */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-lg font-semibold text-blue-900">
                            {formatCurrency(taxResult.totalSkatt / 12)}
                          </div>
                          <div className="text-xs text-blue-700">total skatt/månad</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-lg font-semibold text-purple-900">
                            {((taxResult.totalSkatt / taxResult.arslon) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-purple-700">total skattesats</div>
                        </div>
                      </div>

                      {/* Detailed breakdown */}
                      <Collapsible open={showTaxDetails} onOpenChange={setShowTaxDetails}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            Visa detaljerad skatteberäkning
                            {showTaxDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 mt-3">
                          <div className="text-sm space-y-2">
                            <div className="font-semibold">Årslön: {formatCurrency(taxResult.arslon)}</div>
                            <div className="space-y-1 pl-4">
                              <div className="flex justify-between">
                                <span>Kommunalskatt ({municipality}):</span>
                                <span>{formatCurrency(taxResult.breakdown.kommunal)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Regionskatt:</span>
                                <span>{formatCurrency(taxResult.breakdown.regional)}</span>
                              </div>
                              {taxResult.breakdown.statlig > 0 && (
                                <div className="flex justify-between">
                                  <span>Statlig skatt:</span>
                                  <span>{formatCurrency(taxResult.breakdown.statlig)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Begravningsavgift:</span>
                                <span>{formatCurrency(taxResult.breakdown.begravning)}</span>
                              </div>
                              {taxResult.breakdown.kyrka > 0 && (
                                <div className="flex justify-between">
                                  <span>Kyrkoavgift:</span>
                                  <span>{formatCurrency(taxResult.breakdown.kyrka)}</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t pt-2 font-semibold flex justify-between">
                              <span>Total skatt/år:</span>
                              <span>{formatCurrency(taxResult.totalSkatt)}</span>
                            </div>
                            <div className="bg-emerald-100 p-2 rounded font-semibold flex justify-between">
                              <span>Nettolön/år:</span>
                              <span>{formatCurrency(taxResult.arslon - taxResult.totalSkatt)}</span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ange en månadslön för att se beräkningen</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="arbetsgivarkostnad" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Beräkna arbetsgivarens totalkostnad
                  </CardTitle>
                  <CardDescription>Ange bruttolön för att se den totala kostnaden för arbetsgivaren</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="employer-salary">Månadslön (brutto, SEK)</Label>
                    <Input
                      id="employer-salary"
                      type="number"
                      value={employerSalary}
                      onChange={(e) => setEmployerSalary(e.target.value)}
                      placeholder="35000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employer-age">Ålder på anställd</Label>
                    <Input
                      id="employer-age"
                      type="number"
                      value={employerAge}
                      onChange={(e) => setEmployerAge(e.target.value)}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vacation-percent">Semesterpåslag (%)</Label>
                    <Input
                      id="vacation-percent"
                      type="number"
                      step="0.1"
                      value={vacationPercent}
                      onChange={(e) => setVacationPercent(e.target.value)}
                      placeholder="12.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pension-percent">Pension (%)</Label>
                    <Input
                      id="pension-percent"
                      type="number"
                      step="0.1"
                      value={pensionPercent}
                      onChange={(e) => setPensionPercent(e.target.value)}
                      placeholder="4.5"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    Total kostnad för arbetsgivaren
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employerResult ? (
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-3xl font-bold text-orange-900 mb-2">
                          {formatCurrency(employerResult.totalkostnadManad)}
                        </div>
                        <div className="text-sm text-orange-700">total kostnad per månad</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-lg font-semibold text-blue-900">
                            {formatCurrency(employerResult.kostnadPerTimme)}
                          </div>
                          <div className="text-xs text-blue-700">kostnad per timme</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="text-lg font-semibold text-purple-900">
                            {((employerResult.totalkostnadManad / employerResult.bruttolonManad - 1) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-purple-700">påslag på lön</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="font-semibold">Kostnadsfördelning per månad:</div>
                        <div className="space-y-1 pl-4">
                          <div className="flex justify-between">
                            <span>Bruttolön:</span>
                            <span>{formatCurrency(employerResult.breakdown.bruttolon)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Arbetsgivaravgifter:</span>
                            <span>{formatCurrency(employerResult.breakdown.avgifter)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Semesterpåslag:</span>
                            <span>{formatCurrency(employerResult.breakdown.semester)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pension:</span>
                            <span>{formatCurrency(employerResult.breakdown.pension)}</span>
                          </div>
                        </div>
                        <div className="border-t pt-2 font-semibold flex justify-between">
                          <span>Total kostnad:</span>
                          <span>{formatCurrency(employerResult.totalkostnadManad)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ange en månadslön för att se arbetsgivarens totalkostnad</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timloneunderlag" className="space-y-8">
            <PayrollSpecification />
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
