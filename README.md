# Personnummer Validator

En modern, snabb och mobilanpassad PWA för att beräkna och verifiera svenska personnummer med Luhn-algoritmen.

![Personnummer Validator](public/icon-192x192.png)

## 🚀 Funktioner

- **Luhn-algoritm**: Korrekt beräkning av kontrollsiffror enligt svensk standard
- **Samordningsnummer**: Fullt stöd för samordningsnummer (dag +60)
- **Realtidsvalidering**: Live-feedback medan du skriver
- **Mobilvänlig**: Responsiv design med touch-optimering
- **PWA**: Installera som app på mobilen
- **Integritetsfokus**: All beräkning sker lokalt i webbläsaren
- **Tillgänglighet**: WCAG AA-kompatibel med skärmläsarstöd
- **Internationalisering**: Stöd för svenska och engelska

## 🛠️ Teknisk stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Tillgänglighet**: ARIA-labels och live regions
- **PWA**: Service Worker + Web App Manifest
- **Testing**: Vitest för enhetstester
- **Linting**: ESLint + Prettier

## 📱 Installation och användning

### Utveckling

```bash
# Klona projektet
git clone <repository-url>
cd personnummer-validator

# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev

# Kör tester
npm test

# Bygg för produktion
npm run build
```

### PWA Installation

Besök appen i en modern webbläsare och klicka på "Installera app"-knappen eller använd webbläsarens installationsalternativ.

## 🔒 Integritet och säkerhet

- **Lokala beräkningar**: Ingen data skickas till servrar
- **Ingen datalagring**: Inga personnummer sparas i localStorage
- **Content Security Policy**: Strikt CSP för säkerhet
- **HTTPS Only**: Kräver säker anslutning i produktion

## 🧮 Algoritm

Appen använder Luhn/Mod10-algoritmen:

1. Ta de första 9 siffrorna (ÅÅMMDDNNN)
2. Multiplicera varannan siffra med 2 (från vänster)
3. Om resultatet blir tvåsiffrigt, addera siffrorna
4. Summera alla siffror
5. Kontrollsiffran = (10 - (summa % 10)) % 10

### Exempel
```
850709-980 → kontrollsiffra: 5
Komplett: 850709-9805
```

## 🧪 Testning

```bash
# Kör alla tester
npm test

# Kör tester med coverage
npm run test:coverage

# Kör tester i watch-läge
npm run test:watch
```

### Testfall

- `850709-980` → kontrollsiffra `5`
- `640823-323` → kontrollsiffra `4`
- Samordningsnummer med dag +60
- Ogiltiga datum och format

## 🚀 Deployment

### Cloudflare Pages

```bash
# Bygg projektet
npm run build

# Ladda upp dist/ mappen till Cloudflare Pages
# Eller använd Wrangler CLI:
npx wrangler pages publish dist
```

### Vercel

```bash
# Installera Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Azure Static Web Apps

```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build And Deploy
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/"
        api_location: ""
        output_location: "dist"
```

## 🎛️ Konfiguration

### Miljövariabler

```env
# Analytics (valfritt)
VITE_ANALYTICS_PROVIDER=plausible
VITE_ANALYTICS_DOMAIN=your-domain.com

# Ads (valfritt) 
VITE_ADS_ENABLED=false
VITE_ADS_PROVIDER=google
```

### Feature Flags

```typescript
// I src/pages/Index.tsx
const [isTestGeneratorEnabled] = useState(false); // Testgenerator
```

## 📊 Analytics och annonser

### Analytics

Appen stöder Plausible Analytics med användarsamtycke:

```typescript
import { initAnalytics, PlausibleAnalytics } from '@/lib/consent';

// Initiera analytics
initAnalytics(new PlausibleAnalytics('your-domain.com'));
```

### Annonser

Annonssystem med respektfull refresh-politik:

- Minimum 60 sekunder mellan refresher
- Endast när annonsytan är >50% synlig
- Endast efter användarinteraktion
- Avstängd som standard

## 🤝 Bidrag

1. Forka projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Committa dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Pusha till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📄 Licens

Detta projekt är licensierat under MIT-licensen. Se `LICENSE` filen för detaljer.

## 🆘 Support

- **Dokumentation**: Se denna README och inline-kommentarer
- **Issues**: Öppna en GitHub issue för buggar eller feature requests
- **Säkerhet**: För säkerhetsproblem, kontakta maintainers direkt

## 🏗️ Arkitektur

```
src/
├── components/          # React komponenter
│   ├── ui/             # shadcn/ui komponenter
│   ├── PnrInput.tsx    # Huvudinmatning
│   ├── ResultCard.tsx  # Resultatvisning
│   ├── HowItWorks.tsx  # Algoritmförklaring
│   └── AdSlot.tsx      # Annonsplatser
├── lib/                # Kärnlogik
│   ├── pnr.ts         # Personnummer-algoritmer
│   ├── i18n.ts        # Internationalisering
│   └── consent.ts     # Integritet och samtycke
├── i18n/              # Översättningar
│   ├── sv.json        # Svenska
│   └── en.json        # Engelska
└── pages/             # Sidor
    └── Index.tsx      # Huvudsida
```

## 🎯 Roadmap

- [ ] Offline-funktionalitet med Service Worker
- [ ] Batch-validering (flera personnummer)
- [ ] Export till CSV/JSON
- [ ] API för utvecklare
- [ ] Organisationsnummer-stöd
- [ ] Historikfunktion (utan datalagring)

---

Byggd med ❤️ för svenska utvecklare och alla som arbetar med personnummer.