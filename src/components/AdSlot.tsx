import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  slotId: string;
  provider?: 'google' | 'custom';
  sizeMapping?: {
    mobile: [number, number];
    tablet: [number, number];
    desktop: [number, number];
  };
  refreshIntervalSec?: number;
  className?: string;
}

export function AdSlot({
  slotId,
  provider = 'custom',
  sizeMapping = {
    mobile: [320, 100],
    tablet: [728, 90],
    desktop: [728, 90],
  },
  refreshIntervalSec = 0,
  className,
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track user interaction
  useEffect(() => {
    const handleInteraction = () => setHasUserInteracted(true);
    
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Intersection Observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= 0.5);
      },
      { threshold: 0.5 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Polite refresh logic
  useEffect(() => {
    if (refreshIntervalSec > 0 && refreshIntervalSec >= 60) {
      intervalRef.current = setInterval(() => {
        if (isVisible && hasUserInteracted) {
          // Refresh ad (implementation depends on provider)
          console.log(`Refreshing ad slot ${slotId}`);
        }
      }, refreshIntervalSec * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slotId, refreshIntervalSec, isVisible, hasUserInteracted]);

  // Mock ad content for demo
  const renderMockAd = () => (
    <div className="flex items-center justify-center bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg h-full">
      <div className="text-center space-y-1">
        <div className="text-xs text-muted-foreground font-mono">
          AD SLOT: {slotId}
        </div>
        <div className="text-xs text-muted-foreground">
          {sizeMapping.desktop[0]} × {sizeMapping.desktop[1]}
        </div>
      </div>
    </div>
  );

  const getResponsiveHeight = () => {
    // Simple responsive height based on screen size
    return {
      height: `${sizeMapping.mobile[1]}px`,
      '@media (min-width: 768px)': {
        height: `${sizeMapping.tablet[1]}px`,
      },
      '@media (min-width: 1024px)': {
        height: `${sizeMapping.desktop[1]}px`,
      },
    };
  };

  return (
    <div
      ref={adRef}
      className={cn(
        "relative w-full overflow-hidden",
        "transition-opacity duration-300",
        className
      )}
      style={{ minHeight: `${sizeMapping.mobile[1]}px` }}
      aria-label="Annons"
    >
      <div 
        className="w-full"
        style={getResponsiveHeight()}
      >
        {renderMockAd()}
      </div>
      
      {/* Lazy loading indicator */}
      {!isVisible && (
        <div className="absolute inset-0 bg-muted/20 animate-pulse rounded-lg" />
      )}
    </div>
  );
}