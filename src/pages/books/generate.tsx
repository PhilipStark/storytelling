import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../../services/book';
import { agentService } from '../../services/ai/agents/AgentService';
import { BookGenerationState } from '../../types/agents';
import { AgentProgress } from '../../components/ui/AgentProgress';

export function GenerateBook() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<BookGenerationState | null>(null);

  useEffect(() => {
    return () => {
      agentService.stopGeneration();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        title: '',
        description: prompt,
        genre: '',
        target_audience: '',
        style: '',
        tone: '',
        length: ''
      };

      const book = await bookService.createBook(config);
      
      // Start multi-agent generation process
      await agentService.startGeneration(book.id, (state) => {
        setGenerationState(state);
        
        // If all agents are complete and scores are above threshold, navigate to book
        if (state.metrics.overallScore >= 9.5 && 
            Object.values(state.agents).every(a => a.status === 'completed')) {
          navigate(`/books/${book.id}`);
        }
      });
    } catch (error) {
      console.error('Error generating book:', error);
      setError('Failed to generate book. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Generate Your Book</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            What's your book idea?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-40 text-base"
            required
            placeholder="Describe your book idea in a few sentences. Our AI will handle all the details!"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-purple-600 text-white px-6 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating your book...
            </>
          ) : (
            'Generate Book'
          )}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Our AI will analyze your idea and create a complete book with optimal genre, style, and structure.
        </p>
      </form>

      {generationState && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Generation Progress</h2>
          {Object.values(generationState.agents).map((agent) => (
            <AgentProgress key={agent.agent} agent={agent} />
          ))}
          
          {generationState.metrics.overallScore > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Quality Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Structure</span>
                  <p className="font-medium">{generationState.metrics.structure.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Writing Quality</span>
                  <p className="font-medium">{generationState.metrics.writingQuality.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Technical Aspects</span>
                  <p className="font-medium">{generationState.metrics.technicalAspects.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Overall Score</span>
                  <p className="font-medium">{generationState.metrics.overallScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}