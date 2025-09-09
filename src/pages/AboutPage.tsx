import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Shield, Zap, Smartphone, Code2, Heart } from 'lucide-react';
import { AdSlot } from '@/components/AdSlot';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Info className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Om Vardagslådan
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Din digitala verktygslåda för vardagen i Sverige
        </p>
      </section>

      {/* Ad Slot - Top */}
      <section className="max-w-2xl mx-auto">
        <AdSlot 
          slotId="about-top"
          sizeMapping={{
            mobile: [320, 100],
            tablet: [728, 90],
            desktop: [728, 90],
          }}
        />
      </section>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Vårt uppdrag
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Vardagslådan är skapad för att förenkla vardagen för människor som bor i Sverige. 
              Vi samlar praktiska miniverktyg på ett ställe så att du slipper leta runt på 
              internet eller ladda ner appar för enkla beräkningar och valideringar.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Från personnummervalidering till arbetsgivarkostnadsberäkningar – vi fokuserar på 
              de verktyg som svenskar faktiskt behöver i vardagen, både privatpersoner och småföretagare.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                Säkert & Privat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All beräkning sker lokalt i din webbläsare. Vi skickar aldrig dina data till 
                våra servrar och sparar ingen personlig information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-600" />
                Snabbt & Enkelt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Inga registreringar, inga komplicerade formulär. Bara rena verktyg som fungerar 
                direkt när du behöver dem.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5 text-blue-600" />
                Mobilvänligt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Optimerat för alla enheter – fungerar lika bra på mobilen som på datorn. 
                Går även att installera som app (PWA).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Teknik & Öppen källkod
            </CardTitle>
            <CardDescription>
              Byggt med moderna webbteknologier
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Vardagslådan är byggt med React, TypeScript och Tailwind CSS för att leverera 
              en snabb och tillgänglig upplevelse. Projektet följer moderna standarder för 
              webbtillgänglighet (WCAG) och prestanda.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">PWA</Badge>
              <Badge variant="secondary">Vite</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-dashed border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg text-warning">
              Viktig information och ansvarsfriskrivning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              <strong>Ingen garanti för korrekthet:</strong> Vardagslådan tillhandahåller verktyg 
              för informationsändamål. Vi garanterar inte att beräkningarna eller valideringarna 
              är korrekta i alla situationer.
            </p>
            <p className="text-muted-foreground">
              <strong>Kontrollera med myndigheter:</strong> För officiella ärenden, använd alltid 
              myndigheternas egna verktyg och tjänster. Detta gäller särskilt för skatte-, löne- 
              och juridiska frågor.
            </p>
            <p className="text-muted-foreground">
              <strong>Användning på egen risk:</strong> Användaren ansvarar själv för att kontrollera 
              resultaten och använder tjänsten på egen risk.
            </p>
            <p className="text-muted-foreground">
              <strong>Förändringar:</strong> Lagar, regler och beräkningsmetoder kan ändras. 
              Vi strävar efter att hålla verktygen uppdaterade men kan inte garantera att de 
              alltid reflekterar de senaste ändringarna.
            </p>
          </CardContent>
        </Card>

        {/* Vision */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Framtiden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Vi arbetar kontinuerligt med att lägga till fler användbara verktyg baserat på 
              feedback från användare. Några verktyg på vår roadmap inkluderar valutaomvandling, 
              enhetomvandlare, postnummervalidering och mer avancerade skatteberäkningar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}