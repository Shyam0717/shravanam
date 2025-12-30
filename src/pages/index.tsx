import Link from 'next/link';
import { ArrowRight, Headphones, BookOpen, BarChart3, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-100 dark:bg-sage-900 text-sage-700 dark:text-sage-300 text-sm font-medium mb-6">
          <Heart className="w-4 h-4" />
          Hare Krishna
        </div>

        <h1 className="heading-1 text-4xl md:text-5xl lg:text-6xl mb-6 max-w-4xl mx-auto">
          Listen to{' '}
          <span className="text-gradient">Srila Prabhupada&apos;s</span>
          <br />
          Divine Lectures
        </h1>

        <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          Immerse yourself in the timeless wisdom of Bhagavad Gita As It Is.
          Track your spiritual progress, take notes, and deepen your understanding.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/lectures"
            className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-3"
          >
            Start Listening
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 btn-secondary text-lg px-8 py-3"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon={<Headphones className="w-6 h-6" />}
          title="300+ Lectures"
          description="Complete collection of Bhagavad Gita lectures from Srila Prabhupada, organized by chapter and verse."
        />
        <FeatureCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Track Progress"
          description="Mark lectures as listened, bookmark favorites, and monitor your spiritual journey over time."
        />
        <FeatureCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Take Notes"
          description="Record your insights and realizations. AI-powered summaries help you quickly review key points."
        />
      </div>

      {/* Quote Section */}
      <div className="glass-card p-8 md:p-12 text-center max-w-4xl mx-auto">
        <blockquote className="text-xl md:text-2xl text-foreground italic leading-relaxed mb-6">
          &ldquo;The chanting of the Hare Krishna mantra is the most sublime method for
          reviving our transcendental consciousness.&rdquo;
        </blockquote>
        <p className="text-foreground-muted font-medium">
          — His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card p-6">
      <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900 flex items-center justify-center text-sage-600 dark:text-sage-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-foreground-muted">{description}</p>
    </div>
  );
}
