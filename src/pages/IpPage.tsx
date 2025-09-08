import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Network, Globe, Clock, Monitor, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IpInfo {
  ip: string;
  userAgent: string;
  timezone: string;
  timestamp: string;
}

export default function IpPage() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fetchIpInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      setIpInfo({
        ip: data.ip,
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: new Date().toLocaleString('sv-SE')
      });
    } catch (error) {
      toast({
        title: 'Fel',
        description: 'Kunde inte hämta IP-information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpInfo();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Kopierat!',
        description: 'IP-adressen har kopierats till urklipp',
      });
      setTimeout(() => setCopied(false), 2000);
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
          <Network className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Min IP-adress
          </h1>
        </div>
        <p className="text-muted-foreground">
          Se din publika IP-adress och grundläggande nätverksinformation
        </p>
        <Badge variant="secondary" className="text-xs">
          Ingen geolokalisering • Inget sparas
        </Badge>
      </section>

      {/* IP Information Card */}
      <section className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Nätverksinformation
            </CardTitle>
            <CardDescription>
              Information om din internetanslutning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Hämtar IP-information...</span>
              </div>
            ) : ipInfo ? (
              <div className="space-y-4">
                {/* IP Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Publik IP-adress
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded-lg font-mono text-lg">
                      {ipInfo.ip}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(ipInfo.ip)}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Tidszon
                  </label>
                  <code className="block px-3 py-2 bg-muted rounded-lg">
                    {ipInfo.timezone}
                  </code>
                </div>

                {/* User Agent */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Monitor className="h-4 w-4" />
                    Webbläsare
                  </label>
                  <code className="block px-3 py-2 bg-muted rounded-lg text-xs break-all">
                    {ipInfo.userAgent}
                  </code>
                </div>

                {/* Timestamp */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Hämtad
                  </label>
                  <code className="block px-3 py-2 bg-muted rounded-lg">
                    {ipInfo.timestamp}
                  </code>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Kunde inte hämta IP-information</p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button onClick={fetchIpInfo} disabled={loading} variant="outline">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uppdaterar...
                  </>
                ) : (
                  'Uppdatera information'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Info Section */}
      <section className="max-w-2xl mx-auto">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Om IP-adresser
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Din publika IP-adress är vad som syns för webbsidor du besöker</li>
                <li>Den kan ändras när du startar om routern eller byter nätverk</li>
                <li>Vi lagrar ingen information och gör ingen geolokalisering</li>
                <li>Informationen hämtas direkt från ipify.org</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}