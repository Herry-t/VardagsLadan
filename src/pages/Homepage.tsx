import { Link } from 'react-router-dom';
import { 
  IdCard, 
  Network, 
  Calculator, 
  Hash, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tools = [
  {
    title: 'Personnummer',
    description: 'Validera och beräkna kontrollsiffror',
    icon: IdCard,
    href: '/personnummer',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
  },
  {
    title: 'Min IP-adress',
    description: 'Se din publika IP-adress och information',
    icon: Network,
    href: '/ip',
    color: 'text-green-600 bg-green-50 dark:bg-green-950/50'
  },
  {
    title: 'Arbetsgivarkostnad',
    description: 'Beräkna total kostnad för arbetsgivare',
    icon: Calculator,
    href: '/lon',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50'
  },
  {
    title: 'OCR-nummer',
    description: 'Validera OCR-nummer med kontrollsiffra',
    icon: Hash,
    href: '/ocr',
    color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50'
  },
  {
    title: 'Feedback',
    description: 'Föreslå nya verktyg eller förbättringar',
    icon: MessageSquare,
    href: '/feedback',
    color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/50'
  }
];

export default function Homepage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Vardagslådan.se
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            Din digitala verktygslåda för vardagen i Sverige
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Snabba, enkla miniverktyg samlade på ett ställe: kolla din IP-adress, 
            räkna arbetsgivarkostnad och nettolön, konvertera valutor och enheter, 
            validera OCR- och personnummer (Luhn), hitta postnummer – och mer. 
            Enkelt, gratis och gjort för både privatpersoner och småföretagare.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Tillgängliga verktyg
          </h2>
          <p className="text-muted-foreground">
            Välj det verktyg du behöver från listan nedan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} to={tool.href} className="group">
                <Card className="h-full hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02] border-2 hover:border-primary/20">
                  <CardHeader className="space-y-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full group">
                      Öppna verktyg
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 rounded-2xl p-8 md:p-12 space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Varför Vardagslådan?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Vi har samlat de vanligaste vardagsverktygen på ett ställe så att du slipper leta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Säkert & Privat</h3>
              <p className="text-sm text-muted-foreground">
                All beräkning sker lokalt i din webbläsare. Ingen data skickas till servrar.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Snabbt & Enkelt</h3>
              <p className="text-sm text-muted-foreground">
                Inga registreringar, inga komplicerade formulär. Bara de verktyg du behöver.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Mobilvänligt</h3>
              <p className="text-sm text-muted-foreground">
                Fungerar perfekt på alla enheter - mobil, surfplatta och dator.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}