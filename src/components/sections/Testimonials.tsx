export function Testimonials() {
  return (
    <section id="testimonials" className="bg-gray-50 py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">What Authors Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                alt="Sarah Mitchell"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold">Sarah Mitchell</h4>
                <p className="text-gray-600">Romance Author</p>
              </div>
            </div>
            <p className="text-gray-600">
              "storytelling.io transformed my writing process. I completed my latest romance novel in half the time, and my readers love it!"
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                alt="David Chen"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold">David Chen</h4>
                <p className="text-gray-600">Sci-Fi Writer</p>
              </div>
            </div>
            <p className="text-gray-600">
              "The AI understands sci-fi tropes perfectly. It helped me create complex world-building and believable future technology."
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
                alt="Emily Parker"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="font-bold">Emily Parker</h4>
                <p className="text-gray-600">Mystery Author</p>
              </div>
            </div>
            <p className="text-gray-600">
              "The plot generation tools are incredible. They helped me create intricate mysteries that keep readers guessing until the end."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}