import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { PnrInput } from '@/components/PnrInput';
import { ResultCard } from '@/components/ResultCard';
import { HowItWorks } from '@/components/HowItWorks';
import { AdSlot } from '@/components/AdSlot';
import { TestGenerator } from '@/components/TestGenerator';
import { t } from '@/lib/i18n';
import { validateFull, parsePnr } from '@/lib/pnr';

const Index = () => {
  const [input, setInput] = useState('');
  const [isTestGeneratorEnabled] = useState(false); // Feature flag

  // Parse and validate input in real-time
  const { result, error, isIncomplete } = useMemo(() => {
    if (!input.trim()) {
      return { result: null, error: undefined, isIncomplete: false };
    }

    const cleaned = input.replace(/[^\d\-+]/g, '');
    if (cleaned.length < 9) {
      return { 
        result: null, 
        error: cleaned.length > 0 ? t('errors.tooShort') : undefined,
        isIncomplete: true 
      };
    }

    try {
      const parsed = parsePnr(input);
      if (!parsed.isValid && parsed.error) {
        return { result: null, error: parsed.error, isIncomplete: false };
      }

      const validation = validateFull(input);
      const isIncomplete = parsed.checkDigit === null;

      return { 
        result: validation, 
        error: validation.error, 
        isIncomplete 
      };
    } catch (err) {
      return { 
        result: null, 
        error: 'Oväntat fel vid validering', 
        isIncomplete: false 
      };
    }
  }, [input]);

  // Auto-focus input on mount
  useEffect(() => {
    const inputElement = document.getElementById('pnr-input');
    if (inputElement) {
      inputElement.focus();
    }
  }, []);

  const handleTestGenerate = (testPnr: string) => {
    setInput(testPnr);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t('app.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('app.subtitle')}
              </p>
            </div>
            
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Shield className="h-3 w-3" />
              {t('app.privacyBadge')}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <section className="max-w-md mx-auto">
          <PnrInput
            value={input}
            onChange={setInput}
            error={error}
          />
        </section>

        {/* Test Generator */}
        {isTestGeneratorEnabled && (
          <section className="max-w-md mx-auto">
            <TestGenerator 
              onGenerate={handleTestGenerate}
              enabled={isTestGeneratorEnabled}
            />
          </section>
        )}

        {/* Ad Slot 1 - Above Results */}
        <section className="max-w-2xl mx-auto">
          <AdSlot 
            slotId="personnummer-top"
            sizeMapping={{
              mobile: [320, 100],
              tablet: [728, 90],
              desktop: [728, 90],
            }}
          />
        </section>

        {/* Results Section */}
        <section className="max-w-md mx-auto">
          <ResultCard 
            result={result}
            isIncomplete={isIncomplete}
          />
        </section>

        {/* How It Works Section */}
        <section className="max-w-2xl mx-auto">
          <HowItWorks />
        </section>

        {/* Ad Slot 2 - Below Info */}
        <section className="max-w-2xl mx-auto">
          <AdSlot 
            slotId="personnummer-bottom"
            sizeMapping={{
              mobile: [320, 250],
              tablet: [728, 90],
              desktop: [728, 90],
            }}
            refreshIntervalSec={120} // 2 minutes
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                {t('app.privacyBadge')}
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                All beräkningar sker lokalt i din webbläsare. Inga personnummer skickas till servrar.
              </p>
              <p>
                Detta verktyg följer den svenska standarden för personnummer enligt Luhn-algoritmen.
              </p>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Personnummer Validator. 
                Byggd med React, TypeScript och Tailwind CSS.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;