import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-spam
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-spam check
    if (honeypot) {
      return;
    }

    const feedbackText = `
Namn: ${name}
E-post: ${email}
Ämne: ${subject}

Meddelande:
${message}

---
Skickat från Vardagslådan.se
    `.trim();

    // Try to open email client
    const emailSubject = encodeURIComponent(`Feedback: ${subject}`);
    const emailBody = encodeURIComponent(feedbackText);
    const mailtoLink = `mailto:feedback@vardagslaadan.se?subject=${emailSubject}&body=${emailBody}`;
    
    try {
      window.location.href = mailtoLink;
      toast({
        title: 'E-post öppnad',
        description: 'Din e-postklient borde nu öppnas med meddelandet',
      });
    } catch (error) {
      // Fallback: copy to clipboard
      copyToClipboard(feedbackText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Kopierat!',
        description: 'Feedback har kopierats till urklipp. Skicka det till feedback@vardagslaadan.se',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte kopiera till urklipp',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Feedback
          </h1>
        </div>
        <p className="text-muted-foreground">
          Föreslå nya verktyg, rapportera fel eller dela dina idéer för att förbättra Vardagslådan
        </p>
      </section>

      <div className="max-w-2xl mx-auto">
        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>Skicka feedback</CardTitle>
            <CardDescription>
              Vi värdesätter din återkoppling och dina förslag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anti-spam honeypot */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn (valfritt)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ditt namn"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-post (valfritt)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.se"
                  />
                  <p className="text-xs text-muted-foreground">
                    Om du vill att vi svarar på din feedback
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Ämne</Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="T.ex. Nytt verktyg: Valutaomvandlare"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Meddelande</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Beskriv ditt förslag, problem eller din idé..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Skicka feedback
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => copyToClipboard(`Ämne: ${subject}\n\n${message}`)}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Kopiera till urklipp
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Vi använder din e-postadress endast för att svara på din feedback och sparar 
                inte din information på något annat sätt.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Feedback Ideas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Idéer för feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-2">Förslag på nya verktyg:</h4>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Valutaomvandlare (SEK ↔ EUR/USD)</li>
                  <li>Enhetomvandlare (meter, liter, etc.)</li>
                  <li>Postnummervalidering och ortsökning</li>
                  <li>Organisationsnummervalidering</li>
                  <li>Skattetabellsökning</li>
                  <li>Semesterrättsberäkning</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Andra förbättringar:</h4>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Förbättrad mobilanpassning</li>
                  <li>Mörkt tema</li>
                  <li>Språkstöd (engelska)</li>
                  <li>Sparfunktioner för beräkningar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}