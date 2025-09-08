import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, User, Calendar } from 'lucide-react';
import { t } from '@/lib/i18n';
import { ValidationResult } from '@/lib/pnr';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ResultCardProps {
  result: ValidationResult | null;
  isIncomplete: boolean;
  className?: string;
}

export function ResultCard({ result, isIncomplete, className }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!result?.formatted) return;
    
    try {
      await navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      toast({
        description: t('result.copied'),
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [result?.formatted]);

  if (!result) {
    return (
      <Card className={cn("bg-muted/30", className)}>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">
            Ange ett personnummer för att börja
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (result.error) return 'bg-destructive';
    if (isIncomplete) return 'bg-primary';
    return result.isValid ? 'bg-success' : 'bg-destructive';
  };

  const getStatusText = () => {
    if (result.error) return result.error;
    if (isIncomplete) return t('result.suggested');
    return result.isValid ? t('result.valid') : t('result.invalid');
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-300", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
            <span className="font-medium text-foreground">
              {getStatusText()}
            </span>
          </div>
          
          {result.isCoordinationNumber && (
            <Badge variant="secondary" className="text-xs">
              {t('result.coordination')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main result */}
        {result.checkDigit !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {isIncomplete ? t('result.suggested') : t('result.checkDigit')}
              </span>
              <span className="text-2xl font-bold font-mono text-primary">
                {result.checkDigit}
              </span>
            </div>
            
            {result.formatted && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <code className="flex-1 text-lg font-mono font-medium">
                  {result.formatted}
                </code>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="ghost"
                  className="shrink-0"
                  aria-label={t('result.copy')}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        {result.gender && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('result.gender.label')}</p>
                <p className="text-sm font-medium">
                  {t(`result.gender.${result.gender}`)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('result.century')}</p>
                <p className="text-sm font-medium">
                  {result.isCoordinationNumber ? '20xx/19xx' : '20xx/19xx'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {result.error && !result.isValid && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              {result.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}