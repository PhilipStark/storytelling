import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Book, BookStatus, GenerationProgress } from '../../types/book';
import { bookService } from '../../services/book';
import { GenerationStatus } from '../../components/books/GenerationStatus';
import { GenerationTimeline } from '../../components/books/GenerationTimeline';

export function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    // Initial book status
    bookService.getBookStatus(Number(id))
      .then(setBook)
      .catch(console.error);

    // Subscribe to progress updates
    const unsubscribe = bookService.subscribeToProgress(
      Number(id),
      (data: GenerationProgress) => {
        setProgress(data.message);
        if (data.stage === 'review' && book) {
          setBook({ ...book, status: BookStatus.COMPLETED });
        }
      }
    );

    return unsubscribe;
  }, [id]);

  if (!book) return <div>Loading...</div>;

  const timelineSteps = [
    { label: 'Planning', status: book.status === BookStatus.GENERATING ? 'current' : 'completed' },
    { label: 'Writing', status: 'upcoming' },
    { label: 'Review', status: 'upcoming' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{book.title}</h1>
      
      <GenerationTimeline steps={timelineSteps} />
      
      <GenerationStatus 
        status={book.status}
        progress={progress}
        onRetry={book.status === BookStatus.FAILED ? 
          () => bookService.generateBook(Number(id)) : 
          undefined
        }
      />

      {book.content && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Generated Content</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap">{JSON.stringify(book.content, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}