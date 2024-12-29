import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-6 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-6">
        Create Your Next
        <span className="text-purple-600"> Bestseller</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Transform your ideas into captivating novels with AI-powered storytelling. 
        Generate complete books with rich characters, compelling plots, and engaging narratives.
      </p>
      <div className="flex justify-center space-x-4">
        <button 
          onClick={() => navigate('/books/generate')}
          className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          Start Writing Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
        <button 
          onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
          className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg hover:bg-purple-50 transition-colors"
        >
          View Examples
        </button>
      </div>
    </section>
  );
}