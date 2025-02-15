import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LearningRecommendations } from "@/components/learning/recommendations";
import { GraduationCap, Brain, Target, Sparkles, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3F3EED] to-[#3F3EED]/80">
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
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-[#3F3EED] text-[#3F3EED] hover:bg-[#3F3EED]/10">
                <GraduationCap className="mr-2 h-5 w-5" />
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

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Learn Sensei</h3>
              <p className="text-sm text-muted-foreground">
                Empowering learners worldwide with AI-powered education and personalized learning paths.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                  <Github className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/sensei">
                    <a className="text-sm text-muted-foreground hover:text-[#3F3EED]">Sensei Mode</a>
                  </Link>
                </li>
                <li>
                  <Link href="/learning-paths">
                    <a className="text-sm text-muted-foreground hover:text-[#3F3EED]">Learning Paths</a>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard">
                    <a className="text-sm text-muted-foreground hover:text-[#3F3EED]">Dashboard</a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Blog</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Support</a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Cookie Policy</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Learn Sensei. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <a href="mailto:contact@learnsensei.com" className="text-sm text-muted-foreground hover:text-[#3F3EED] flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contact@learnsensei.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}