import { BookOpenCheck, Twitter, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <BookOpenCheck className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold">storytelling.io</span>
            </div>
            <p className="text-gray-400">
              Empowering authors with AI-powered storytelling tools to create bestselling novels.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-purple-400">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-purple-400">Pricing</a></li>
              <li><a href="#examples" className="text-gray-400 hover:text-purple-400">Examples</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-purple-400">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 storytelling.io. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}