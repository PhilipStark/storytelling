import { AgentProgress as AgentProgressType } from '../../types/agents';
import { Sparkles, RefreshCcw, Archive } from 'lucide-react';

interface AgentProgressProps {
  agent: AgentProgressType;
}

export function AgentProgress({ agent }: AgentProgressProps) {
  const getStatusColor = () => {
    switch (agent.status) {
      case 'waiting':
        return 'bg-gray-200';
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'refining':
        return 'bg-yellow-500';
      case 'retrying':
        return 'bg-orange-500';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          <span className="font-medium capitalize">{agent.agent}</span>
          {agent.usingCache && (
            <div className="ml-2 flex items-center text-blue-600">
              <Archive className="w-4 h-4 mr-1" />
              <span className="text-sm">Cached</span>
            </div>
          )}
          {agent.attempt && agent.maxAttempts && (
            <div className="ml-2 flex items-center text-orange-600">
              <RefreshCcw className="w-4 h-4 mr-1" />
              <span className="text-sm">
                Attempt {agent.attempt}/{agent.maxAttempts}
              </span>
            </div>
          )}
        </div>
        {agent.score && (
          <span className="text-sm font-medium">
            Score: {agent.score.toFixed(1)}
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getStatusColor()} transition-all duration-500`}
          style={{ width: `${agent.progress}%` }}
        />
      </div>
      
      {agent.status === 'refining' && (
        <p className="text-sm text-yellow-600 mt-1">
          Refinando para atingir nota mínima de 9.5
        </p>
      )}
      
      {agent.status === 'retrying' && agent.backoffDelay && (
        <div className="mt-1">
          <p className="text-sm text-orange-600">
            Aguardando {agent.backoffDelay.toFixed(1)}s antes da próxima tentativa
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="h-1.5 rounded-full bg-orange-500 transition-all duration-1000"
              style={{ width: `${(agent.backoffDelay / 30) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
