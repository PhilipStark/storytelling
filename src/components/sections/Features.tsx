import { Sparkles, BookText, Trophy, Wand2, Brain, Target } from 'lucide-react';
import { FeatureCard } from '../ui/FeatureCard';

export function Features() {
  return (
    <section id="features" className="container mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold text-center mb-16">Craft Your Masterpiece</h2>
      <div className="grid md:grid-cols-3 gap-12">
        <FeatureCard 
          icon={<Sparkles className="h-8 w-8 text-purple-600" />}
          title="AI-Powered Writing"
          description="Generate complete novels with sophisticated AI that understands story structure, character development, and narrative arcs."
        />
        <FeatureCard 
          icon={<BookText className="h-8 w-8 text-purple-600" />}
          title="Complete Book Generation"
          description="Create full-length novels with chapters, character development, plot twists, and engaging dialogue."
        />
        <FeatureCard 
          icon={<Trophy className="h-8 w-8 text-purple-600" />}
          title="Bestseller Formula"
          description="Access proven storytelling frameworks and genre-specific templates to craft compelling narratives."
        />
        <FeatureCard 
          icon={<Wand2 className="h-8 w-8 text-purple-600" />}
          title="Character Development"
          description="Create deep, memorable characters with unique personalities, backstories, and character arcs."
        />
        <FeatureCard 
          icon={<Brain className="h-8 w-8 text-purple-600" />}
          title="Plot Generation"
          description="Generate intricate plot structures with compelling conflicts, twists, and satisfying resolutions."
        />
        <FeatureCard 
          icon={<Target className="h-8 w-8 text-purple-600" />}
          title="Genre Mastery"
          description="Specialized templates and guidance for every major genre, from romance to thriller to fantasy."
        />
      </div>
    </section>
  );
}