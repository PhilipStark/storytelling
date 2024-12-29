import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { GenerateBook } from './pages/books/generate';
import { BookDetails } from './pages/books/[id]';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/books/generate" element={<GenerateBook />} />
          <Route path="/books/:id" element={<BookDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;