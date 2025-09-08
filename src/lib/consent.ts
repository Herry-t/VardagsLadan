/**
 * Privacy and consent management
 * Stub implementation for analytics and ad consent
 */

// Type declarations for third-party scripts
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

export interface ConsentSettings {
  analytics: boolean;
  ads: boolean;
  necessary: boolean;
}

const DEFAULT_CONSENT: ConsentSettings = {
  analytics: false,
  ads: false,
  necessary: true, // Always true for app functionality
};

export function getConsent(): ConsentSettings {
  try {
    const stored = localStorage.getItem('pnr-consent');
    if (stored) {
      return { ...DEFAULT_CONSENT, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load consent settings:', error);
  }
  
  return DEFAULT_CONSENT;
}

export function setConsent(settings: Partial<ConsentSettings>): void {
  try {
    const current = getConsent();
    const updated = { ...current, ...settings };
    localStorage.setItem('pnr-consent', JSON.stringify(updated));
    
    // Dispatch event for components to react to consent changes
    window.dispatchEvent(new CustomEvent('consent-updated', { 
      detail: updated 
    }));
  } catch (error) {
    console.error('Failed to save consent settings:', error);
  }
}

export function hasConsent(type: keyof ConsentSettings): boolean {
  return getConsent()[type];
}

/**
 * Analytics provider interface
 * Pluggable implementation for different analytics providers
 */
export interface AnalyticsProvider {
  init(): void;
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
}

/**
 * Plausible Analytics implementation
 */
export class PlausibleAnalytics implements AnalyticsProvider {
  private domain: string;
  
  constructor(domain: string) {
    this.domain = domain;
  }
  
  init(): void {
    if (!hasConsent('analytics')) return;
    
    // Load Plausible script
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://plausible.io/js/script.js';
    script.setAttribute('data-domain', this.domain);
    document.head.appendChild(script);
  }
  
  track(event: string, properties?: Record<string, any>): void {
    if (!hasConsent('analytics')) return;
    
    if (typeof window.plausible === 'function') {
      window.plausible(event, { props: properties });
    }
  }
  
  identify(): void {
    // Plausible doesn't support user identification
    // This is intentional for privacy
  }
}

/**
 * Mock Analytics for development
 */
export class MockAnalytics implements AnalyticsProvider {
  init(): void {
    console.log('[Analytics] Initialized (mock)');
  }
  
  track(event: string, properties?: Record<string, any>): void {
    console.log('[Analytics] Track:', event, properties);
  }
  
  identify(userId: string, traits?: Record<string, any>): void {
    console.log('[Analytics] Identify:', userId, traits);
  }
}

// Global analytics instance
let analytics: AnalyticsProvider | null = null;

export function initAnalytics(provider: AnalyticsProvider): void {
  analytics = provider;
  analytics.init();
}

export function trackEvent(event: string, properties?: Record<string, any>): void {
  if (analytics && hasConsent('analytics')) {
    // Never track actual personal numbers - only anonymous events
    const sanitized = properties ? 
      Object.fromEntries(
        Object.entries(properties).filter(([key]) => 
          !key.toLowerCase().includes('pnr') && 
          !key.toLowerCase().includes('personal')
        )
      ) : {};
    
    analytics.track(event, sanitized);
  }
}