import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, ArrowRight } from 'lucide-react';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  const steps = [
    t('howItWorks.steps.0'),
    t('howItWorks.steps.1'),
    t('howItWorks.steps.2'),
    t('howItWorks.steps.3'),
    t('howItWorks.steps.4'),
  ];

  return (
    <Card className={cn("bg-gradient-subtle", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          {t('howItWorks.title')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <Badge 
                variant="secondary" 
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs font-bold"
              >
                {index + 1}
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Example */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            {t('howItWorks.example.title')}
          </h4>
          
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Input:</span>
              <code className="font-mono font-medium bg-muted px-2 py-1 rounded">
                {t('howItWorks.example.input')}
              </code>
            </div>
            
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Result:</span>
                <span className="font-medium text-primary">
                  {t('howItWorks.example.result')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Complete:</span>
                <code className="font-mono font-bold bg-success/10 text-success px-2 py-1 rounded">
                  {t('howItWorks.example.complete')}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm details */}
        <div className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
          <strong>Luhn-algoritmen:</strong> Varje andra siffra (från vänster) multipliceras med 2. 
          Om resultatet blir tvåsiffrigt, adderas siffrorna (t.ex. 16 → 1+6=7). 
          Alla siffror summeras och kontrollsiffran är vad som behövs för att göra summan delbar med 10.
        </div>
      </CardContent>
    </Card>
  );
}