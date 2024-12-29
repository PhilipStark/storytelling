interface BookCardProps {
  image: string;
  title: string;
  genre: string;
  description: string;
}

export function BookCard({ image, title, genre, description }: BookCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <span className="text-sm text-purple-600 font-semibold">{genre}</span>
        <h3 className="text-xl font-semibold mt-2 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}