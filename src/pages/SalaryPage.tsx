import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Target, Building2, Lock } from 'lucide-react';
import { TaxEngine, TaxInput } from '@/lib/taxEngine';
import { config2025 } from '@/lib/config/2025';
import PayrollSpecification from '@/components/PayrollSpecification';
import { AdSlot } from '@/components/AdSlot';

export default function SalaryPage() {
  const taxEngine = new TaxEngine(config2025);
  const [activeTab, setActiveTab] = useState("nettolön");

  const [salary, setSalary] = useState('');
  const [municipality, setMunicipality] = useState('Stockholm');
  const [age, setAge] = useState('30');
  const [taxResult, setTaxResult] = useState<any>(null);

  useEffect(() => {
    const grossSalary = parseFloat(salary);
    if (grossSalary > 0) {
      const input: TaxInput = {
        grossSalary: grossSalary,
        municipality: municipality,
        age: parseInt(age)
      };
      
      setTaxResult(taxEngine.calculateFromGrossSalary(input));
    } else {
      setTaxResult(null);
    }
  }, [salary, municipality, age]);

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
            <TabsTrigger value="nettolön">Räkna ut nettolön (privatperson)</TabsTrigger>
            <TabsTrigger value="arbetsgivarkostnad">Räkna ut arbetsgivarens totalkostnad (arbetsgivare, fast lön)</TabsTrigger>
            <TabsTrigger value="timloneunderlag">Timlöneunderlag (arbetsgivare, timanställda)</TabsTrigger>
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
                          {formatCurrency(taxResult.netSalary)}
                        </div>
                        <div className="text-sm text-emerald-700">nettolön per månad</div>
                      </div>
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
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Arbetsgivarkostnadskalkylator kommer snart</p>
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
