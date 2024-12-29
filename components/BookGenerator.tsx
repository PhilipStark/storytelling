import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

type AgentType = 'Outliner' | 'Writer' | 'Editor' | 'Critic';

export function BookGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<AgentType, string>>({
    Outliner: '',
    Writer: '',
    Editor: '',
    Critic: ''
  });
  const [error, setError] = useState<string | null>(null);

  const agents: AgentType[] = ['Outliner', 'Writer', 'Editor', 'Critic'];

  const generateBook = async () => {
    try {
      setGenerating(true);
      setError(null);
      let currentResult = '';

      for (const agent of agents) {
        setCurrentAgent(agent);
        setProgress((agents.indexOf(agent) * 100) / agents.length);

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            agent,
            previousResult: currentResult
          })
        });

        if (!response.ok) {
          throw new Error(`Error in ${agent} stage`);
        }

        const data = await response.json();
        currentResult = data.content;
        setResults(prev => ({ ...prev, [agent]: data.content }));
      }

      setProgress(100);
    } catch (err: any) {
      setError(err.message);
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
      setCurrentAgent(null);
    }
  };

  const getAgentStatus = (agent: AgentType) => {
    if (error) return 'error';
    if (!currentAgent && results[agent]) return 'complete';
    if (currentAgent === agent) return 'active';
    if (currentAgent && agents.indexOf(agent) < agents.indexOf(currentAgent)) return 'complete';
    return 'waiting';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Descreva sua ideia para o livro..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
            disabled={generating}
          />
          <Button
            onClick={generateBook}
            disabled={generating || !prompt}
            className="w-full"
          >
            {generating ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </span>
            ) : (
              'Gerar Livro'
            )}
          </Button>
        </div>
      </Card>

      {(generating || Object.values(results).some(Boolean)) && (
        <Card className="p-6">
          <div className="space-y-6">
            {agents.map((agent) => {
              const status = getAgentStatus(agent);
              return (
                <div key={agent} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{agent}</span>
                      {status === 'active' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {status === 'complete' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <Badge
                      variant={
                        status === 'complete' ? 'success' :
                        status === 'active' ? 'default' :
                        status === 'error' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {status === 'complete' ? 'Concluído' :
                       status === 'active' ? 'Processando' :
                       status === 'error' ? 'Erro' :
                       'Aguardando'}
                    </Badge>
                  </div>
                  <Progress 
                    value={
                      status === 'complete' ? 100 :
                      status === 'active' ? progress % 25 :
                      status === 'error' ? 100 :
                      0
                    } 
                  />
                  {results[agent] && (
                    <div className="p-4 mt-2 bg-gray-50 rounded-md">
                      <pre className="whitespace-pre-wrap text-sm">
                        {results[agent]}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BookGenerator;