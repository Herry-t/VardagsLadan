import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface PnrInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export function PnrInput({ value, onChange, error, className }: PnrInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Allow only digits, dash, and plus
    input = input.replace(/[^\d\-+]/g, '');
    
    // Auto-format: add dash after 6 digits if not present, but only when adding characters
    // Check if the user is adding characters by comparing lengths
    const isAddingCharacters = input.length > value.length;
    
    if (input.length === 6 && !input.includes('-') && !input.includes('+') && isAddingCharacters) {
      input = input.substring(0, 6) + '-';
    }
    
    // Limit length to reasonable maximum
    if (input.length <= 13) {
      onChange(input);
    }
  }, [onChange, value]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor="pnr-input" 
        className="text-sm font-medium text-foreground"
      >
        {t('input.label')}
      </Label>
      
      <div className="relative">
        <Input
          id="pnr-input"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t('input.placeholder')}
          className={cn(
            "text-lg font-mono transition-all duration-200",
            "border-input-border focus:border-primary",
            "px-4 py-3 rounded-lg",
            error && "border-destructive focus:border-destructive",
            isFocused && "shadow-md"
          )}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          inputMode="numeric"
        />
        
        {isFocused && (
          <div className="absolute inset-0 rounded-lg bg-primary/5 pointer-events-none" />
        )}
      </div>
      
      <div className="min-h-[1.5rem]">
        {error ? (
          <p 
            className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200"
            role="alert"
          >
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('input.help')}
          </p>
        )}
      </div>
    </div>
  );
}