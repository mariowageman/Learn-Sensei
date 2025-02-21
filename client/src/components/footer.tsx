import { Link } from "wouter";
import { Instagram, Linkedin } from "lucide-react";
import { RiTwitterXFill } from "react-icons/ri";

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
              <a href="https://www.instagram.com/learnsenseiai/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://x.com/LearnSensei" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                <RiTwitterXFill className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/learn-sensei/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#3F3EED]">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sensei" className="text-sm text-muted-foreground hover:text-[#3F3EED]" onClick={() => window.scrollTo(0, 0)}>Sensei Mode</Link>
              </li>
              <li>
                <Link href="/learning-paths" className="text-sm text-muted-foreground hover:text-[#3F3EED]" onClick={() => window.scrollTo(0, 0)}>Learning Paths</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-[#3F3EED]" onClick={() => window.scrollTo(0, 0)}>Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://learnsensei.tawk.help/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Documentation</a>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-[#3F3EED">Blog</Link>
              </li>
              <li>
                <a href="mailto:support@learnsensei.com" className="text-sm text-muted-foreground hover:text-[#3F3EED]">Support</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-[#3F3EED]" onClick={() => window.scrollTo(0, 0)}>Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-[#3F3EED]" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-sm text-muted-foreground hover:text-[#3F3EED]" onClick={() => window.scrollTo(0, 0)}>Cookie Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Learn Sensei. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}