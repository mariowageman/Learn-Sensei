import { Link } from "wouter";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
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
  );
}
