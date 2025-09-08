import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shuffle } from 'lucide-react';
import { t } from '@/lib/i18n';
import { generateTestPnr } from '@/lib/pnr';
import { cn } from '@/lib/utils';

interface TestGeneratorProps {
  onGenerate: (pnr: string) => void;
  enabled?: boolean;
  className?: string;
}

export function TestGenerator({ onGenerate, enabled = false, className }: TestGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!enabled) {
    return null;
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      const testPnr = generateTestPnr();
      onGenerate(testPnr);
      setIsGenerating(false);
    }, 300);
  };

  return (
    <Card className={cn("border-warning/20 bg-warning/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-3 flex-1">
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('testGenerator.disclaimer')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('testGenerator.warning')}
              </p>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Shuffle className={cn(
                "h-4 w-4 mr-2",
                isGenerating && "animate-spin"
              )} />
              {t('testGenerator.button')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}