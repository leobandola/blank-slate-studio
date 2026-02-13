import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AiSummary = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summary');
      if (error) throw error;
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Erro ao gerar resumo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-medium animate-fade-in overflow-hidden">
      <CardHeader className="bg-gradient-primary text-primary-foreground">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5" />
            Resumo Inteligente (IA)
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={generateSummary}
            disabled={loading}
            className="text-primary-foreground hover:bg-white/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : summary ? (
              <RefreshCw className="h-4 w-4" />
            ) : null}
            {summary ? 'Atualizar' : 'Gerar Resumo'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!summary && !loading && (
          <div className="text-center py-6">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Clique em "Gerar Resumo" para obter uma análise inteligente das suas atividades
            </p>
          </div>
        )}
        {loading && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto mb-3 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analisando suas atividades...</p>
          </div>
        )}
        {summary && !loading && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {summary.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return <h4 key={i} className="text-sm font-bold mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
              }
              if (line.startsWith('- ') || line.startsWith('• ')) {
                return <li key={i} className="text-sm text-muted-foreground ml-4">{line.slice(2)}</li>;
              }
              if (line.trim()) {
                return <p key={i} className="text-sm text-foreground mb-1">{line.replace(/\*\*/g, '')}</p>;
              }
              return <br key={i} />;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
