import svTranslations from '../i18n/sv.json';
import enTranslations from '../i18n/en.json';

export type Language = 'sv' | 'en';

const translations = {
  sv: svTranslations,
  en: enTranslations,
};

let currentLanguage: Language = 'sv';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to Swedish if key not found
      value = translations.sv;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'sv', name: 'Svenska' },
    { code: 'en', name: 'English' },
  ];
}