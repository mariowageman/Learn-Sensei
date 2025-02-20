import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LearningRecommendations } from "@/components/learning/recommendations";
import { GraduationCap, Brain, Target, Sparkles } from "lucide-react";
import { Footer } from "@/components/footer";
import { TawkTo } from "@/components/TawkTo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <TawkTo />
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ 
          backgroundImage: 'url(/src/assets/hero-bg.jpg)',
          height: '1200px',
          '@media (max-width: 768px)': {
            height: '800px'
          }
        }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#111C2A] dark:text-white">
              Learn Sensei for Smarter Learning
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Get the right content instantly with AI-powered questions and video explanations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sensei">
              <Button size="lg" className="w-full sm:w-auto bg-[#3F3EED] hover:bg-[#3F3EED]/90 text-white">
                <Brain className="mr-2 h-5 w-5 text-white" />
                Enter Sensei Mode
              </Button>
            </Link>
            <Link href="/learning-paths">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#3F3EED] text-[#3F3EED] hover:bg-[#3F3EED]/10 dark:text-white dark:border-white">
                <GraduationCap className="mr-2 h-5 w-5 dark:text-white" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Learn Sensei?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-card">
              <Brain className="h-12 w-12 text-[#3F3EED] dark:text-[#3F3EED] mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
              <p className="text-muted-foreground">
                Personalized learning experience adapting to your pace and style
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Target className="h-12 w-12 text-[#3F3EED] dark:text-[#3F3EED] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Get real-time assessment and tailored suggestions for improvement
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <Sparkles className="h-12 w-12 text-[#3F3EED] dark:text-[#3F3EED] mb-4" />
              <h3 className="text-xl font-semibold mb-2">Diverse Content</h3>
              <p className="text-muted-foreground">
                Access curated courses from leading institutions and experts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <LearningRecommendations />
        </div>
      </section>

      <Footer />
    </div>
  );
}