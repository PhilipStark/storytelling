export function Pricing() {
  return (
    <section id="pricing" className="container mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-center mb-16">Choose Your Plan</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-2xl font-bold mb-4">Starter</h3>
          <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-gray-600">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Generate up to 3 books/month
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Basic plot templates
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Character development tools
            </li>
          </ul>
          <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors">
            Get Started
          </button>
        </div>

        <div className="bg-purple-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform scale-105">
          <div className="absolute -top-4 right-4 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold">
            POPULAR
          </div>
          <h3 className="text-2xl font-bold mb-4">Professional</h3>
          <div className="text-4xl font-bold mb-6">$79<span className="text-lg opacity-80">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2">✓</span>
              Unlimited book generation
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2">✓</span>
              Advanced plot templates
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2">✓</span>
              Deep character development
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2">✓</span>
              Genre-specific guidance
            </li>
          </ul>
          <button className="w-full bg-white text-purple-600 px-6 py-3 rounded-full hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
          <div className="text-4xl font-bold mb-6">$199<span className="text-lg text-gray-600">/mo</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Everything in Professional
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Custom AI training
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Priority support
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              White-label options
            </li>
          </ul>
          <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}