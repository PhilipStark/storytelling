import { BookGenerationConfig, Book, GenerationProgress } from '../types/book';

class BookService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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