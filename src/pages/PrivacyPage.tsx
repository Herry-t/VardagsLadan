import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Cookie, ExternalLink } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Integritet & Sekretess
          </h1>
        </div>
        <p className="text-muted-foreground">
          Vi värnar om din integritet och är transparenta med hur vi hanterar data
        </p>
        <Badge variant="secondary" className="text-xs">
          Uppdaterad: {new Date().toLocaleDateString('sv-SE')}
        </Badge>
      </section>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Core Privacy Principle */}
        <Card className="bg-success/5 border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <Shield className="h-5 w-5" />
              Vårt löfte: Allt sker lokalt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              <strong>Vardagslådan skickar aldrig dina beräkningar eller inmatningar till våra servrar.</strong> 
              All beräkning och validering sker direkt i din webbläsare.
            </p>
            <ul className="space-y-1 list-disc list-inside text-sm text-muted-foreground">
              <li>Personnummer, OCR-nummer och andra känsliga data lämnar aldrig din enhet</li>
              <li>Vi kan inte se vad du skriver in i våra verktyg</li>
              <li>Inga databaser sparar dina beräkningar</li>
              <li>Fungerar även utan internetanslutning (efter första besöket)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vad samlar vi in?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Vi samlar INTE in:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-success">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>Personnummer eller andra identitetsuppgifter</span>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>Beräkningsresultat eller inmatningar</span>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>E-postadresser eller kontaktuppgifter</span>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  <span>Exakta platuppgifter</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Vi samlar in (minimalt):</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <div>
                    <span className="font-medium">Grundläggande webbstatistik:</span> Sidvisningar, 
                    ungefärlig geografisk region (land/stad), webbläsartyp - endast för att förstå 
                    hur sajten används.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <div>
                    <span className="font-medium">Teknisk information:</span> Felloggar för att 
                    förbättra prestanda och funktionalitet.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookies & Lokal lagring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">Nödvändiga cookies:</h4>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground ml-4">
                  <li>Samtyckesinställningar för cookies</li>
                  <li>Tekniska inställningar för att webbplatsen ska fungera</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Analys-cookies (valfria):</h4>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground ml-4">
                  <li>Google Analytics för att förstå hur sajten används</li>
                  <li>Kan avböjas genom cookie-inställningar</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Lokal lagring (PWA):</h4>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground ml-4">
                  <li>Cache för att sajten ska fungera offline</li>
                  <li>Innehåller endast statiska filer, inga personuppgifter</li>
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" size="sm">
                <Cookie className="mr-2 h-4 w-4" />
                Hantera cookie-inställningar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Third Party Services */}
        <Card>
          <CardHeader>
            <CardTitle>Tredjepartstjänster</CardTitle>
            <CardDescription>
              Externa tjänster som kan användas på sajten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">GA</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Google Analytics (valfritt)</h4>
                  <p className="text-sm text-muted-foreground">
                    Hjälper oss förstå hur sajten används. Du kan välja bort detta i cookie-inställningar.
                  </p>
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-primary hover:underline"
                  >
                    Googles integritetspolicy
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-green-600">IP</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">ipify.org</h4>
                  <p className="text-sm text-muted-foreground">
                    Används endast för IP-adressverktyget. Ingen annan data skickas till denna tjänst.
                  </p>
                  <a 
                    href="https://www.ipify.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-primary hover:underline"
                  >
                    Läs mer om ipify
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Dina rättigheter (GDPR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Eftersom vi inte samlar in personuppgifter finns det i praktiken inget att radera 
              eller korrigera. Men du har rätt att:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Informationsrätt</h4>
                <p className="text-muted-foreground">
                  Få veta vilken information vi har om dig (spoiler: mycket lite)
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Raderingsrätt</h4>
                <p className="text-muted-foreground">
                  Begära att eventuell data raderas (cookies, cache)
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Invändningsrätt</h4>
                <p className="text-muted-foreground">
                  Invända mot behandling av personuppgifter
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Klagorätt</h4>
                <p className="text-muted-foreground">
                  Lämna klagomål till Datainspektionen
                </p>
              </div>
            </div>

            <div className="pt-4 text-xs text-muted-foreground">
              <p>
                <strong>Kontakt:</strong> För frågor om integritet, kontakta oss på 
                kontakt@vardagslaadan.se
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Ändringar i denna policy</h3>
              <p className="text-sm text-muted-foreground">
                Vi kan komma att uppdatera denna integritetspolicy för att reflektera ändringar 
                i våra rutiner eller för att uppfylla juridiska krav. Väsentliga ändringar 
                meddelas genom en notis på webbplatsen.
              </p>
              <p className="text-xs text-muted-foreground">
                Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')} • Version 1.0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}