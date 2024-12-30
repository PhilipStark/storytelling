import { BookGenerationConfig, Book, GenerationProgress } from '../types/book';

interface BookConfig {
  title: string;
  description: string;
  genre: string;
  target_audience: string;
  style: string;
  tone: string;
  length: string;
}

class BookService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  private apiUrl = '/.netlify/functions/api';

  async createBook(config: BookGenerationConfig): Promise<Book> {
    try {
      const response = await fetch(`${this.baseUrl}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create book');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating book:', error);
      throw new Error('Failed to create book. Please try again.');
    }
  }

  async createBookWithApi(config: BookConfig) {
    try {
      const response = await fetch(`${this.apiUrl}/books/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: config.description }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate book');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in createBook:', error);
      throw error;
    }
  }

  async generateBook(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/books/${id}/generate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate book');
      }
    } catch (error) {
      console.error('Error generating book:', error);
      throw new Error('Failed to generate book. Please try again.');
    }
  }

  async getBookStatus(id: number): Promise<Book> {
    try {
      const response = await fetch(`${this.baseUrl}/books/${id}/status`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get book status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting book status:', error);
      throw new Error('Failed to get book status. Please try again.');
    }
  }

  async getBook(id: string) {
    try {
      const response = await fetch(`${this.apiUrl}/books/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getBook:', error);
      throw error;
    }
  }

  subscribeToProgress(id: number, onProgress: (data: GenerationProgress) => void): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/events/${id}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onProgress(data);
      } catch (error) {
        console.error('Error parsing event data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }
}

export const bookService = new BookService();