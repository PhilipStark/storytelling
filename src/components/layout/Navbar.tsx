import { BookOpenCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpenCheck className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">storytelling.io</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-600 hover:text-purple-600">Features</a>
          <a href="#pricing" className="text-gray-600 hover:text-purple-600">Pricing</a>
          <a href="#examples" className="text-gray-600 hover:text-purple-600">Examples</a>
          <a href="#testimonials" className="text-gray-600 hover:text-purple-600">Testimonials</a>
        </div>
        <button 
          onClick={() => navigate('/books/generate')}
          className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}