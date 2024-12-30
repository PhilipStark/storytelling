import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookService } from '../../services/book';

export function GenerateBook() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const book = await bookService.createBookWithApi(config);
      navigate(`/books/${book.id}`);
    } catch (error) {
      console.error('Error generating book:', error);
      setError('Failed to generate book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Generate Your Book</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-6">
          <label className="block text-gray-700 text-lg mb-2">
            What's your book idea?
          </label>
          <textarea
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your book idea..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold w-full
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
        >
          {loading ? 'Generating Book...' : 'Generate Book'}
        </button>
      </form>

      <p className="mt-4 text-gray-600 text-sm">
        Our AI will analyze your idea and create a complete book with optimal genre, style, and structure.
      </p>
    </div>
  );
}