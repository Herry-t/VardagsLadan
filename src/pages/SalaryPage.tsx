import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Info } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

interface SalaryCalculation {
  grossSalary: number;
  employerFee: number;
  extraCosts: number;
  totalMonthly: number;
  totalYearly: number;
  breakdown: {
    salary: number;
    socialFees: number;
    extra: number;
  };
}

export default function SalaryPage() {
  const [grossSalary, setGrossSalary] = useState<string>('35000');
  const [employerFeeRate, setEmployerFeeRate] = useState<string>('31.42');
  const [extraCosts, setExtraCosts] = useState<string>('0');

  const calculation = useMemo((): SalaryCalculation | null => {
    const salary = parseFloat(grossSalary) || 0;
    const feeRate = parseFloat(employerFeeRate) || 0;
    const extra = parseFloat(extraCosts) || 0;

    if (salary <= 0) return null;

    const socialFees = (salary * feeRate) / 100;
    const totalMonthly = salary + socialFees + extra;

    return {
      grossSalary: salary,
      employerFee: feeRate,
      extraCosts: extra,
      totalMonthly,
      totalYearly: totalMonthly * 12,
      breakdown: {
        salary,
        socialFees,
        extra
      }
    };
  }, [grossSalary, employerFeeRate, extraCosts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Input Form */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Löneinformation</CardTitle>
              <CardDescription>
                Ange bruttolön och arbetsgivaravgifter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gross-salary">Bruttolön per månad (SEK)</Label>
                <Input
                  id="gross-salary"
                  type="number"
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(e.target.value)}
                  placeholder="35000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employer-fee">Arbetsgivaravgift (%)</Label>
                <Input
                  id="employer-fee"
                  type="number"
                  step="0.01"
                  value={employerFeeRate}
                  onChange={(e) => setEmployerFeeRate(e.target.value)}
                  placeholder="31.42"
                />
                <p className="text-xs text-muted-foreground">
                  Standard: 31.42% (varierar med ålder och avtal)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extra-costs">Extra kostnader per månad (SEK)</Label>
                <Input
                  id="extra-costs"
                  type="number"
                  value={extraCosts}
                  onChange={(e) => setExtraCosts(e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  T.ex. förmåner, försäkringar, utrustning
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Results */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Beräkning
              </CardTitle>
              <CardDescription>
                Total kostnad för arbetsgivaren
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculation ? (
                <div className="space-y-6">
                  {/* Monthly Total */}
                  <div className="text-center p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {formatCurrency(calculation.totalMonthly)}
                    </div>
                    <div className="text-sm text-muted-foreground">per månad</div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      Uppdelning per månad
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">Bruttolön</span>
                        <span className="font-mono">{formatCurrency(calculation.breakdown.salary)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-sm">
                          Sociala avgifter ({formatPercentage(calculation.employerFee)})
                        </span>
                        <span className="font-mono">{formatCurrency(calculation.breakdown.socialFees)}</span>
                      </div>
                      
                      {calculation.breakdown.extra > 0 && (
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm">Extra kostnader</span>
                          <span className="font-mono">{formatCurrency(calculation.breakdown.extra)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center py-3 border-t-2 font-semibold">
                        <span>Total kostnad/månad</span>
                        <span className="font-mono">{formatCurrency(calculation.totalMonthly)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Yearly Total */}
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold text-foreground mb-1">
                      {formatCurrency(calculation.totalYearly)}
                    </div>
                    <div className="text-sm text-muted-foreground">per år</div>
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
        </section>
      </div>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto">
        <Card className="border-dashed border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-3 text-sm">
                <p className="font-medium text-foreground">
                  Viktig information
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>
                    <strong>Förenklad modell:</strong> Detta är en grundläggande beräkning som kan variera beroende på ålder, 
                    kollektivavtal, särskilda förmåner och lagändringar.
                  </li>
                  <li>
                    <strong>Arbetsgivaravgifter:</strong> Standard 31.42% men kan vara lägre för unga (15.49% för 18-19 år) 
                    eller äldre arbetstagare, samt variera mellan branscher.
                  </li>
                  <li>
                    <strong>Kontrollera alltid:</strong> Använd Skatteverkets officiella verktyg eller konsultera en redovisningskonsult 
                    för exakta beräkningar för ditt specifika fall.
                  </li>
                  <li>
                    <strong>Extra kostnader:</strong> Tänk på att lägga till kostnader för semester, sjukfrånvaro, 
                    pensionsavsättningar, försäkringar och andra förmåner.
                  </li>
                </ul>
              </div>
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
