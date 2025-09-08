import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Github, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const handleEmailClick = () => {
    window.location.href = 'mailto:kontakt@vardagslaadan.se?subject=Kontakt från Vardagslådan.se';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Kontakt
          </h1>
        </div>
        <p className="text-muted-foreground">
          Har du frågor, förslag eller behöver du hjälp? Vi hör gärna från dig.
        </p>
      </section>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Primary Contact */}
        <Card>
          <CardHeader>
            <CardTitle>E-post</CardTitle>
            <CardDescription>
              Bästa sättet att komma i kontakt med oss
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4 p-6 bg-muted/30 rounded-lg">
              <Mail className="h-12 w-12 text-primary mx-auto" />
              <div>
                <p className="font-mono text-lg text-foreground">
                  kontakt@vardagslaadan.se
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vi svarar vanligtvis inom 1-2 arbetsdagar
                </p>
              </div>
              <Button onClick={handleEmailClick} className="mt-4">
                <Mail className="mr-2 h-4 w-4" />
                Skicka e-post
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Tips:</strong> Beskriv gärna vilket verktyg du har frågor om och 
                vilken enhet/webbläsare du använder om det rör tekniska problem.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Andra sätt att höra av dig</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/feedback">
              <div className="flex items-center p-4 rounded-lg border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                <MessageSquare className="h-8 w-8 text-primary mr-4" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Feedback-formulär</h3>
                  <p className="text-sm text-muted-foreground">
                    För förslag på nya verktyg eller förbättringar
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <div className="flex items-center p-4 rounded-lg border-2 border-dashed">
              <Github className="h-8 w-8 text-muted-foreground mr-4" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">GitHub</h3>
                <p className="text-sm text-muted-foreground">
                  För tekniska frågor och buggrapporter (kommer snart)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Times */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Svarstider</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Allmänna frågor:</span>
                  <span>1-2 arbetsdagar</span>
                </div>
                <div className="flex justify-between">
                  <span>Tekniska problem:</span>
                  <span>Samma dag (vardagar)</span>
                </div>
                <div className="flex justify-between">
                  <span>Förslag och feedback:</span>
                  <span>3-5 arbetsdagar</span>
                </div>
              </div>
              
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>
                  <strong>Observera:</strong> Vi är ett litet team och svarar på e-post under 
                  svenska arbetstider. För akuta tekniska problem, prova att ladda om sidan 
                  eller rensa webbläsarens cache först.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Preview */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Vanliga frågor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground">Är verktygen gratis att använda?</p>
                <p className="text-muted-foreground">Ja, alla verktyg är helt gratis att använda.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Sparas mina beräkningar?</p>
                <p className="text-muted-foreground">Nej, all beräkning sker lokalt och inget sparas på våra servrar.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Kan jag föreslå nya verktyg?</p>
                <p className="text-muted-foreground">Absolut! Använd vårt feedback-formulär eller skicka e-post.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}