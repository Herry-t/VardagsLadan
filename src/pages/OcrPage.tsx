import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Check, X, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdSlot } from '@/components/AdSlot';

interface OcrValidation {
  isValid: boolean;
  checkDigit: number | null;
  cleaned: string;
  error?: string;
}

export default function OcrPage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Luhn algorithm for OCR validation
  const validateOcr = (ocrNumber: string): OcrValidation => {
    const cleaned = ocrNumber.replace(/\D/g, '');
    
    if (cleaned.length < 2) {
      return {
        isValid: false,
        checkDigit: null,
        cleaned,
        error: 'OCR-nummer måste innehålla minst 2 siffror'
      };
    }

    // Split into number and check digit
    const mainNumber = cleaned.slice(0, -1);
    const providedCheckDigit = parseInt(cleaned.slice(-1));
    
    // Calculate check digit using Luhn algorithm
    let sum = 0;
    let alternate = false;
    
    // Process from right to left (excluding check digit)
    for (let i = mainNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(mainNumber[i]);
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = digit - 9;
        }
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    const isValid = calculatedCheckDigit === providedCheckDigit;
    
    return {
      isValid,
      checkDigit: calculatedCheckDigit,
      cleaned,
      error: isValid ? undefined : `Felaktig kontrollsiffra. Förväntad: ${calculatedCheckDigit}, fick: ${providedCheckDigit}`
    };
  };

  const validation = useMemo(() => {
    if (!input.trim()) {
      return null;
    }
    return validateOcr(input);
  }, [input]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Kopierat!',
        description: 'OCR-nummer har kopierats till urklipp',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte kopiera till urklipp',
        variant: 'destructive'
      });
    }
  };

  const formatOcr = (ocr: string) => {
    return ocr.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Hash className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            OCR-nummer
          </h1>
        </div>
        <p className="text-muted-foreground">
          Validera OCR-nummer (Optical Character Recognition) med Luhn-algoritmen
        </p>
        <Badge variant="secondary" className="text-xs">
          Olika avsändare kan använda olika regler • Detta är standardkontrollen (Luhn/Mod10)
        </Badge>
      </section>

      {/* Ad Slot - Top */}
      <section className="max-w-2xl mx-auto">
        <AdSlot 
          slotId="ocr-top"
          sizeMapping={{
            mobile: [320, 100],
            tablet: [728, 90],
            desktop: [728, 90],
          }}
        />
      </section>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>OCR-nummer</CardTitle>
            <CardDescription>
              Ange OCR-nummer för validering av kontrollsiffra
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ocr-input">OCR-nummer</Label>
              <Input
                id="ocr-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="123456789123456"
                className="font-mono text-lg"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Ange OCR-nummer med eller utan mellanslag. Sista siffran är kontrollsiffran.
              </p>
            </div>
          </CardContent>
        </Card>

        {validation && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validation.isValid ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <X className="h-5 w-5 text-destructive" />
                )}
                Validering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed">
                <div>
                  <div className="font-semibold">
                    {validation.isValid ? (
                      <span className="text-success">Giltigt OCR-nummer</span>
                    ) : (
                      <span className="text-destructive">Ogiltigt OCR-nummer</span>
                    )}
                  </div>
                  {validation.error && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {validation.error}
                    </div>
                  )}
                </div>
                <Badge variant={validation.isValid ? "default" : "destructive"}>
                  {validation.isValid ? "Giltigt" : "Ogiltigt"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                Om OCR-nummer
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>OCR-nummer (Optical Character Recognition)</strong> används på fakturor och 
                  inbetalningskort för att automatiskt koppla betalningar till rätt kund eller ärende.
                </p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Sista siffran är en kontrollsiffra som beräknas med Luhn-algoritmen (Mod10)</li>
                  <li>Kontrollsiffran hjälper till att upptäcka skrivfel vid inmatning</li>
                  <li>Olika företag kan ha egna regler för OCR-numrets struktur</li>
                  <li>Denna validering kontrollerar endast den matematiska korrektheten</li>
                </ul>
                <p className="pt-2 text-xs">
                  <strong>Obs:</strong> Vissa avsändare kan använda andra metoder än Luhn för kontrollsiffran. 
                  Kontakta avsändaren om du är osäker på ett specifikt OCR-nummer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Slot - Bottom */}
      <section className="max-w-2xl mx-auto">
        <AdSlot 
          slotId="ocr-bottom"
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
