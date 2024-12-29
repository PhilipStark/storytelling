import { BookCard } from '../ui/BookCard';

export function Examples() {
  const books = [
    {
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
      title: "The Last Horizon",
      genre: "Science Fiction",
      description: "A gripping tale of space exploration and human survival."
    },
    {
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
      title: "Whispers in the Mist",
      genre: "Mystery",
      description: "An atmospheric mystery set in a small coastal town."
    },
    {
      image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d",
      title: "The Heart's Journey",
      genre: "Romance",
      description: "A touching story of love, loss, and second chances."
    }
  ];

  return (
    <section id="examples" className="bg-purple-50 py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Books Created With storytelling.io</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, index) => (
            <BookCard key={index} {...book} />
          ))}
        </div>
      </div>
    </section>
  );
}