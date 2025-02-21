import { Link } from "wouter";
import { ContinuousCarousel } from "@/components/ui/continuous-carousel";
import { AnimatedText } from "@/components/ui/animated-text";
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
      <section className="relative h-screen md:h-[800px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat h-full"
          style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full max-w-6xl mx-auto flex flex-col justify-end sm:pb-20 pb-[100px] px-4">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white flex flex-col sm:block">
              <span>Learn Sensei for</span>
              <span className="flex items-center justify-center gap-2">
                <AnimatedText words={["Smarter", "Effortless", "Adaptive"]} /> Learning
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
              Get the right content instantly with AI-powered questions and video explanations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/sensei">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#3F3EED] bg-[#3F3EED] text-white hover:bg-transparent hover:text-[#3F3EED] dark:border-[#3F3EED] dark:bg-[#3F3EED] dark:text-white dark:hover:bg-transparent dark:hover:text-[#3F3EED]">
                  <Brain className="mr-2 h-5 w-5 group-hover:text-[#3F3EED] dark:group-hover:text-[#3F3EED]" />
                  Enter Sensei Mode
                </Button>
              </Link>
              <Link href="/learning-paths">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#3F3EED] text-[#3F3EED] hover:bg-transparent hover:text-[#3F3EED] dark:bg-white dark:border-white dark:text-[#3F3EED] dark:hover:bg-transparent dark:hover:border-[#3F3EED] dark:hover:text-[#3F3EED]">
                  <GraduationCap className="mr-2 h-5 w-5 group-hover:text-[#3F3EED] dark:text-[#3F3EED] dark:group-hover:text-[#3F3EED]" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-[#F5F7FA] to-[#E4E9F2] dark:from-[#111C2A] dark:to-[#1A2C44] overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzRjNFRUQiIHN0b3Atb3BhY2l0eT0iMC4wNSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzgwMjZEOSIgc3RvcC1vcGFjaXR5PSIwLjA1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgMGgyMDB2MjAwSDB6IiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')]" />
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-gradient">
            Unlock Your Full Potential
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-black/20 border border-gray-200 dark:border-white/10 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_0_30px_rgba(63,62,237,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Brain className="h-16 w-16 text-[#3F3EED] mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">AI-Powered Learning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enjoy a personalized experience that adapts to your pace and style. Get tailored lessons designed to strengthen your skills and maximize progress.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-black/20 border border-gray-200 dark:border-white/10 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_0_30px_rgba(63,62,237,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Target className="h-16 w-16 text-[#3F3EED] mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">Instant Feedback</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Know exactly where you stand with real-time assessments and smart suggestions to help you improve faster than ever.
              </p>
            </div>
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-black/20 border border-gray-200 dark:border-white/10 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-[0_0_30px_rgba(63,62,237,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Sparkles className="h-16 w-16 text-[#3F3EED] mb-6 transform transition-transform group-hover:scale-110 group-hover:rotate-3" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">Expert-Curated Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access top-tier courses from leading educators and institutions, ensuring you're always learning from the best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Platforms Section */}
      <section className="relative overflow-hidden bg-white py-16 dark:bg-black">
        <div className="container relative mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            Trusted by Leading Education Platforms
          </h2>
          <div>
            <ContinuousCarousel />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F7FA] to-[#E4E9F2] dark:from-[#111C2A] dark:to-[#1A2C44] py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10 opacity-50" />
        <div className="container relative mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-800 dark:text-white md:text-4xl">
            How It Works
          </h2>

          {/* Steps Circle */}
          <div className="relative mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: "🎯",
                  title: "Take a Quiz",
                  description: "Answer AI-powered questions to assess your knowledge level"
                },
                {
                  icon: "🧠",
                  title: "AI Insights",
                  description: "Get personalized learning recommendations dynamically"
                },
                {
                  icon: "🎥",
                  title: "Watch Videos",
                  description: "Access smartly curated content based on your performance"
                },
                {
                  icon: "📈",
                  title: "Track Progress",
                  description: "Monitor your improvement with our futuristic dashboard"
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(63,62,237,0.3)]"
                  style={{
                    animation: `fadeInScale 0.5s ease-out ${index * 0.2}s both`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-100 dark:opacity-0 transition-opacity duration-300 dark:group-hover:opacity-100 group-hover:opacity-50" />
                  <span className="mb-4 block text-4xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{step.icon}</span>
                  <h3 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/sensei">
                <Button size="lg" className="border-2 border-[#3F3EED] bg-transparent text-[#3F3EED] hover:bg-[#3F3EED] hover:text-white dark:border-[#3F3EED] dark:bg-transparent dark:text-white dark:hover:bg-[#3F3EED] dark:hover:text-white transition-all duration-300 transform hover:scale-105">
                  <Brain className="mr-2 h-5 w-5 text-[#3F3EED] hover:text-white dark:text-white" />
                  Start Learning Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}